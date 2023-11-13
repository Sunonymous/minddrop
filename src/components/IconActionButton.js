import { SlideFade, IconButton } from "@chakra-ui/react";

const IconActionButton = ({ condition, iconJSX, callback, variant='solid', size='md' }) => {
  if (!condition) return; // only display button when condition is met

  return (
    <SlideFade
      in={condition}
      offsetY="20px"
      transition={{ enter: { duration: 0.5 } }}
    >
      <IconButton
        m={1.5}
        size={size}
        variant={variant}
        isRound={true}
        onClick={callback}
        icon={iconJSX}
      />
    </SlideFade>
  );
};

export default IconActionButton;