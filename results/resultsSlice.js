import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    results: [],
};

export const resultsSlice = createSlice({
    name: "results",
    initialState,
    reducers: {
        setResults: (state, action) => {
            state.results = action.payload;
        },
        addResult: (state, action) => {
            state.results.unshift(action.payload);
        },
        clearResults: (state) => {
            state.results = [];
        },
    },
});

export const { setResults, addResult, clearResults } = resultsSlice.actions;

export default resultsSlice.reducer;
