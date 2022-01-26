import Confetti from "react-confetti";
import useWindowDimensions from "@/hooks/useWindowDimensions";

import { Button } from "@/components/Button";
import { Wallet } from "@/components/Wallet";
import { Box, Flex, Heading, Text } from "@chakra-ui/react";

interface MainBoxProps {
  isConnected: boolean;
  isUnsupported: boolean;
}

export const MainBox = ({ isConnected, isUnsupported }: MainBoxProps) => {
  const primaryButtonProps = {
    w: "100%",
  };

  const { width, height } = useWindowDimensions();

  console.log(width, height);

  return (
    <div>
      <Confetti width={width} height={height} hidden />
      <Box my={["24px", "0"]} w="100%">
        <Heading
          as="h1"
          color="white"
          fontSize={["44px", "96px"]}
          fontWeight="500"
        >
          Airdrop
        </Heading>
        <Text
          mt="5"
          mb="8"
          color="white"
          fontSize={["20px", "24px"]}
          fontWeight="500"
        >
          <span style={{ fontStyle: "italic" }}>$CODE</span> is the new
          governance token for Developer DAO. Connect your wallet to determine
          your airdrop eligibility.
        </Text>
        <Flex direction={["column", "row"]}>
          <Box mb={["4", "0"]} mr={["0", "7"]} w={["100%", "inherit"]}>
            <Wallet isConnected={isConnected} isUnsupported={isUnsupported} />
          </Box>
          <Button label="LEARN MORE" />
        </Flex>
      </Box>
    </div>
  );
};
