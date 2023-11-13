import { createSlice } from "@reduxjs/toolkit";

export const pinnedSourcesSlice = createSlice({
  name: "pinnedSources",
  initialState: [],
  reducers: {
    pin: (state, action) => {
      state.push(action.payload);
    },
    // this function doesn't seem to remove the object
    unpin: (state, action) => {
      return state.filter((dropID) => dropID !== Number(action.payload)
                                   && dropID !== String(action.payload));
    },
    clearPins: (_, __) => {
      return [];
    },
  },
});

export const selectPinnedSources = (state) => state.pinnedSources;

export const { pin, unpin, togglePin, clearPins } = pinnedSourcesSlice.actions;

export default pinnedSourcesSlice.reducer;
