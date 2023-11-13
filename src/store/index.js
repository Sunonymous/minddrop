import { combineReducers, configureStore, } from "@reduxjs/toolkit";
import dropsReducer         from "../features/drops";
import activeSourceReducer  from "../features/activeSource";
import flowQueueReducer     from "../features/flowQueue";
import pinnedSourcesReducer from "../features/pinnedSources";
import configReducer        from "../features/config";
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

const persistConfig = {
  key: 'root',
  storage: storage,
  version: 1,
};

const reducers = combineReducers({
  drops:         dropsReducer,
  activeSource:  activeSourceReducer,
  flowQueue:     flowQueueReducer,
  pinnedSources: pinnedSourcesReducer, 
  config:        configReducer,
});

const _persistedReducer = persistReducer(persistConfig, reducers);

export default configureStore({
  reducer: _persistedReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,],
      },
    }),
});
