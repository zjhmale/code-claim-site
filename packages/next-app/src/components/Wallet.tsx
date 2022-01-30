import { Button, ButtonType } from "@/components/Button";
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
import { useEffect } from "react";

interface WalletProps {
  isConnected: boolean | undefined;
  isUnsupported: boolean | undefined;
}

export const Wallet = ({ isConnected, isUnsupported }: WalletProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [{ data, error, loading }, switchNetwork] = useNetwork();
  const [{ data: connectData, error: connectError }, connect] = useConnect();

  useEffect(() => {
    if (switchNetwork && data?.chain?.id != data?.chains[0].id)
      switchNetwork(data?.chains[0].id);
  }, [connectData]);

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
          textAlign={"center"}
        >
          WALLET CONNECTED
        </Text>
      </Box>
    );
  } else if (isConnected && isUnsupported) {
    return (
      <div>
        <Button label={`CONNECTING`} buttonType={ButtonType.Switch} />
      </div>
    );
  }

  return (
    <HStack spacing="24px">
      <Button
        onClick={onOpen}
        label="CONNECT WALLET"
        buttonType={ButtonType.Connect}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent pb="5">
          <ModalHeader>Connect your wallet</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {connectData.connectors.map((x) => (
              <Button
                key={x.id}
                onClick={() => connect(x)}
                label={x.name}
                buttonType={ButtonType.Connect}
              />
            ))}
          </ModalBody>
        </ModalContent>
      </Modal>

      {connectError && (
        <div>{connectError?.message ?? "Failed to connect"}</div>
      )}
    </HStack>
  );
};
