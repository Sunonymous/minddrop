import React from "react";
import styles from "/styles/App.module.css";
import { motion, useAnimate } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  loadFile,
  selectDrops,
  addDrop,
  removeDrop,
  relabelDrop,
  hydrateDrop,
  dehydrateDrop,
  refreshDrops,
  markDrop,
  snoozeDrop,
  wakeDrop,
} from "../features/drops";
import {
  selectActiveSource,
  enterDrop,
  returnToMasterSource,
} from "../features/activeSource";
import { pin, unpin, togglePin, selectPinnedSources, clearPins } from "../features/pinnedSources";
import {
  Center,
  Heading,
  Fade,
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
  Text,
  Drawer,
} from "@chakra-ui/react";
// Icons ---------------------------------------------------------------------
import {
  ArrowRight,
  Check,
  CloudDrizzle,
  CloudLightning,
  CloudRain,
  DownloadCloud,
  Droplet,
  Edit,
  Heart,
  Moon,
  Plus,
  Trash2,
  X,
  ZoomOut,
} from "react-feather";
// Components ---------------------------------------------------------------------
import { FileUploader } from "./FileUploader";
import { uniqueIDs } from "../lib/helpers";
import flowQueue, { selectFlowQueue, addToFlow, removeFromFlow, resetFlow } from "../features/flowQueue";
import IconActionButton from './IconActionButton';
import DropIndicator from './DropIndicator';
// Constants ----------------------------------------------------------------------
import { HYDRATION_FROM, DEHYDRATION_FROM } from "../data/defaultValues";
import { changeSetting, selectConfig } from "../features/config";

const DROP_LABEL_LIMIT = 45; // a limit of length
const NOTE_HIGHLIGHT_MARK = '`';

// passing the labels makes this pure... and also hacky
// creating that labels object confirmed this
const FlowBar = ({ queue, labels, modeSwitcher }) => {
  const dispatch = useDispatch(); 
  const [hoveredDropID, setHoveredDropID] = React.useState(null);

  return (
    <section>
      <Flex direction="column">
        <Flex
          p={2}
          bg="gray.300"
          justifyContent="space-evenly"
          alignItems="center"
        >
          {queue.map((dropID) => {
            const isHovered = hoveredDropID === dropID;

            return (
              <IconButton
                key={dropID}
                m={1}
                bg="white"
                size="xs"
                icon={isHovered ? <X /> : ""}
                onMouseEnter={() => setHoveredDropID(dropID)}
                onMouseLeave={() => setHoveredDropID(null)}
                onClick={() => dispatch(removeFromFlow(dropID))}
              />
            );
          })}
          <Spacer />
          <IconButton
            p={3}
            size="sm"
            bg="white"
            isRound={true}
            icon={<CloudRain />}
            onClick={() => modeSwitcher('flow')}
          />
        </Flex>
        <Center opacity={hoveredDropID ? 1 : 0} fontStyle="italic" fontWeight={500}>
          {"Remove '" + labels[hoveredDropID] + "?'"}
        </Center>
      </Flex>
    </section>
  );
}


