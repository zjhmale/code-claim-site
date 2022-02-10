// FIXME: add real values (might be moved to a config file later)
const tokenAddress = "";
const tokenSymbol = "CODE";
const tokenDecimals = 18;
const tokenImage = "";

export async function addCodeToken(ethereum: any) {
  try {
    await ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: tokenSymbol,
          decimals: tokenDecimals,
          image: tokenImage,
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
}
