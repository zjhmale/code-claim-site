import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useBlockNumber, useWaitForTransaction } from "wagmi";

type BlockConfirmations = number | undefined;

const useConfirmations = (txHash: string | undefined): number | undefined => {
  const [{ data: currentBlockNumber }] = useBlockNumber({ watch: true });
  const [{ data: waitTransaction }] = useWaitForTransaction({
    hash: txHash,
  });

  const [confirmations, setConfirmations] = useState<BlockConfirmations>(0);

  useEffect(() => {
    if (
      typeof currentBlockNumber !== "undefined" &&
      waitTransaction?.blockNumber
    ) {
      let blockConfirmations = currentBlockNumber - waitTransaction.blockNumber;
      setConfirmations(blockConfirmations < 0 ? 0 : blockConfirmations);
    }
  }, [waitTransaction, currentBlockNumber]);

  return confirmations;
};

export default useConfirmations;