const SelectMode = ({ modeSwitcher }) => {
  const dispatch = useDispatch(); 
  const config = useSelector(selectConfig);
  const pinnedSources = useSelector(selectPinnedSources)
  const flowQueue = useSelector(selectFlowQueue);
  const drops = useSelector(selectDrops);
  const toast = useToast();
  const activeSourceID = useSelector(selectActiveSource);
  const activeSourceLabel = drops[activeSourceID].label;
  const { colorMode, toggleColorMode } = useColorMode();

  const getAllIDs = () =>
    Object.keys(drops).filter((dropID) => !!drops[dropID]);

  const getDropsInSource = (querySourceID) => {
    return dropIDs.filter((dropID) => {
      const drop = drops[dropID];
      return (
        !!drop &&                      // drop must exist
          drop.id !== querySourceID && // exclude the active source
          drop.source == querySourceID // using implicit coercion numbers/string mismatch
      ); // match the active source ID
    });
  };
 
  const dropUnmarkedForFlow = (dropID) => {
    return !flowQueue.includes(dropID);
  };
 
  const getAwakeIDs = (dropIDs) => {
    return dropIDs.filter((dropID) => dropID.snoozedAt === undefined);
  };

  const getUnmarkedIDs = (dropIDs) => {
    const unmarkedDropIDs = dropIDs.filter((dropID) => {
      return !drops[dropID].marked; // exclude marked drops
    });

    // sort by descending hydration
    return unmarkedDropIDs.sort(
      (a, b) => drops[b].hydration - drops[a].hydration
    );
  };

  const dropIDs = getAllIDs();

  const dropIsNotSnoozed = (dropID) => drops[dropID].snoozedAt === undefined;
  const snoozedDrops = dropIDs.filter((dropID) => !!drops[dropID].snoozedAt);

  snoozedDrops.forEach(dropID => {
    const { snoozedAt, snoozeFor } = drops[dropID];
    
    // return if awake
    if (!snoozedAt) return;

    console.log(`Drop with ID of ${dropID} is sleeping. Shall we wake it up?`);

    // check if enough time has passed
    const timeNow = Date.now();
    const timeSince = timeNow - snoozedAt;

    console.log(`It has been ${timeSince} milliseconds since it was snoozed.`);

    if (timeSince >= snoozeFor) {
      console.log('Yes, we shall wake it up.');
      dispatch(wakeDrop(dropID));
    } else {
      console.log('No, we shall not wake it up.');
    }
  });

  const sourceIDs = dropIDs.map((dropID) => drops[dropID].source);
  const sourceDropIDs = [...new Set(sourceIDs)].map(String);

  const swappableSources = uniqueIDs([activeSourceID,'1', ...pinnedSources]);

  const dropIDsInActiveSource = getDropsInSource(activeSourceID);
  const unmarkedDropIDs = getUnmarkedIDs(dropIDsInActiveSource).filter(dropUnmarkedForFlow).filter(dropIsNotSnoozed);
  const focusedDropID = unmarkedDropIDs[0];
 
  const dropsNeedRefreshed = dropIDsInActiveSource.length > 0
                              &&
                             unmarkedDropIDs.length === 0;
 
  if (dropsNeedRefreshed) {
    // replace this condition with an option from the config slice
    // will automagically refresh the drops
    config.autoRefresh ? dispatch(refreshDrops(activeSourceID)) : null;
  }
  
  // warn user that there are no drops
  const noDropToastID = "no-drops";
  if (dropIDs.length === 1 && !toast.isActive(noDropToastID)) {
    toast({
      id: noDropToastID,
      title: "Create a drop to begin.",
      variant: "left-accent",
    });
  }

  // focused on the first unmarked drop
  const focusedDrop = drops[focusedDropID];

  // short-circuit if there is no focused drop
  const hasDropsInSource = focusedDrop && sourceDropIDs.includes(focusedDrop.id);

  // search for a particular pattern in the notes
  const noteRegex = /```[^\n]*\n/g;
  const notes =  focusedDrop && (focusedDrop.notes ?? '');
  let noteHighlights = notes && [...(notes + '\n').matchAll(noteRegex)];
  // if there is nothing to highlight, undefine the variable to prevent render
  if (noteHighlights && noteHighlights.length === 0) noteHighlights = undefined;

  const focusedDropHasInnerDrops = focusedDrop && hasDropsInSource;
  // display it differently if it contains other drops
  const dropStyling = `${styles.centeredDrop} ${
    focusedDropHasInnerDrops ? styles.fullDrop : styles.emptyDrop
  }`;

  // components <----------------------------------------------------------> 

  const DropCenterButton = ({ drop }) => {
    const     [scope,      animate] = useAnimate();
    const [isHovered, setIsHovered] = React.useState(false);
    const { id, label } = drop;

    const  handleMouseOn = () => setIsHovered(true);
    const handleMouseOff = () => setIsHovered(false);

    const hoverBG = 'gray.200';
    const nonhoverBG = 'gray.100';

    const isSource = sourceDropIDs.includes(id);
    const sourceBorderMultiplier = isSource ? 2 : 1;

    return (
      <article key={id}>
        <SlideFade
          in={focusedDrop}
          offsetY={-50}
          reverse={true}
          transition={{ enter: { duration: 0.5, ease: "easeOut" } }}
        >
          <Center>
            <Flex direction="column" alignItems="center">
              <Circle
                ref={scope}
                p={3}
                size={48}
                bg={isHovered ? hoverBG : nonhoverBG}
                border={(isHovered ? 4 : 2) * sourceBorderMultiplier + "px"}
                borderStyle={isSource ? "double" : "none"}
                borderColor={isHovered ? "gray.400" : "gray.300"}
                onMouseOver={handleMouseOn}
                onMouseLeave={handleMouseOff}
                onClick={() => {
                  const shrinkAnimation = animate(
                    scope.current,
                    { scale: [2, 1], opacity: [0, 1] },
                    { duration: 1.5 }
                  );
                  const expandAnimation = animate(
                    scope.current,
                    { scale: [1, 2], opacity: [1, 0] },
                    { duration: 1, transition: "ease-out" }
                  );
                  expandAnimation
                    .then(async () => {
                      await handleEnterDrop(focusedDrop.id);
                    })
                    .then(function () {
                      shrinkAnimation.play();
                    });
                }}
              >
                <Heading size="md" textAlign="center" noOfLines={5}>
                  {label}
                </Heading>
              </Circle>
              <HStack mt={4}>
                {getDropsInSource(id).map((dropID) => {
                  const numOfDropsInSource = getDropsInSource(dropID).length;
                  return (
                    <DropIndicator
                      key={"inner-" + dropID}
                      id={dropID}
                      weight={numOfDropsInSource}
                    />
                  );
                })}
              </HStack>
            </Flex>
          </Center>
        </SlideFade>
      </article>
    );
  };

  // handlers <------------------------------------------------------------>

  const handleAddDrop = (sourceID) => {
    const dropLabel = prompt("Drop label?") || ''.slice(0, DROP_LABEL_LIMIT);
    if (!dropLabel || dropLabel.trim() === "") return;
   
    const payload = {
      label: dropLabel,
      source: sourceID,
      id: Math.max(...getAllIDs().map(Number)) + 1,
    };
    dispatch(hydrateDrop({id: sourceID, amount: HYDRATION_FROM.addDrop}));
    dispatch(addDrop(payload));
  };

  const handleRemoveDrop = (id) => {
    dispatch(removeDrop(id));
  };

  const handleRelabelDrop = (id) => {
    const oldLabel = drops[id].label;
    const newLabel = prompt("Drop label?", oldLabel) || ''.slice(0, 45);

    // if given improper labels, do nothing
    //   truncate excessively long labels
    if (!newLabel || newLabel.trim() === "" || newLabel === oldLabel) return;
    const payload = {
      id,
      newLabel,
    };
    dispatch(relabelDrop(payload));
  };

  const handlePassDrop = (id) => {
    dispatch(dehydrateDrop({ id, amount: DEHYDRATION_FROM.pass }));
    dispatch(markDrop(id));
  };

  const handleRefreshDrops = (sourceID) => {
    dispatch(refreshDrops(sourceID));
  };

  const handleEnterDrop = (dropID) => {
    dispatch(enterDrop(dropID));
  };

  const handleExitDrop = (activeSourceID) => {
    const parentID = drops[activeSourceID].source;
    dispatch(enterDrop(parentID));
  };

  const handleSourcePinToggle = (sourceID) => {
    const isAlreadyPinned = pinnedSources.includes(sourceID);

    if (isAlreadyPinned) {
      dispatch(unpin(String(sourceID)));
    } else {
      dispatch(pin(sourceID));
    }
  };
 
  const handleSnoozeDrop = (dropID) => {
    const snoozedAt = Date.now();
    const snoozeFor = 30000;
    const payload = { id: dropID, snoozedAt, snoozeFor };
    dispatch(snoozeDrop(payload));
  };

  const handleQueueForFlow = (dropID) => {
    dispatch(addToFlow(dropID));
    dispatch(hydrateDrop({ id: dropID, amount: HYDRATION_FROM.queue }));
    dispatch(markDrop(dropID));
  };
  
  return (
    <Flex direction="column" bg="white" className={styles.AppWindow}>
      <header>
{/* Source Control */}
        <Flex direction="column">
          <Flex align="center" bg="gray.50">
            <Icon as={DownloadCloud} m={2} boxSize={8} bg="" />
            {/* Source Display and Selection */}
            {swappableSources.length === 1 ? (
              <Heading size="xl" noOfLines={1} className={styles.sourceLabel}>
                {activeSourceLabel}
              </Heading>
            ) : (
              <Select
                size="lg"
                fontSize="1.75rem"
                variant="unstyled"
                ml={1}
                fontWeight={700}
                disabled={swappableSources.length === 1}
                value={drops[activeSourceID].label}
                onChange={(e) => {
                  dispatch(enterDrop(e.target.value));
                }}
              >
                {swappableSources.map((dropID) => {
                  return (
                    <option key={dropID} value={dropID}>
                      {(dropID === activeSourceID ? "· " : "") +
                        drops[dropID].label +
                        (dropID === activeSourceID ? " ·" : "")}
                    </option>
                  );
                })}
              </Select>
            )}
            <Spacer />
            {activeSourceID != 1 && (
              <IconActionButton
                size="lg"
                variant="ghost"
                condition={true}
                iconJSX={
                  <Heart
                    color={
                      pinnedSources.includes(activeSourceID) ? "pink" : "gray"
                    }
                    strokeWidth={
                      pinnedSources.includes(activeSourceID) ? "3" : "1"
                    }
                  />
                }
                callback={() => handleSourcePinToggle(activeSourceID)}
              />
            )}
            <IconActionButton
              size="lg"
              variant="ghost"
              condition={true}
              iconJSX={<Plus />}
              callback={() => handleAddDrop(activeSourceID)}
            />
          </Flex>
{/* Drop Edit */}
          {!!focusedDrop && (
            <Flex pr={3} align="center" bg="gray.100">
              <Icon
                as={
                  sourceDropIDs.includes(Number(focusedDropID))
                    ? CloudDrizzle
                    : Droplet
                }
                ml={4}
                boxSize={4}
                bg=""
              />
              <Heading
                pl={5}
                py={1}
                bg="gray.100"
                size="sm"
                noOfLines={1}
                borderBottom={3}
                borderColor="gray.300"
              >
                {focusedDrop.label}
              </Heading>
              <Spacer />
              <IconActionButton
                size="xs"
                variant="ghost"
                condition={!!focusedDrop}
                iconJSX={<Edit />}
                callback={() => handleRelabelDrop(focusedDropID)}
              />
            </Flex>
          )}
{/* Sibling List */}
          {!!focusedDrop && (
            <HStack ml={2.5} p={2}>
              {getUnmarkedIDs(dropIDsInActiveSource).map((dropID) => {
                const numOfDropsInSource = getDropsInSource(dropID).length;
                return (
                  <DropIndicator
                    key={"sibling-" + dropID}
                    id={dropID}
                    weight={numOfDropsInSource}
                    highlighted={focusedDrop.id == dropID}
                  />
                );
              })}
            </HStack>
          )}
        </Flex>
{/* Flow Queue  */}
        {flowQueue.length > 0 && (
          <FlowBar
            modeSwitcher={modeSwitcher}
            queue={flowQueue}
            labels={Object.fromEntries(
              flowQueue.map((id) => [id, drops[id].label])
            )}
          />
        )}
      </header>

      <Spacer />

{/* Refresh Button */}
      {dropsNeedRefreshed && (
        <>
          <Button
            className={styles.controlButton}
            onClick={() => handleRefreshDrops(activeSourceID)}
          >
            Refresh Drops
          </Button>
        </>
      )}
{/* Highlights */}
      {!!noteHighlights && (
      <>
        {noteHighlights.map((highlight, index) => {
          return (
            <SlideFade key={index} in={true} offsetY={42} duration={2}
             transition={{ enter: { duration: 0.5, ease: "easeOut" } }}
            >
              <Text fontSize='xl' align="center">{highlight[0].slice(3)}</Text>
            </SlideFade>
          );
        })}
        <Spacer />
      </>
      )}

{/* Focused Drop */}
      {!!focusedDrop && (
        <DropCenterButton key={focusedDropID} drop={focusedDrop} />
      )}

      <Spacer />

{/* Source Controls */}
      <Flex p={4} justify="space-evenly">
        <IconActionButton
          size="lg"
          variant="outline"
          condition={activeSourceID !== "1"}
          iconJSX={<ZoomOut />}
          callback={() => handleExitDrop(activeSourceID)}
        />
        <IconActionButton
          size="lg"
          variant="outline"
          condition={!!focusedDrop}
          iconJSX={<Check />}
          callback={() => handleQueueForFlow(focusedDropID)}
        />
        <IconActionButton
          size="lg"
          variant="outline"
          // this appears when auto refresh is on and there's only one drop in a source
          // prevents the user from repeatedly dehydrating the same drop 
          condition={!!focusedDrop &&
                     !(config.autoRefresh &&
                       dropIDsInActiveSource.length === 1)}
          iconJSX={<ArrowRight />}
          callback={() => handlePassDrop(focusedDropID)}
        />
        <IconActionButton
          size="lg"
          variant="outline"
          condition={!!focusedDrop}
          iconJSX={<Trash2 />}
          callback={() => handleRemoveDrop(focusedDropID)}
        />
        <IconActionButton
          size="lg"
          variant="outline"
          condition={!!focusedDrop}
          iconJSX={<Moon />}
          callback={() => handleSnoozeDrop(focusedDropID)}
        />
        {/* Magic Button for magical testing */}
        <IconActionButton
          size="lg"
          variant="outline"
          condition={false}
          iconJSX={<CloudLightning />}
          callback={() => {
            // magical do-whatever function
            dispatch(changeSetting({settingName: 'autoRefresh', newValue: !config.autoRefresh}))
          }}
        />
        {/* <IconActionButton
          size="lg"
          variant="outline"
          condition={true}
          iconJSX={<Sun />}
          callback={() => toggleColorMode()}
        /> */}
      </Flex>
      {/* <FileUploader callback={(data) => dispatch(loadFile(data))} /> */}
    </Flex>
  );
};

export default SelectMode;