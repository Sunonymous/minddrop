import React from 'react';
import { motion, useAnimate } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { selectDrops } from '../features/drops';
import {
  Box,
  Center,
  Heading,
  SlideFade,
  ScaleFade,
  Button,
  IconButton,
  Circle,
  useToast,
  Flex,
  Spacer,
  Icon,
  HStack,
  Select,
  useColorMode,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from "@chakra-ui/react";
// Icons ---------------------------------------------------------------------
import {
} from "react-feather";


const Playground = () => {

    // <utils> 
    const getAllIDs = () =>
        Object.keys(drops).filter((dropID) => !!drops[dropID]);
    const getDropsInSource = (querySourceID) => {
        return dropIDs.filter((dropID) => {
            const drop = drops[dropID];
            return (
                !!drop &&                   
                drop.id !== querySourceID &&
                drop.source == querySourceID
            );
        });
    };



    const Drawer = () => {
        //
    };

    const dispatch = useDispatch(); 
    const drops = useSelector(selectDrops);
    const dropIDs = getAllIDs();

    const dropDebugDisplay = (dropID) => {
        console.log(`Drop #${dropID} - "${drops[dropID].label}"`);
    }

    // <comps>
    const DropDresser = ({ sourceDropID }) => {
        const dropIDsInSource = getDropsInSource(sourceDropID);
        
        const DropButton = () => (
            <Button m={1} size='sm' onClick={() => callback(dropID)}>
            {drops[dropID].label}
            </Button>
        );

        return (
            <Accordion>
              {dropIDsInSource.map((dropID) => (
                <DropDrawer dropID={dropID} callback={dropDebugDisplay} />
              ))}
            </Accordion>
        );
    };

    const DropDrawer = ({ callback, dropID }) => {
        const dropIDsInSource = getDropsInSource(dropID);
        const { label } = drops[dropID];

        const DropButton = () => (
            <Button m={1} size='sm' onClick={() => callback(dropID)}>
            {drops[dropID].label}
            </Button>
        );

        return dropIDsInSource.length === 0 ?
          // lacks inner drops
          (<AccordionItem key={dropID}>
                <DropButton />
          </AccordionItem>) :
          // has inner drops
          (<AccordionItem>
            <AccordionButton>
                <Box as='span' flex='1' textAlign='left'>
                    {label}
                </Box>
                <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
                {dropIDsInSource.map(() => <DropDrawer key={dropID} callback={callback} dropID={dropID} />)}
            </AccordionPanel>
          </AccordionItem>);
    };

    return (
        <>
          <DropDresser sourceDropID='2' />
        </>
    );

    // final Product
    return (
        <ul>
          <DropDresser sourceDropID='2' />
        </ul>
    );
}

export default Playground;