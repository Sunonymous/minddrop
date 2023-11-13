import React from "react";
import {
  Heading,
  Icon,
  Spacer,
  Flex,
  IconButton,
  Textarea,
  Progress,
  keyframes,
} from "@chakra-ui/react";
import { ArrowLeft, Watch, Wind } from "react-feather";
import { useSelector, useDispatch } from "react-redux";
import { selectDrops, writeNotes } from "../features/drops";
import IconActionButton from "./IconActionButton";
import { useInterval } from "../hooks/useInterval";
import { resetFlow, selectFlowQueue } from "../features/flowQueue";

// queue is not to be edited from this component,
//   except upon exit, where it may be cleared

const AUTOSAVE_FREQUENCY = 30 * 1000; // in ms, ie. every 30 seconds

const flip = keyframes`
  from {transform: rotate(180deg);}
  to   {transform: rotate(180deg);}
`;

const FlowMode = ({ queue, modeSwitcher }) => {
  const dispatch = useDispatch();
  const drops = useSelector(selectDrops);
  const flowQueue = useSelector(selectFlowQueue);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const flip180 = `${flip} infinite 1s`;

  const phrases = [
    "Jot any notes you may need later.",
    "Summarize your efforts or where you left off.",
    "Capture an idea while you can.",
  ];
  const [phraseIndex] = React.useState(
    Math.floor(Math.random() * phrases.length)
  );

  const allDropIDs = Object.keys(drops);
  const focusedDropID = queue[activeIndex];
  const focusedDropHasInnerDrops = focusedDropID && allDropIDs.some((id) => drops[id].source === focusedDropID);
  const { label, notes } = drops[focusedDropID];

  const [nextNotes, setNextNotes] = React.useState(notes); // empty string for backup

  const [isEditingNotes, setIsEditingNotes] = React.useState(false);

  const [timeSince, setTimeSince] = React.useState(null);
  const [timerProgress, setTimerProgress] = React.useState(0);
  // 74 - 
  // 99 - progress

  React.useEffect(() => {
    let interval = setInterval(() => {
        const newProgress = calculateTimeDifference(timeSince);

        // progress is complete
        newProgress >= 100     ?
          setTimeSince(null)             // stop timer
          : 
          setTimerProgress(newProgress); // update timer
    }, 1);
    return () => clearInterval(interval);
  }, [timeSince]);

  const calculateTimeDifference = (startTime) =>  {
    const  secondsElapsed = (Date.now() - startTime) / 1000;
    const secondsInMinute = 60; 
    const  minutesOnTimer = 5;
    const   secondsToGoal = minutesOnTimer * secondsInMinute;
    const percentageComplete = ((secondsElapsed / secondsToGoal) * 100).toFixed(2)
    const   percentageToFill = Math.min(100, percentageComplete); // to cap at full
    return 100 - percentageToFill;
  }

  const saveNotesToStorage = () => {
    console.log("Notes have been updated.");
    const payload = { id: focusedDropID, nextNotes };
    dispatch(writeNotes(payload));
  };

  // every
  useInterval(saveNotesToStorage, AUTOSAVE_FREQUENCY);

  const handleNoteChange = (e) => {
    setNextNotes(e.target.value);
  };

  const handleStartTimer = (e) => {
    setTimeSince(Date.now());
  };

  const queueOfOne = flowQueue.length === 1; 

  const handleSwitchToPrevious = () => {
    saveNotesToStorage();
    const nextIndex = activeIndex === 0 ? flowQueue.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
    const dropIndex = flowQueue[nextIndex];
    setNextNotes(drops[dropIndex].notes);
  };

  const handleSwitchToNext = () => {
    saveNotesToStorage();
    const nextIndex = activeIndex ===  flowQueue.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
    const dropIndex = flowQueue[nextIndex];
    setNextNotes(drops[dropIndex].notes);
  };

  return (
    <section>
      <Flex
        h="100vh"
        direction="column"
        bg={isEditingNotes ? "gray.600" : "white"}
      >
        {/* Header */}
        <Flex alignItems="center" bg="gray.50">
          {/* ActiveIndex Control */}
          {queueOfOne ?
            (<Icon as={Wind} m={2} ml={4} boxSize={8} bg="" animation={flip180} />) :
            (<IconButton icon={<Wind />} m={2} ml={4} size='md' animation={flip180} onClick={handleSwitchToPrevious} /> )
          }
          
          {/* Source Display and Selection */}
          <Heading size="xl" noOfLines={2}>
            {label}
          </Heading>
          <Spacer />
          {/* ActiveIndex Control */}
          {queueOfOne ?
            (<Icon as={Wind} m={2} boxSize={8} bg="" />) :
            (<IconButton icon={<Wind />} m={2} ml={4} size='md' onClick={handleSwitchToNext} /> )
          }
          
        </Flex>
        <Spacer />
        <Textarea
          mt={4}
          h={"25%"}
          p={8}
          variant="unstyled"
          bg={isEditingNotes ? "white" : "gray.300"}
          resize="vertical"
          value={nextNotes}
          placeholder={`\n\nThis is a space for you to write.\n\n${phrases[phraseIndex]}`}
          onFocus={() => setIsEditingNotes(true)}
          onBlur={() => setIsEditingNotes(false)}
          onChange={handleNoteChange}
        />
        <Spacer />
        {/* Controls */}
        <Progress value={timeSince ? timerProgress : 0} />
        <Flex m={4}>
          <IconButton icon={<Watch />} isRound={true} onClick={handleStartTimer} />
        </Flex>
        <IconButton
          icon={<ArrowLeft />}
          onClick={() => {
            saveNotesToStorage();
            modeSwitcher("select");
            dispatch(resetFlow());
          }}
        />
      </Flex>
    </section>
  );
};

export default FlowMode;
