import { createSlice } from "@reduxjs/toolkit";

export const flowQueueSlice = createSlice({
  name: "flowQueue",
  initialState: [],
  reducers: {
    addToFlow: (state, action) => {
      // only add if not already present
      if (!state.includes(action.payload)) {
        state.push(action.payload);
      } else {
        return state;
      }
    },
    removeFromFlow: (state, action) => {
        return state.filter((dropID) => dropID !== action.payload)
    },
    resetFlow: (_, __) => {
        return [];
    },
  },
});

export const selectFlowQueue = (state) => state.flowQueue;

export const { addToFlow, removeFromFlow, resetFlow } = flowQueueSlice.actions;

export default flowQueueSlice.reducer;
