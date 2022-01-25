import { Button } from "@/components/Button";
import { useConnect, useNetwork } from "wagmi";
import { Box, Text, HStack } from "@chakra-ui/react";

interface WalletProps {
  isConnected: boolean;
  isUnsupported: boolean;
}

export const Wallet = ({ isConnected, isUnsupported }: WalletProps) => {
  const [{ data: connectData, error: connectError }, connect] = useConnect();
  const [{ data, error, loading }, switchNetwork] = useNetwork();

  if (isConnected && !isUnsupported)
    return (
      <Box w="100%" aling="center">
        <Text
          background="rgba(26, 236, 173, 0.15)"
          borderRadius={8}
          color="#1AECAD"
          fontSize={["16px", "18px"]}
          fontWeight="900"
          height="52px"
          padding={["13px 4rem", "13px 2rem"]}
          w="100%"
        >
          WALLET CONNECTED
        </Text>
      </Box>
    );
  else if (isConnected && isUnsupported)
    return (
      <div>
        {switchNetwork &&
          data.chains.map((x) =>
            x.id === data.chain?.id ? null : <Button key={x.id} onClick={() => switchNetwork(x.id)} label={` Switch to ${x.name}`} />
          )}
      </div>
    );

  return (
    <HStack spacing="24px">
      {connectData.connectors.map((x) => (
        <Button key={x.id} onClick={() => connect(x)} label={x.name} />
      ))}

      {connectError && <div>{connectError?.message ?? "Failed to connect"}</div>}
    </HStack>
  );
};
