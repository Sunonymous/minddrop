import { ScaleFade, Circle } from "@chakra-ui/react";

const DropIndicator = ({ id, weight, highlighted }) => {
  const bgScale = [1, 2, 3, 4, 5, 6, 7];
  const bgValue = bgScale[Math.min(weight, bgScale.length - 1)];

  return (
    <ScaleFade initialScale={0.5} in={id}>
      <Circle
        animate={{ opacity: [0, 0.5] }}
        transition={{ duration: 2 }}
        size={3}
        bg={`gray.${bgValue}00`}
      />
    </ScaleFade>
  );
}

export default DropIndicator;