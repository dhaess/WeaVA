import { configureStore } from '@reduxjs/toolkit'
import histogramReducer from './HistogramSlice'
import mapReducer from './MapSlice'
import savedReducer from './SavingsSlice'
import comparisonReducer from './ComparisonSlice'
import settingsReducer from './SettingsSlice'
import playerReducer from './PlayerSlice'

export default configureStore({
    reducer: {
        settings: settingsReducer,
        savings: savedReducer,
        histogram: histogramReducer,
        map: mapReducer,
        comparison: comparisonReducer,
        player: playerReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})
