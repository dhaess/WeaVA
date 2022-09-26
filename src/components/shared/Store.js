import { configureStore } from '@reduxjs/toolkit'
import histogramReducer from './features/HistogramSlice'
import mapReducer from './features/MapSlice'
import savedReducer from './features/SavingsSlice'
import comparisonReducer from './features/ComparisonSlice'
import settingsReducer from './features/SettingsSlice'

export default configureStore({
    reducer: {
        settings: settingsReducer,
        savings: savedReducer,
        histogram: histogramReducer,
        map: mapReducer,
        comparison: comparisonReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})
