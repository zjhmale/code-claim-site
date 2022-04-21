import { Box, Flex, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAccount, useSigner, useWaitForTransaction } from "wagmi";
import MerkleTree from "merkletreejs";
import { ethers } from "ethers";
import keccak256 from "keccak256";
import localforage from "localforage";
import { useTimeout } from "usehooks-ts";

import { ClaimCODE__factory } from "@/typechain";
import { getContractAddress, maskWalletAddress } from "@/utils";
import useConfirmations from "@/hooks/useConfirmations";

import airdropData from "../data/airdrop";
import { addCodeToken } from "../utils/add-token";
import { Header, ClaimedView, UnclaimedView } from "./ClaimCardComponents";
import { ConfirmToast } from "./toasts/confirm";
import { ErrorToast } from "./toasts/error";

const TOKEN_DECIMALS = 18;

const airdrop: Record<
  string,
  { nft: number; voter: number; earlyContrib: number }
> = airdropData.airdrop;

// Helper function to generate leafs
function generateLeaf(address: string, value: string): Buffer {
  return Buffer.from(
    // Hash in appropriate Merkle format
    ethers.utils
      .solidityKeccak256(["address", "uint256"], [address, value])
      .slice(2),
    "hex",
  );
}

// Setup merkle tree
const merkleTree = new MerkleTree(
  Object.entries(airdrop).map(([address, allocation]) =>
    generateLeaf(
      ethers.utils.getAddress(address),
      ethers.utils
        .parseUnits(
          (
            allocation.nft +
            allocation.voter +
            allocation.earlyContrib
          ).toString(),
          TOKEN_DECIMALS,
        )
        .toString(),
    ),
  ),
  keccak256,
  {
    sortPairs: true,
  },
);

// This is a port of the verify logic in  packages\hardhat\src\MerkleProof.sol
function verify(
  proof: string[],
  root: string,
  leaf: string,
): [boolean, number] {
  let computedHash = Buffer.from(leaf.slice(2), "hex");
  let index = 0;

  for (let i = 0; i < proof.length; i++) {
    index *= 2;
    const proofElement = Buffer.from(proof[i].slice(2), "hex");

    if (computedHash.toString("hex") <= proofElement.toString("hex")) {
      // Hash(current computed hash + current element of the proof)
      computedHash = Buffer.from(
        ethers.utils
          .solidityKeccak256(
            ["bytes32", "bytes32"],
            [
              "0x" + computedHash.toString("hex").padStart(64, "0"),
              "0x" + proofElement.toString("hex").padStart(64, "0"),
            ],
          )
          .slice(2),
        "hex",
      );
    } else {
      // Hash(current element of the proof + current computed hash)
      computedHash = Buffer.from(
        ethers.utils
          .solidityKeccak256(
            ["bytes32", "bytes32"],
            [
              "0x" + proofElement.toString("hex").padStart(64, "0"),
              "0x" + computedHash.toString("hex").padStart(64, "0"),
            ],
          )
          .slice(2),
        "hex",
      );

      index += 1;
    }
  }

  // Check if the computed hash (root) is equal to the provided root
  return ["0x" + computedHash.toString("hex") === root, index];
}

function getMerkleTreeValues(address: string, tokenAmount: number) {
  const numTokens = ethers.utils
    .parseUnits(tokenAmount.toString(), TOKEN_DECIMALS)
    .toString();

  const leaf = generateLeaf(ethers.utils.getAddress(address), numTokens);
  const proof = merkleTree.getHexProof(leaf);

  return { leaf, proof, numTokens };
}

export enum ClaimCardState {
  disconnected,
  unclaimed,
  isClaiming,
  claimed,
  notEligible,
}

const contractAddress = getContractAddress();

