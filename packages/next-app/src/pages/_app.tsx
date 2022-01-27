import "@fontsource/ibm-plex-mono";
import "@fontsource/zen-kaku-gothic-new";

import { theme } from "@/chakra.config";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider, chain, Chain, Connector } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import type { AppProps } from "next/app";
import { ethers } from "ethers";

const infuraId = process.env.NEXT_PUBLIC_INFURA_ID;
const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME || "localhost";

const chains: Chain[] = [];
switch (chainName.toLowerCase().trim()) {
  case "localhost":
    chains.push(chain.localhost);
    break;
  case "rinkeby":
    chains.push(chain.rinkeby);
    break;
  case "mainnet":
    chains.push(chain.mainnet);
    break;
  default:
    console.error("Unsupported chainName:", chainName);
    break;
}

// Set up connectors
const connectors = ({ chainId }: any) => {
  return [
    new InjectedConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        infuraId,
        qrcode: true,
      },
    }),
  ];
};

type GetProviderArgs = {
  chainId?: number;
  connector?: Connector;
};

// The following is a fix to get localhost provider working. Ref: https://github.com/tmm/wagmi/issues/71
const provider = ({ chainId, connector }: GetProviderArgs) => {
  console.log("getting provider", chainId, chainName);
  if (chainName.toLowerCase().trim() === "localhost") {
    const chain = connector?.chains.find((x: any) => x.id == 31337)?.rpcUrls[0];
    return new ethers.providers.JsonRpcProvider(chain);
  }
  return ethers.getDefaultProvider(chainId, {
    infura: infuraId,
  });
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider autoConnect connectors={connectors} provider={provider}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
