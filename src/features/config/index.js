import defaultConfig from "../../data/defaultConfig"; 
import { createSlice } from "@reduxjs/toolkit";

export const configSlice = createSlice({
  name: "config",
  initialState: defaultConfig,
  reducers: {
    changeSetting: (state, action) => {
      const { settingName, newValue } = action.payload;
      // if valid setting and matches type for default value
      if (Object.keys(defaultConfig).includes(settingName) &&
          typeof defaultConfig[settingName] === typeof newValue) {
        state[settingName] = newValue;
      }
    },
  },
});

export const selectConfig = (state) => state.config;

export const { changeSetting, } = configSlice.actions;

export default configSlice.reducer;
