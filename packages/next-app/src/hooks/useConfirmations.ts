import { SetStateAction, useEffect, useState, Dispatch } from "react";
import { useBlockNumber, useWaitForTransaction } from "wagmi";

type BlockConfirmations = {
  currentBlock: number | undefined;
  transactionBlock: number | undefined;
  blockConfirmations: number | undefined;
};

type Confirmations = [BlockConfirmations, Dispatch<SetStateAction<BlockConfirmations>>];

const useConfirmations = (hash: string): number | undefined => {
  const [{ data }] = useBlockNumber();
  const [{ data: transactionData }, wait] = useWaitForTransaction({ hash });
  const [confirmations, setConfirmations] = useState<BlockConfirmations>({ currentBlock: 0, transactionBlock: 0, blockConfirmations: 0 });

  useEffect(() => {
    setConfirmations({ ...confirmations, currentBlock: data });
    return (): void => {};
  }, []);

  return confirmations.blockConfirmations;
};

export default useConfirmations;
