import {createSlice} from "@reduxjs/toolkit";
import MarkerMode from "../../../static/data/MarkerMode.json";

export const settingsSlice = createSlice(({
    name: "settingsSlice",
    initialState: {
        theme: "cobaltBlue",
        mapTile: "CH",
        markerMode: MarkerMode["Grid"],
        binDivided: true,
        histogram: {
            type: "number",
            bins: 40,
            divided: true
        }
    },
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload
        },
        setMapTile: (state, action) => {
            state.mapTile = action.payload
        },
        setMarkerMode: (state, action) => {
            state.markerMode = action.payload
        },
        setBinDivided: (state, action) => {
            state.histogram.divided = action.payload
        },
        setBins: (state, action) => {
            state.histogram = action.payload
        }
    }
}))

export const {setTheme, setMapTile, setMarkerMode, setBinDivided, setBins} = settingsSlice.actions
export default settingsSlice.reducer
