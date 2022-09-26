import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {setHistogramData} from "./HistogramSlice";
import {deleteAllAreas, isMapFilterChanged, setMapData} from "./MapSlice";
import {focusArea, focusPoints, focusProximity, getProximityPoints} from "../functions/MapFunctions";
import l from "lodash";
import randomColor from "randomcolor";
import {saveEvent} from "./ComparisonSlice";

const configureAddFilter = (query, filter) => {
    let dictKey = Object.keys(filter)[0]
    const dictValue = Object.values(filter)[0]
    if (dictKey==="coordinates") {
        dictKey = 'geometry.coordinates'
    } else{
        dictKey = 'properties.' + dictKey
    }

    let queryArray = [...query['$and']]
    const entryIndex = queryArray.findIndex(entry => Object.keys(entry)[0] === dictKey)
    if (entryIndex !== -1) {
        queryArray.splice(entryIndex, 1)
    }
    queryArray.push({[dictKey]: dictValue})

    return {'$and': queryArray}
}

const configureRemoveFilter = (query, filter) => {
    if (filter==="coordinates") {
        filter = 'geometry.coordinates'
    } else{
        filter = 'properties.' + filter
    }

    let isRemoved = false
    let queryArray = [...query['$and']]
    const entryIndex = queryArray.findIndex(entry => Object.keys(entry)[0] === filter)

    if (entryIndex !== -1) {
        isRemoved = true
        queryArray.splice(entryIndex, 1)
    }

    return [isRemoved, {'$and': queryArray}]
}

const getNewProximityPoints = (initialProximityPoints, data, distance) => {
    const initPoints = initialProximityPoints.map(e => e[0])
    const newProximityPoints = []
    initPoints.forEach(p => {
        let existIndex
        if (newProximityPoints.length > 0) {
            existIndex = newProximityPoints.findIndex(list => {
                    return list.findIndex(e => e.coordinates[0] === p.coordinates[0] && e.coordinates[1] === p.coordinates[1]) !== -1
                }
            )
        } else {
            existIndex = -1
        }
        if (existIndex === -1 && data.findIndex(e => e.coordinates[0] === p.coordinates[0] && e.coordinates[1] === p.coordinates[1]) !== -1) {
            newProximityPoints.push(getProximityPoints(p.coordinates, data, distance))
        }
    })
    return newProximityPoints
}

const applyMapFilters = (data, areas, points, proximityPoints) => {
    let newData
    let isAreaFocused
    let isPointFocused
    let isProximityFocused
    [newData, isAreaFocused] = focusArea(data, areas)
    if (isAreaFocused) {
        [newData, isPointFocused] = focusPoints(newData, data, points)
    } else {
        [newData, isPointFocused] = focusPoints(data, data, points)
    }
    if (isAreaFocused || isPointFocused) {
        [newData, isProximityFocused] = focusProximity(newData, proximityPoints, true)
    } else {
        [newData, isProximityFocused] = focusProximity(data, proximityPoints, false)
    }
    return [newData, isAreaFocused || isPointFocused || isProximityFocused]
}

const getData = async (filter, areaFilter) => {
    console.log(filter)
    return await fetch('/getData/', {
        'method': 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filter)
    })
        .then(response => response.json())
        .then(json =>
            json.map(a => {
                a.coordinates = [a.coordinates[1], a.coordinates[0]]
                return a
            }))
        .then(data => {
            let isAreaFocused
            let newData;

            [newData, isAreaFocused] = focusArea(data, areaFilter.focusedArea)

            let isPointFocused
            if (isAreaFocused) {
                [newData, isPointFocused] = focusPoints(newData, data, areaFilter.focusedSpecialPoints)
            } else {
                [newData, isPointFocused] = focusPoints(data, data, areaFilter.focusedSpecialPoints)
            }

            const newPoints = getNewProximityPoints(areaFilter.focusedProximityPoints, data, areaFilter.proximityDistance)
            let isProximityFocused
            if (isAreaFocused || isPointFocused) {
                [newData, isProximityFocused] = focusProximity(newData, newPoints, true)
            } else {
                [newData, isProximityFocused] = focusProximity(data, newPoints, false)
            }

            if (isAreaFocused || isPointFocused || isProximityFocused) {
                newData = [...new Map(newData.map(item => [item.id, item])).values()]
            } else {
                newData = data
            }
            return newData
        })
}

