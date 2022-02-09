import { useEffect, useState } from "react";
import { useBlockNumber, useWaitForTransaction } from "wagmi";

type BlockConfirmations = number | undefined;

const useConfirmations = (latestBlockHash: string | undefined): number | undefined => {
  const [{ data }] = useBlockNumber();
  const [confirmations, setConfirmations] = useState<BlockConfirmations>(0);
  const [{ data: waitTransaction }] = useWaitForTransaction({ hash: latestBlockHash });

  useEffect(() => {
    if (data && waitTransaction?.blockNumber) {
      let blockConfirmations = data - waitTransaction?.blockNumber;
      setConfirmations(blockConfirmations < 0 ? 0 : blockConfirmations);
    }
    return (): void => {};
  }, [waitTransaction]);

  return confirmations;
};

export default useConfirmations;
