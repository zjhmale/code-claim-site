import "@fontsource/ibm-plex-mono";
import "@fontsource/zen-kaku-gothic-new";

import { theme } from "@/chakra.config";
import { ChakraProvider } from "@chakra-ui/react";
import { Provider, chain, defaultChains } from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import { WalletConnectConnector } from "wagmi/connectors/walletConnect";

import type { AppProps } from "next/app";

const infuraId = process.env.WALLET_CONNECT_ID;
const chains = [chain.mainnet];
// Set up connectors
const connectors = ({ chainId }: any) => {
  const rpcUrl = chains.find((x) => x.id === chainId)?.rpcUrls?.[0] ?? chain.mainnet.rpcUrls[0];
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