export const changeFilter = createAsyncThunk('posts/changeFilter',
    async (filterData, {getState,dispatch}) => {
        const state = getState()
        let filter = {...state.savings.current.filter}
        const areaFilter = state.savings.current.mapFilter
        let isChanged = false
        for (let e of filterData) {
            if (e.type === "add") {
                isChanged = true
                for (let fe of e.filter) {
                    filter = configureAddFilter(filter, fe)
                }
            } else {
                let isRemoved = false
                for (let fe of e.filter) {
                    [isRemoved, filter] = configureRemoveFilter(filter, fe)
                    isChanged = isChanged || isRemoved
                }
            }
        }

        let timeRange
        let timestampInfo = filterData.find(e => e.type === "add")
        timestampInfo = timestampInfo === undefined ? undefined :
            timestampInfo.filter.find(e => Object.keys(e).includes("timestamp"))
        if (timestampInfo !== undefined) {
            timeRange = [timestampInfo.timestamp['$gt'], timestampInfo.timestamp['$lt']]
        } else {
            timeRange = state.savings.current.timeRange
        }
        if (isChanged) {
            const data = await getData(filter, areaFilter)
            dispatch(setHistogramData(data, timeRange))
            dispatch(setMapData(data))
        }
        return filter
    })

export const reset = createAsyncThunk('posts/resetData',
    async (_,{dispatch, getState}) => {
        dispatch(resetState())
        const savedState = getState()
        const data = await getData(savedState.savings.current.filter, savedState.savings.current.mapFilter)
        dispatch(setHistogramData(data, savedState.savings.current.timeRange))
        dispatch(setMapData(data))
    })

export const revert = createAsyncThunk('posts/revertData',
    async (_, {dispatch, getState}) => {
        dispatch(revertState())
        const savedState = getState()
        const data = await getData(savedState.savings.saved.filter, savedState.savings.current.mapFilter)
        dispatch(setHistogramData(data, savedState.savings.current.timeRange))
        dispatch(setMapData(data))
    })

export const changeMapFilters = () => {
    return (dispatch, getState) => {
        const state = getState()
        let data = state.map.allData
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints
        const proximityDistance = state.map.mapFilters.proximityDistance

        const [newData, hasMapFilters] = applyMapFilters(data, areas, points, proximityPoints)

        dispatch(setHistogramData(newData, state.savings.current.timeRange))
        dispatch(setMapData(newData))
        dispatch(saveMapFilters({
            hasMapFilter: hasMapFilters,
            mapFilter: {
                focusedArea: areas,
                focusedSpecialPoints: points,
                focusedProximityPoints: proximityPoints,
                proximityDistance: proximityDistance
            }
        }))
        dispatch(deleteAllAreas())
    }
}

export const resetMapFilters = createAsyncThunk('posts/restMapFilters',
    async (_, {dispatch, getState}) => {
        const state = getState()
        const areaFilter = {
            focusedArea: {},
            focusedSpecialPoints: {
                add: [],
                delete: []
            },
            focusedProximityPoints: [],
            proximityDistance: state.map.proximityDistance
        }
        const data = await getData(state.savings.current.filter, areaFilter)
        dispatch(setHistogramData(data, state.savings.current.timeRange))
        dispatch(setMapData(data))

        dispatch(saveMapFilters({
            hasMapFilter: false
        }))
        dispatch(deleteAllAreas())
    })

export const checkChanges = () => {
    return (dispatch, getState) => {
        const state = getState()
        return {
            isSaved: state.savings.isSaved,
            isChanged: !l.isEqual(state.savings.savedData, state.map.allData) || !l.isEqual(state.savings.current, state.savings.saved),
            hasMapFilter: dispatch(isMapFilterChanged()),
            state: state
        }
    }
}

