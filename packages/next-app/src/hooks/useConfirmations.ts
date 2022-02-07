import { useEffect, useState } from "react";
import { useBlockNumber, useWaitForTransaction } from "wagmi";

type BlockConfirmations = number | undefined;

const useConfirmations = (blockHash: string | undefined): number | undefined => {
  const [{ data }] = useBlockNumber();
  const [confirmations, setConfirmations] = useState<BlockConfirmations>(0);
  const [{ data: waitTransaction }] = useWaitForTransaction({ hash: blockHash });

  useEffect(() => {
    if (data && waitTransaction?.blockNumber) {
      setConfirmations(waitTransaction?.blockNumber - data);
    }
    return (): void => {};
  }, [waitTransaction]);

  return confirmations;
};

export default useConfirmations;
