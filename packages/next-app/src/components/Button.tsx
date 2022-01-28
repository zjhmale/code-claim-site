import { Button as ChakraButton, Spinner,Flex} from "@chakra-ui/react";

interface ButtonProps {
  label: string;
  button_type: string;
  onClick?: () => void;
}

export const Button = ({button_type, label, ...props }: ButtonProps) => {
  return (
    <ChakraButton
      type="button"
      backgroundColor={(() => {
   switch(button_type) {
     case "connect":
       return "#fff"
     case "learn":
       return "#000"
     case "switch":
       return "rgba(255, 255, 255, 0.08)"
   }
 })()}
      color={(() => {
   switch(button_type) {
    case "connect":
       return "#000"
    case "learn":
       return "#fff"
    case "switch":
       return "#fff"
   }
      })()}
      fontSize={["16px", "18px"]}
      height="52px"
      lineHeight={24}
      fontWeight="900"
      border={"2px solid #fff"}
      borderRadius={"0.5rem"}
      padding="0 2rem"
      _hover={{
        transform:
          "translate3d(0px, -2px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
        transformStyle: "preserve-3d",
      }}
      _active={{}}
      {...props}
    >
      {
        button_type == "switch" ? <Spinner mr="5" /> : null
      }
      {label}
    </ChakraButton>
  );
};
