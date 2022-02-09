import type { NextPage } from "next";
import Head from "next/head";
import { Box, Flex, SlideFade, Image, Center, useBreakpointValue } from "@chakra-ui/react";
import { useAccount, useNetwork } from "wagmi";

import { ClaimCard } from "@/components/ClaimCard";
import { Logo } from "@/components/Logo";
import { MainBox } from "@/components/MainBox";
import useConfirmations from "@/hooks/useConfirmations";
import { Confirmations } from "@/components/Confirmations";

const Home: NextPage = () => {
  const [{ data: networkData, error, loading }] = useNetwork();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  const isMobile = useBreakpointValue({ base: true, lg: false });

  const isConnected = typeof accountData !== "undefined" && Object.entries(accountData).length > 0;

  return (
    <Box
      m="0"
      w="100vw"
      h="100vh"
      background="blue"
      scrollSnapType={{ base: "y mandatory", lg: "none" }}
      overflowY={{ base: "scroll", lg: "clip" }}
    >
      <Head>
        <title>$CODE Claim Page</title>
      </Head>

      <Flex direction="row" flexWrap="wrap" h="100vh">
        <Box
          w={{ base: "100vw", lg: "50vw" }}
          h="100vh"
          m="0"
          pl={["24px", "5vw"]}
          pr={["40px", "8vw"]}
          background="#08010D"
          scrollSnapAlign={{ base: "start", lg: "none" }}
          position="relative"
        >
          <Box mt={["32px", "48px"]} mb="22vh">
            <Logo />
          </Box>

          <MainBox isConnected={isConnected} isUnsupported={!!networkData.chain?.unsupported} />
          <Center position="absolute" bottom="0" left="0" right="0">
            {isMobile && (
              <Image
                alignSelf="end"
                mb="5"
                src="assets/arrow-down.svg"
                alt="scroll down"
                w="34px"
                h="34px"
              />
            )}
          </Center>
        </Box>

        <Flex
          w={{ base: "100vw", lg: "50vw" }}
          h="100vh"
          m="0"
          backgroundColor="#F1F0F5"
          align="center"
          justifyContent="center"
          direction="column"
          scrollSnapAlign={{ base: "start", lg: "none" }}
          position="relative"
        >
          <Center position="absolute" top="0" left="0" right="0">
            {isMobile && (
              <Image
                alignSelf="end"
                mt="5"
                src="assets/arrow-up.svg"
                alt="scroll up"
                w="34px"
                h="34px"
              />
            )}
          </Center>
          <SlideFade in={isConnected} offsetY="20px">
            <Box m={["24px", "10vw"]}>
              <ClaimCard />
            </Box>
          </SlideFade>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Home;
