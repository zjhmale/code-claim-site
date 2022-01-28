import { Box, Flex, Text, Link, keyframes } from "@chakra-ui/react";

import { WarningTwoIcon } from "@chakra-ui/icons";

const bounce = keyframes`
        0%   { transform: translateY(0); }
        30%   { transform: translateY(0); }
        50%  { transform: translateY(-50px); }
        70%  { transform: translateY(0); }
        100% { transform: translateY(0); }
`;

const bounceAnimation = `${bounce} infinite 1.5s ease`;

export const ErrorToast = ({
  message,
  link_message,
  link,
}: {
  message: string;
  link_message: string;
  link: string;
}) => (
  <Box
    color="#FFFFFF"
    p={2}
    mb={10}
    mr={10}
    bg="#08010D"
    borderRadius="lg"
    border="2px"
    borderColor="#FF0042"
    animation={bounceAnimation}
  >
    <Flex mx="5" alignItems={"center"}>
      <WarningTwoIcon mr="5" color="#FF0042" />
      <Text fontSize="sm">
        {message}
        <Link href={link}>{link_message}</Link>
      </Text>
    </Flex>
  </Box>
);
