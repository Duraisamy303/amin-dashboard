import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    catList:[]
};

const authConfigSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
       
        catList(state, { payload }) {
            state=payload
        },
        
    },
});

export const { catList} = authConfigSlice.actions;

export default authConfigSlice.reducer;
