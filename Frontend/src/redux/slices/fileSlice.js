import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    files: []
};

const fileSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        addFile: (state, action) => {
            state.files.push(action.payload);
        },
        removeFile: (state, action) => {
            state.files = state.files.filter(file => file.name !== action.payload);
        },
        clearFiles: (state) => {
            state.files = [];
        }
    }
});

export const { addFile, removeFile, clearFiles } = fileSlice.actions;
export default fileSlice.reducer;
