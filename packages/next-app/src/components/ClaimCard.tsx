import { Box, Button, Flex, Image, Spacer, Text } from "@chakra-ui/react";
import { MouseEventHandler, useEffect } from "react";
import { useContract, useContractRead, useProvider, useSigner } from "wagmi";

import { CODEToken, CODEToken__factory } from "@/typechain";
import { getContractAddress } from "@/utils";
import useContractInfo from "@/hooks/useContractInfo";

export enum ClaimCardState {
  disconnected,
  unclaimed,
  isClaiming,
  claimed,
}

export interface ClaimCardData {
  state: ClaimCardState;
  address: string;
  avatar: string;
  allocations: {
    member: string;
    voterOrPoap: string;
    earlyContributor: string;
    total: string;
  };
}

const Avatar = () => {
  return (
    <Box
      background="gray.200"
      w={["96px", "120px"]}
      h={["96px", "120px"]}
      borderRadius="16px"
    />
  );
};

const ButtonPlaceholder = () => (
  <Box background="gray.200" borderRadius="12px" w="100%" h="56px" mt="24px" />
);

const ClaimButton = ({
  label,
  onClick,
}: {
  label: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}) => (
  <Button
    background="#08010D"
    borderRadius="12px"
    color="#FFF"
    fontSize={["16px", "18px"]}
    fontWeight="900"
    w="100%"
    h="56px"
    mt="24px"
    _active={{}}
    _hover={{
      transform:
        "translate3d(0px, -2px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
      transformStyle: "preserve-3d",
    }}
    onClick={onClick}
  >
    <Text>
      CLAIM{" "}
      <span style={{ fontFamily: "IBM Plex Mono", fontWeight: 600 }}>
        {label}
      </span>{" "}
      TOKENS
    </Text>
  </Button>
);

interface HeaderData {
  address: string;
  image: string;
  showLabel: boolean;
  showPlaceholder: boolean;
}

const Header = ({ address, image, showLabel, showPlaceholder }: HeaderData) => (
  <Flex align="center">
    <Avatar />
    <Flex direction="column" ml={["20px", "32px"]}>
      {showLabel && (
        <Flex align="center">
          <Image
            src="assets/eligible-check.svg"
            alt="check"
            w="20px"
            h="20px"
            mr="8px"
          />
          <Text
            bgClip="text"
            bgGradient="linear(to-r, #AD00FF, #4E00EC)"
            fontSize={["16px", "18px"]}
            fontWeight="500"
          >
            ELIGIBLE
          </Text>
        </Flex>
      )}
      <Text
        color="#08010D"
        fontSize={["32px", "42px"]}
        fontWeight="500"
        mt="-8px"
      >
        {address}
      </Text>
    </Flex>
  </Flex>
);

const Position = ({
  title,
  value,
  isBig = false,
}: {
  title: string;
  value: string;
  isBig: boolean;
}) => (
  <Flex direction="column">
    <Flex direction="row" align="baseline">
      <Text fontSize={isBig ? "20px" : "16px"} fontWeight="500">
        {title}
      </Text>
      <Spacer />
      <Text
        fontFamily="IBM Plex Mono"
        fontSize={isBig ? "32px" : "24px"}
        fontWeight="400"
      >
        {value}
      </Text>
    </Flex>
    <Box border="1px dashed #4E4853" />
  </Flex>
);

const contractAddress = getContractAddress();

export const ClaimCard = (props: { data: ClaimCardData }) => {
  const { address, state, allocations } = props.data;
  const positions = [
    { title: "Minted D4R NFT", value: allocations.member },
    { title: "Pre Season 0 activity", value: allocations.voterOrPoap },
    { title: "Early Contributor", value: allocations.earlyContributor },
  ];

  const [{ data: signer, error, loading }] = useSigner();
  const contract = useContract<CODEToken>({
    addressOrName: contractAddress,
    contractInterface: CODEToken__factory.abi,
    signerOrProvider: signer,
  });

  const { claimPeriodEnds } = useContractInfo();
  console.log(claimPeriodEnds);

  return (
    <Flex
      w="100%"
      backdropFilter="blur(300px)"
      background="rgba(255, 255, 255, 0.5)"
      border="3px solid #DEDEDE"
      borderRadius="24px"
      box-shadow="inset 0px 0px 100px rgba(255, 255, 255, 0.25)"
      direction="column"
      p="24px"
    >
      <Header
        address={address}
        image=""
        showLabel={state !== ClaimCardState.disconnected}
        showPlaceholder={state === ClaimCardState.disconnected}
      />
      <Flex direction="column" mt="8" mb="8">
        {positions.map((pos, index) => {
          return (
            <Box key={index} my="2">
              <Position title={pos.title} value={pos.value} isBig={false} />
            </Box>
          );
        })}
        <Box mt="6">
          <Position
            title="$CODE allocation"
            value={allocations.total}
            isBig={true}
          />
        </Box>
      </Flex>
      {state === ClaimCardState.disconnected ? (
        <ButtonPlaceholder />
      ) : (
        <ClaimButton
          label={allocations.total}
          onClick={async () => {
            console.warn("TODO CLAIM");

            // TODO need to numTokens & create the proof. Similar to how it's done in packages\hardhat\test\CODEToken.test.ts
            //const res = await contract.claimTokens()
          }}
        />
      )}
    </Flex>
  );
};
