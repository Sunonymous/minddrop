import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { SlideFade, Button, useToast } from "@chakra-ui/react";
// Components ---------------------------------------------------------------------
import { FileUploader } from "./FileUploader";
import SelectMode from "./SelectMode";
import Playground from './Playground';
import FlowMode from "./FlowMode";
import { selectFlowQueue } from "../features/flowQueue";

// <==============================================================
//  - Constants --------------------------------------------------
//  ==============================================================>

const APP_MODES = ['select', 'flow'];

// <==============================================================
//  - Components -------------------------------------------------
//  ==============================================================>

const ActionButton = ({ condition, variant='solid', size='md', children, callback }) => {
  if (!condition) return; // only display button when condition is met
  
  return (
    <SlideFade
      in={condition}
      offsetY="20px"
      transition={{ enter: { duration: 0.5 } }}
    >
      <Button m={1.5} variant={variant} size={size} onClick={callback}>
        {children}
      </Button>
    </SlideFade>
  );
};

// <==============================================================
//  - App --------------------------------------------------------
//  ==============================================================>

export default function App() {
  const [mode, setMode] = React.useState('select');
  const dispatch = useDispatch();
  const flowQueue = useSelector(selectFlowQueue);
  const toast = useToast();

  const handleSetMode = (newMode) => {
    if (!APP_MODES.includes(newMode)) {
      console.warn(`Attempted to switch to invalid app mode '${newMode}'. Aborting.`);
      return;
    }

    setMode(newMode);
  }

  const modeComponents = {
    select: <SelectMode modeSwitcher={handleSetMode} />,
    flow:   <FlowMode   modeSwitcher={handleSetMode} queue={flowQueue} />,
    debug:  <Playground />,
  }

  const ActiveComponent = modeComponents[mode];


  // render <--------------------------------------------------------------->
  return (
    <>
      {ActiveComponent}
    </>
  )
}
