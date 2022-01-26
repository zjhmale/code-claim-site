import "@fontsource/ibm-plex-mono";
import "@fontsource/zen-kaku-gothic-new";

import { theme } from "@/chakra.config";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider, chain, defaultChains, Chain } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import type { AppProps } from "next/app";

const infuraId = process.env.NEXT_PUBLIC_WALLET_CONNECT_ID;
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
      options: {
        infuraId,
        qrcode: true,
      },
    }),
  ];
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider autoConnect connectors={connectors}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default MyApp;
