import type { NextPage } from "next";
import Head from "next/head";
import { Box, Flex, SlideFade } from "@chakra-ui/react";
import { useAccount, useNetwork } from "wagmi";

import {
  ClaimCard,
  ClaimCardData,
  ClaimCardState,
} from "@/components/ClaimCard";
import { Logo } from "@/components/Logo";
import { MainBox } from "@/components/MainBox";
import airdropData from "@/airdrop_ui.json";

const airdrop: Record<
  string,
  { nft: number; voter: number; earlyContrib: number }
> = airdropData.airdrop;

const Home: NextPage = () => {
  const [{ data: networkData, error, loading }, switchNetwork] = useNetwork();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  const isConnected =
    typeof accountData !== "undefined" &&
    Object.entries(accountData).length > 0;

  // Format address
  let address = "";
  if (accountData?.address) {
    address = `${accountData.address.slice(0, 6)}...${accountData.address.slice(
      -4
    )}`;
  }

  const claimCardData: ClaimCardData = {
    state: ClaimCardState.unclaimed,
    address: accountData?.ens?.name || address || "",
    avatar: accountData?.ens?.avatar || "",
    allocations: {
      member: 0,
      voterOrPoap: 0,
      earlyContributor: 0,
      total: 0,
    },
  };

  if (accountData?.address && accountData.address in airdrop) {
    claimCardData.allocations.member = airdrop[accountData.address].nft;
    claimCardData.allocations.voterOrPoap = airdrop[accountData.address].voter;
    claimCardData.allocations.earlyContributor =
      airdrop[accountData.address].earlyContrib;

    claimCardData.allocations.total =
      claimCardData.allocations.member +
      claimCardData.allocations.voterOrPoap +
      claimCardData.allocations.earlyContributor;
  }

  return (
    <Box m="0" w="100vw" h="100vh" background="blue">
      <Head>
        <title>$CODE Claim Page</title>
      </Head>
      <Flex direction="row" flexWrap="wrap">
        <Box
          w={{ base: "100vw", lg: "50vw" }}
          h="100vh"
          m="0"
          pl={["24px", "5vw"]}
          pr={["40px", "8vw"]}
          background="#08010D"
        >
          <Box mt={["32px", "48px"]} mb="22vh">
            <Logo />
          </Box>
          <MainBox
            isConnected={isConnected}
            isUnsupported={!!networkData.chain?.unsupported}
          />
        </Box>
        <Flex
          w={{ base: "100vw", lg: "50vw" }}
          h="100vh"
          m="0"
          backgroundColor="#F1F0F5"
          align="center"
          justifyContent="center"
        >
          <SlideFade in={isConnected} offsetY="20px">
            <Box m={["24px", "10vw"]}>
              <ClaimCard data={claimCardData} />
            </Box>
          </SlideFade>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Home;
