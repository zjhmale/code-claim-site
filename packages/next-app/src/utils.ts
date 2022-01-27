export const hasEthereum = () => typeof window !== "undefined" && typeof window.ethereum !== "undefined";

export const maskWalletAddress = (account: string | undefined) =>
  account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "-";
