import { Button } from "@/components/Button";
import { useConnect, useNetwork } from "wagmi";
import {
  Box,
  Text,
  HStack,
  Modal,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

interface WalletProps {
  isConnected: boolean | undefined;
  isUnsupported: boolean | undefined;
}

export const Wallet = ({ isConnected, isUnsupported }: WalletProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [{ data, error, loading }, switchNetwork] = useNetwork();
  const [{ data: connectData, error: connectError }, connect] = useConnect();

  if (isConnected && !isUnsupported) {
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
  } else if (isConnected && isUnsupported) {
    return (
      <div>
        {switchNetwork &&
          data.chains.map((x) =>
            x.id === data.chain?.id ? null : <Button key={x.id} onClick={() => switchNetwork(x.id)} label={` Switch to ${x.name}`} />
          )}
      </div>
    );
  }

  return (
    <HStack spacing="24px">
      <Button onClick={onOpen} label="Connect Wallet" />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent pb="5">
          <ModalHeader>Connect your wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {connectData.connectors.map((x) => (
              <Button key={x.id} onClick={() => connect(x)} label={x.name} />
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>

      {connectError && <div>{connectError?.message ?? "Failed to connect"}</div>}
    </HStack>
  );
};
