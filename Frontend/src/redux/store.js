import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./slices/fileSlice";

const store = configureStore({
  reducer: {
    files: fileReducer,
  },
});

export default store;