export const saveAllChanges = () => {
    return (dispatch, getState) => {
        const state = getState()
        const data = state.map.allData
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints
        const proximityDistance = state.map.mapFilters.proximityDistance
        const current = {...state.savings.current}

        const [newData, hasMapFilters] = applyMapFilters(data, areas, points, proximityPoints)

        current.hasMapFilter = hasMapFilters
        current.mapFilter = {
            focusedArea: areas,
                focusedSpecialPoints: points,
                focusedProximityPoints: proximityPoints,
                proximityDistance: proximityDistance
        }

        dispatch(saveEvent({info: current, data: newData}))
    }
}

export const setSelection = (event) => {
    return (dispatch) => {
        dispatch(initCurrent(event))
        dispatch(setHistogramData(event.data, event.info.timeRange))
        dispatch(setMapData(event.data))
    }
}

export const initNewCurrent = () => {
    return (dispatch, getState) => {
        const state = getState()
        const ids = state.comparison.events.map(e => e.info.id)
        const newId = state.savings.newId
        let id = state.savings.newId
        let color = state.savings.newColor
        if (newId === 0 || ids.includes(newId)) {
            id = Number(l.uniqueId())
            color = randomColor({
                luminosity: 'light'
            })
        }
        const newCurrent = {...initalCurrent}
        newCurrent.id = id
        newCurrent.name = "Event " + id
        newCurrent.color = color
        dispatch(initialize(newCurrent))
    }
}


const initialTimeRange = [new Date("2021-10-07T08:00").getTime(), new Date("2022-06-02T20:00").getTime()]
// const initialTimeRange = [new Date("2022-01-01T09:00").getTime(), new Date("2022-01-01T10:00").getTime()]

const initalCurrent = {
    id: 0,
    category: [],
    intensity: [],
    timeRange: initialTimeRange,
    area: {
        dimension: "all",
        entries: []
    },
    images: "all",
    histogram: {
        bins: 10,
        displayed: false
    },
    name: "",
    color: '#ff8a65',
    filter: {'$and': [
            {'properties.qualityCheckPassed': true},
            {'properties.timesReportedForWeather': {$lt: 5}},
            {'properties.category': {$in: []}},
            {'properties.timestamp': {$gt: initialTimeRange[0], $lt: initialTimeRange[1]}}
        ]},
    hasMapFilter: false,
    mapFilter: {
        focusedArea: {},
        focusedSpecialPoints: {
            add: [],
            delete: []
        },
        focusedProximityPoints: [],
        proximityDistance: 20
    }
}

export const savingsSlice = createSlice({
    name: "savingsSlice",
    initialState: {
        isSaved: false,
        status: 'succeeded',
        newId: 0,
        newColor: "",
        current: initalCurrent,
        saved: initalCurrent,
        savedData: []
    },
    reducers: {
        initialize: (state, action) => {
            state.newId = action.payload.id
            state.newColor = action.payload.color
            state.current = action.payload
            state.saved = action.payload
            state.isSaved = false
            state.savedData = []
        },
        save: (state, action) => {
            state.isSaved = true
            state.saved = {...state.current}
            state.savedData = action.payload
        },
        resetState: (state) => {
            state.current = initalCurrent
        },
        revertState: (state) => {
            state.isSaved = false
            state.current = {...state.saved}
        },
        setCurrent: (state, action) => {
            state.current[action.payload.name] = action.payload.value
        },
        saveMapFilters: (state, action) => {
            state.current.hasMapFilter = action.payload.hasMapFilter
            if (action.payload.hasMapFilter) {
                state.current.mapFilter = action.payload.mapFilter
            }
        },
        initCurrent: (state, action) => {
            state.current = action.payload.info
            state.saved = action.payload.info
            state.savedData = action.payload.data
            state.isSaved = true
        }
    },
    extraReducers(builder) {
        builder
            .addCase(changeFilter.pending, (state) => {
                state.status = 'loading'
            })
            .addCase(changeFilter.fulfilled, (state, action) => {
                state.status = 'succeeded'
                state.current.filter = action.payload
            })
    }

})

export const { initialize, save, resetState, revertState, setCurrent, saveMapFilters, initCurrent } = savingsSlice.actions
export default savingsSlice.reducer