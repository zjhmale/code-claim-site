import type { NextPage } from "next";
import Head from "next/head";
import {
  Box,
  Flex,
  SlideFade,
  Image,
  Center,
  useBreakpointValue,
} from "@chakra-ui/react";
import { useAccount, useNetwork } from "wagmi";

import { ClaimCard } from "@/components/ClaimCard";
import { Logo } from "@/components/Logo";
import { MainBox } from "@/components/MainBox";

const Home: NextPage = () => {
  const [{ data: networkData, error, loading }, switchNetwork] = useNetwork();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  const sm = "web";
  const breakpointValue = useBreakpointValue({ base: "mobile", sm });
  const isMobile = breakpointValue !== sm;

  const isConnected =
    typeof accountData !== "undefined" &&
    Object.entries(accountData).length > 0;

  return (
    <Box m="0" w="100vw" h="100vh" background="blue">
      <Head>
        <title>$CODE Claim Page</title>
      </Head>
      <Flex
        direction="row"
        flexWrap="wrap"
        h="100vh"
        scrollSnapType="y mandatory"
        overflowY="scroll"
      >
        <Flex
          w={{ base: "100vw", lg: "50vw" }}
          h="100vh"
          pl={["24px", "5vw"]}
          pr={["24px", "8vw"]}
          background="#08010D"
          scrollSnapAlign="start"
          direction="column"
          position="relative"
        >
          <Box mt={["32px", "48px"]}>
            <Logo />
          </Box>

          <Flex h="100vh" alignItems="center">
            <MainBox
              isConnected={isConnected}
              isUnsupported={!!networkData.chain?.unsupported}
            />
          </Flex>

          {isMobile && (
            <Center position="absolute" bottom="0" left="0" right="0">
              <Image
                alignSelf="end"
                mb="5"
                src="assets/arrow-down.svg"
                alt="scroll down"
                w="34px"
                h="34px"
              />
            </Center>
          )}
        </Flex>
        <Flex
          w={{ base: "100vw", lg: "50vw" }}
          h="100vh"
          m="0"
          backgroundColor="#F1F0F5"
          align="center"
          justifyContent="center"
          scrollSnapAlign="start"
          position="relative"
        >
          <SlideFade in={isConnected} offsetY="20px">
            <Box m={["24px", "10vw"]} h="100vh">
              {isMobile && (
                <Center position="absolute" top="0" left="0" right="0">
                  <Image
                    alignSelf="end"
                    mt="5"
                    src="assets/arrow-up.svg"
                    alt="scroll up"
                    w="34px"
                    h="34px"
                  />
                </Center>
              )}

              <Flex h="100vh" alignItems="center">
                <ClaimCard />
              </Flex>
            </Box>
          </SlideFade>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Home;
