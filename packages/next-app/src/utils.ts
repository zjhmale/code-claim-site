export const hasEthereum = () =>
  typeof window !== "undefined" && typeof window.ethereum !== "undefined";

export const getContractAddress = () =>
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x5FbDB2315678afecb367f032d93F642f64180aa3";
