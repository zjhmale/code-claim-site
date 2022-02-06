import { SetStateAction, useEffect, useState, Dispatch } from "react";
import { useBlockNumber } from "wagmi";

type BlockConfirmations = number | undefined;
type Confirmations = [BlockConfirmations, Dispatch<SetStateAction<BlockConfirmations>>]

const useConfirmations = (): Confirmations => {
  const [{ data }] = useBlockNumber();
  const [confirmations, setConfirmations] = useState<BlockConfirmations>(0);

  useEffect(() => {
    setConfirmations(data)
    return (): void => {};
  }, []);

  return [confirmations, setConfirmations];
};

export default useConfirmations;
