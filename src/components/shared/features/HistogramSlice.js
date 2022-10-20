import {createSlice} from '@reduxjs/toolkit'

export const setHistogramData = (data, timeRange) => {
    return (dispatch) => {
        const timeData = data.map(a => a.timestamp)
        dispatch(setData({
            data: timeData,
            timeRange: timeRange
        }))
    }
}

const initalState = {
    data: [],
    isFocused: false,
    focusedData: [],
    timeRange: [],
}
export const histogramSlice = createSlice({
    name: 'histogramSlice',
    initialState: initalState,
    reducers: {
        setData: (state, action) => {
            state.data = action.payload.data
            state.timeRange = action.payload.timeRange
        },
        setHistogramFocused: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.focusedData = action.payload.isFocused ? action.payload.focusedData : []
        },
        clearHistogram: (state) => {
            state.data = []
            state.timeRange = []
        }
    }
})

export const {setData, setHistogramFocused, clearHistogram} = histogramSlice.actions
export default histogramSlice.reducer
