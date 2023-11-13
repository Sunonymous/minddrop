import { createSlice    } from "@reduxjs/toolkit";
import { MASTER_DROP_ID } from "../../data/defaultValues";

// activeFlow Slice references drop IDs

export const activeSourceSlice = createSlice({
  name: "activeSource",
  initialState: MASTER_DROP_ID,
  reducers: {
    // passed dropID
    enterDrop: (state, action) => {
      return action.payload;
    },
    returnToMasterSource: (state) => {
      return MASTER_DROP_ID;
    },
  },
});

export const selectActiveSource = (state) => state.activeSource;

export const { enterDrop, returnToMasterSource } = activeSourceSlice.actions;

export default activeSourceSlice.reducer;