export const ClaimCard = ({
  setConfetti,
}: {
  setConfetti: CallableFunction;
}) => {
  const [cardState, setCardState] = useState(ClaimCardState.disconnected);

  const [{ data: signer, error, loading }] = useSigner();
  const [{ data: accountData }] = useAccount({
    fetchEns: true,
  });

  const toast = useToast();

  // Remove confetti after some delay that's set on activation
  const [confettiDelay, setConfettiDelay] = useState<null | number>(null);
  useTimeout(() => setConfetti({ state: false }), confettiDelay);

  const [claimDate, setClaimDate] = useState(new Date());
  const [txHash, setTxHash] = useState<undefined | string>();

  const [{ data: waitTransaction }] = useWaitForTransaction({
    hash: txHash,
  });
  useEffect(() => {
    async function getThing() {
      if (waitTransaction?.blockNumber) {
        const block = await signer?.provider?.getBlock(
          waitTransaction?.blockNumber,
        );
        if (block?.timestamp) {
          setClaimDate(new Date(block.timestamp * 1000));
        }
      }
    }
    getThing();
  }, [waitTransaction, signer]);

  const allocations =
    accountData?.address &&
    ethers.utils.getAddress(accountData.address) in airdrop
      ? airdrop[ethers.utils.getAddress(accountData.address)]
      : { nft: 0, voter: 0, earlyContrib: 0 };

  const totalAllocation =
    allocations.nft + allocations.voter + allocations.earlyContrib;

  const positions = [
    { title: "Minted D4R NFT", value: allocations.nft },
    { title: "Pre Season 0 activity", value: allocations.voter },
    { title: "Early Contributor", value: allocations.earlyContrib },
  ];

  const isEligible = totalAllocation > 0;

  // Format address
  let formattedAddress = "";
  if (accountData?.address) {
    formattedAddress = maskWalletAddress(accountData.address);
  }

  // OnMount
  useEffect(() => {
    async function getTxHash() {
      const loadedTxHash = await localforage.getItem<string | undefined>(
        "code_claim_tx_hash",
      );
      if (loadedTxHash) setTxHash(loadedTxHash);
    }

    getTxHash();
  }, []);

  const blockConfirmations = useConfirmations(txHash, 20);

  // Effect to set initial state after account connected
  useEffect(() => {
    const checkAlreadyClaimed = async () => {
      if (signer && cardState === ClaimCardState.disconnected) {
        if (!isEligible) {
          setCardState(ClaimCardState.notEligible);
        } else {
          // Check whether already claimed

          const accountAddress = await signer.getAddress();

          const { leaf, proof } = getMerkleTreeValues(
            accountAddress,
            totalAllocation,
          );

          const [isVerified, index] = verify(
            proof,
            merkleTree.getHexRoot(),
            "0x" + leaf.toString("hex"),
          );

          if (!isVerified) return console.error("Couldn't verify proof!");

          const tokenContract = ClaimCODE__factory.connect(
            contractAddress,
            signer,
          );
          const isClaimed = await tokenContract.isClaimed(index);

          if (isClaimed) {
            setConfetti({ state: true });
            setConfettiDelay(3000);
          }

          setCardState(
            isClaimed ? ClaimCardState.claimed : ClaimCardState.unclaimed,
          );
        }
      }
    };

    checkAlreadyClaimed();
  }, [signer, cardState, isEligible, totalAllocation, setConfetti]);

  const addCodeToMetaMask = async () => {
    if (window.ethereum === undefined) return;
    await addCodeToken(window.ethereum);
  };

  const onClickClaim = async () => {
    if (!isEligible) return console.warn("Not eligibile!");
    if (!signer) return console.warn("Not connected!");

    const tokenContract = ClaimCODE__factory.connect(contractAddress, signer);

    const contractMerkleRoot = await tokenContract.merkleRoot();

    if (merkleTree.getHexRoot() !== contractMerkleRoot)
      throw new Error("Local & Contract merkle root's aren't equal!");

    const accountAddress = await signer.getAddress();

    const { proof, numTokens } = getMerkleTreeValues(
      accountAddress,
      totalAllocation,
    );

    try {
      setCardState(ClaimCardState.isClaiming);
      const tx = await tokenContract.claimTokens(numTokens, proof);
      await tx.wait(1);

      setCardState(ClaimCardState.claimed);

      toast({
        position: "bottom-right",
        duration: null,
        render: () => (
          <ConfirmToast
            message={`Successfully claimed ${totalAllocation} CODE tokens.`}
            link={`https://etherscan.io/tx/${tx.hash}`}
            link_message="View TX on Etherscan"
          />
        ),
      });

      setConfetti({ state: true });
      setConfettiDelay(3000);

      setTxHash(tx.hash);
      await localforage.setItem("code_claim_tx_hash", tx.hash);
    } catch (e: any) {
      setCardState(ClaimCardState.unclaimed);

      toast({
        position: "bottom-right",
        render: () => (
          <ErrorToast message={e?.message ?? "Error while claiming."} />
        ),
      });

      console.error(`Error when claiming tokens: ${e}`);
      console.log(e);
    }
  };

  const headerData = {
    address: accountData?.ens?.name || formattedAddress || "",
    image: accountData?.ens?.avatar || "",
    showLabel:
      cardState !== ClaimCardState.disconnected &&
      cardState !== ClaimCardState.notEligible,
    showPlaceholder: cardState === ClaimCardState.disconnected,
  };

  return (
    <Flex
      w={["100%", "560px"]}
      backdropFilter="blur(300px)"
      background="rgba(255, 255, 255, 0.8)"
      border="3px solid #DEDEDE"
      borderRadius="24px"
      box-shadow="inset 0px 0px 100px rgba(255, 255, 255, 0.25)"
      direction="column"
    >
      <Box p="24px">
        <Header data={headerData} />
      </Box>
      {cardState === ClaimCardState.claimed && (
        <ClaimedView
          blockConfirmations={blockConfirmations}
          claimDate={claimDate.toLocaleDateString(
            window?.navigator?.language || "en-UK",
            {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
            },
          )}
          totalAllocation={totalAllocation.toString()}
          onAddCodeToMetaMask={addCodeToMetaMask}
          onViewTransaction={() =>
            window.open(`https://etherscan.io/tx/${txHash}`, "_blank")
          }
        />
      )}
      {cardState !== ClaimCardState.claimed && (
        <UnclaimedView
          cardState={cardState}
          positions={positions}
          totalAllocation={totalAllocation.toString()}
          onClickClaim={onClickClaim}
        />
      )}
    </Flex>
  );
};
