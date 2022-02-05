import { useEffect, useState } from "react";
import { useBlockNumber } from "wagmi";

type BlockConfirmations = number | undefined;

const useConfirmations = (): BlockConfirmations => {
  const [{ data, error, loading }, getBlockNumber] = useBlockNumber();
  const [confirmations, setConfirmations] = useState<BlockConfirmations>(0);

  useEffect(() => {
    setConfirmations(data)
    return (): void => {};
  }, []); // Empty array ensures that effect is only run on mount

  return confirmations;
};

export default useConfirmations;
