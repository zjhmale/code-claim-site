import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { Button, ButtonType } from "@/components/Button";
import { Wallet } from "@/components/Wallet";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

interface MainBoxProps {
  isConnected: boolean | undefined;
  isUnsupported: boolean | undefined;
}

export const MainBox = ({ isConnected, isUnsupported }: MainBoxProps) => {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <Confetti width={windowSize.width} height={windowSize.height} colors={["#DD95FF"]} hidden />
      <Box my={["24px", "0"]} w="100%">
        <Heading as="h1" color="white" fontSize={["44px", "96px"]} fontWeight="500">
          Airdrop
        </Heading>
        <Text
          mt="5"
          mb="8"
          color="white"
          fontSize={["20px", "24px"]}
          fontWeight="500"
          fontFamily="Zen Kaku Gothic New"
        >
          $CODE is the new governance token for Developer DAO. Connect your wallet to determine your
          airdrop eligibility.
        </Text>
        <Flex direction={["column", "row"]}>
          <Box mb={["4", "0"]} mr={["0", "7"]} w={["100%", "inherit"]}>
            <Wallet isConnected={isConnected} isUnsupported={isUnsupported} />
          </Box>
          <Button label="LEARN MORE" buttonType={ButtonType.Learn} />
        </Flex>
      </Box>
    </div>
  );
};
