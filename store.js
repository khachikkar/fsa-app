import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user/userslice";
import resultsReducer from "./results/resultsSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        results: resultsReducer,
    },
});