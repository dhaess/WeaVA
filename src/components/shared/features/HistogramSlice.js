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
        clearHistogram: (state) => {
            state.data = []
            state.timeRange = []
        }
    }
})

export const {setData, clearHistogram} = histogramSlice.actions
export default histogramSlice.reducer
