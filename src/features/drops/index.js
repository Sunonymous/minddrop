import { createSlice    } from "@reduxjs/toolkit";
import { DEHYDRATION_FROM, HYDRATION_FROM, MASTER_DROP_ID } from "../../data/defaultValues";
import { readFromDisk   } from '../../lib/fileIO';

const DROP_STARTING_HYDRATION = 9;
const CHARGE_DELTA = 1;
const PASS_DELTA = 0.5;
const RELABEL_DELTA = 0.125;

// DROP - the "unit"
// {
//   label:       string identifier
//   [id]:        serial primary key
//   [hydration]: sort key
//   [source]:    match key with drop IDs
//   [marked]:    boolean toggle upon interaction
//   [notes]:     string value, potentially markdown
// }

export const Drop = (
  label,
  id        = MASTER_DROP_ID,
  sourceID  = MASTER_DROP_ID,
  hydration = DROP_STARTING_HYDRATION
) => {
  return {
    label,
    id: String(id), // no numbers allowed!
    hydration,
    source: String(sourceID), // no numbers allowed!
    notes: "",
    marked: false,
  };
};

export const dropsSlice = createSlice({
  name: "drops",
  initialState: {
    '1': Drop('All'),
  },
  reducers: {
    // passed json to set drops slice to
    // we assume that it is valid. let's do validation at upload time
    loadFile: (state, action) => {
      const data = action.payload;
      if (!!data) {
        console.info(`loaded data of ${JSON.stringify(data)}`); 
        return data;
      } else {
        return state;
      }
    },
    // passed the label for the new drop and the source drop ID
    addDrop: (state, action) => {
      const { id, source, label } = action.payload;
      const newDrop = Drop(label, id, source);

      state[newDrop.id] = newDrop;
      state[source].hydration += HYDRATION_FROM.add;
    },
    // passed the drop ID
    removeDrop: (state, action) => {
      const dropIDs = Object.keys(state);
      dropIDs.forEach((dropID) => {
        const drop = state[dropID];
        if (!drop) return; // skip undefined drops
        // USES IMPLICIT COERCION because the payload is often a string
        if (drop.source == action.payload) {
          console.warn(`Operation would have orphaned drop ${dropID}! Moving drop to primary source.`);
          drop.source = 1; // move to the default source
        }
      }); 
      state[action.payload] = undefined;
    },
    relabelDrop: (state, action) => {
      const { id, newLabel } = action.payload;
      state[id].hydration += HYDRATION_FROM.relabel;
      state[id].label = newLabel;
    },
    // passed the drop ID
    passDrop: (state, action) => {
      state[action.payload].hydration -= DEHYDRATION_FROM.pass;
      state[action.payload].marked = true;
    },
    // passed the drop ID
    queueDrop: (state, action) => {
      state[action.payload].hydration += HYDRATION_FROM.queue;
      state[action.payload].marked = true;
    },
    // passed the drop ID
    hydrateDrop: (state, action) => {
      const { id, amount } = action.payload;
      state[id].hydration += amount;
    },
    // passed the drop ID
    dehydrateDrop: (state, action) => {
      const { id, amount } = action.payload;
      state[id].hydration -= amount;
    },
    markDrop: (state, action) => {
      state[action.payload].marked = true;
    },
    // passed the drop ID
    refreshDrops: (state, action) => {
      const dropIDs = Object.keys(state);
      dropIDs.forEach((dropID) => {
        const drop = state[dropID];
        if (!drop) return; // skip undefined drops
        if (drop.source === action.payload) {
          drop.marked = false;
        }
      }); 
    },
    snoozeDrop: (state, action) => {
      const { id, snoozedAt, snoozeFor } = action.payload;
      state[id].snoozedAt = snoozedAt;
      state[id].snoozeFor = snoozeFor;
    },
    // passed the ID of the drop to wake 
    wakeDrop: (state, action) => {
      delete state[action.payload].snoozedAt;
      delete state[action.payload].snoozeFor;
    },
    // passed an object { id: <dropID>, newNotes: <notes> }
    writeNotes: (state, action) => {
      const { id, nextNotes } = action.payload;
      state[id].notes = nextNotes;
    },
  },
});

export const selectDrops = (state) => state.drops;

export const { loadFile, addDrop, removeDrop, relabelDrop, passDrop, hydrateDrop, dehydrateDrop, refreshDrops, markDrop, writeNotes, snoozeDrop, wakeDrop } = dropsSlice.actions;

export default dropsSlice.reducer;
