import { createSlice } from "@reduxjs/toolkit";

export const pinnedDropsSlice = createSlice({
  name: "pinnedDrops",
  initialState: [],
  reducers: {
    pin: (state, action) => {
        state.push(action.payload);
    },
    // haven't tested this
    unpin: (state, action) => {
        state.filter((dropId, index) => index === state.indexOf(dropId));
    },
    clearPins: (_, __) => {
        return [];
    },
  },
});

export const selectPinnedDrops = (state) => state.pinnedDrops;

export const { pin, unpin, clearPins } = pinnedDropsSlice.actions;

export default pinnedDropsSlice.reducer;
