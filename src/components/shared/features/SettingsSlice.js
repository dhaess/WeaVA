import {createSlice} from "@reduxjs/toolkit";

export const settingsSlice = createSlice(({
    name: "settingsSlice",
    initialState: {
        theme: "cobaltBlue",
        mapTile: "CH"
    },
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload
        },
        setMapTile: (state, action) => {
            state.mapTile = action.payload
        }
    }
}))

export const {setTheme, setMapTile} = settingsSlice.actions
export default settingsSlice.reducer
