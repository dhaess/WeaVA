import {createSlice} from '@reduxjs/toolkit'
import {focusArea, focusPoints, focusProximity, getProximityPoints} from "../functions/MapFunctions";
import l from "lodash";

const maxDataPoints = 1000
const standardProximity = 20

export const setMapData = (data) => {
    return (dispatch, getState) => {
        let mapPoints = []
        if (data.length>maxDataPoints) {
            // todo: aggregate
        } else {
            mapPoints = data.filter((v, i, a) => a.findIndex(v2 => [0, 1].every(k => v2.coordinates[k] === v.coordinates[k])) === i)
        }

        const state = getState()
        let [focusedPoints, unfocusedPoints, isFocused, isMapFocused] = setFocuses(state, [], state.map.mapFilters.focusedArea, {add: [], delete: []}, [], state.map.mapFilters.proximityDistance, data)

        dispatch(setData({
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            allData: data,
            mapPoints: mapPoints,
            focusedPoints: focusedPoints,
            unfocusedPoints: unfocusedPoints
        }))
    }
}

const focusTime = (state, timeRange) => {
    let focused = []

    if (timeRange.length !== 0 && !(state.map.focusedTimeRange[0] === timeRange[0] && state.map.focusedTimeRange[1] === timeRange[1])) {
        for (let e of state.map.allData) {
            if (e.timestamp >= timeRange[0]
                && e.timestamp <= timeRange[1]) {
                focused.push(e)
            }
        }
        return [focused, true]
    } else {
        return [focused, false]
    }
}

const getUnfocused = (allData, focused) => {
    let unfocused = []
    if (allData.length <= maxDataPoints && focused.length <= maxDataPoints) {
        const idList = focused.map(e => e.id)

        for (let e of allData) {
            if (!idList.includes(e.id)) {
                unfocused.push(e)
            }
        }

        unfocused = unfocused.filter((v, i, a) =>
            focused.findIndex(v2 => [0, 1].every(k => v2.coordinates[k] === v.coordinates[k])) === -1 &&
            a.findIndex(v2 => [0, 1].every(k => v2.coordinates[k] === v.coordinates[k])) === i
        )
    }
    return unfocused
}

const setFocuses = (state, timeRange, areas, points, proximityPoints, proximityDistance, loadedData = null) => {
    let focused = []
    let isTimeFocused = false
    let allData = loadedData === null ? state.map.allData : loadedData
    if (timeRange.length !== 0) {
        [focused, isTimeFocused] = focusTime(state, timeRange)
    }

    let isAreaFocused
    if (isTimeFocused) {
        [focused, isAreaFocused] = focusArea(focused, areas)
    } else {
        [focused, isAreaFocused] = focusArea(allData, areas)
    }

    let isPointFocused
    if (isTimeFocused || isAreaFocused) {
        [focused, isPointFocused] = focusPoints(focused, allData, points)
    } else {
        [focused, isPointFocused] = focusPoints(allData, allData, points)
    }

    let isProximityFocused
    if (isTimeFocused || isAreaFocused || isPointFocused) {
        [focused, isProximityFocused] = focusProximity(focused, proximityPoints, true)
    } else {
        [focused, isProximityFocused] = focusProximity(allData, proximityPoints, false)
    }

    if (focused.length <= maxDataPoints) {
        focused = focused.filter((v, i, a) =>
            a.findIndex(v2 => [0, 1].every(k => v2.coordinates[k] === v.coordinates[k])) === i
        )
    }

    const isMapFocused = isAreaFocused || isPointFocused || isProximityFocused

    let unfocused
    let isFocused
    if (isTimeFocused || isMapFocused) {
        isFocused = true
        unfocused = getUnfocused(allData, focused)
    } else {
        isFocused = false
        focused = []
        unfocused = []
    }

    return [focused, unfocused, isFocused, isMapFocused]
}

export const changeFocusedTimeRange = (timeRange) => {
    return (dispatch, getState) => {
        const state = getState()
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints
        const proximityDistance = state.map.mapFilters.proximityDistance

        if (!(state.map.focusedTimeRange[0] === timeRange[0] && state.map.focusedTimeRange[1] === timeRange[1])) {
            const [focused, unfocused, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

            dispatch(setTimeFocus({
                isFocused: isFocused,
                isMapFocused: isMapFocused,
                focusedPoints: focused,
                unfocusedPoints: unfocused,
                focusedTimeRange: timeRange
            }))
        }
    }
}

export const changeFocusedArea = (type, id, newArea = {}) => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = {...state.map.mapFilters.focusedArea}
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints
        const proximityDistance = state.map.mapFilters.proximityDistance

        if (type === "delete") {
            id.forEach(e => delete areas[e])
        } else {
            areas[id] = newArea
        }

        const [focused, unfocused, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

        dispatch(setAreaFocus({
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedPoints: focused,
            unfocusedPoints: unfocused,
            focusedArea: areas
        }))
    }
}

export const changeFocusedPoints = (type, latLng) => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = state.map.mapFilters.focusedArea
        const points = {...state.map.mapFilters.focusedSpecialPoints}
        const proximityPoints = state.map.mapFilters.focusedProximityPoints
        const proximityDistance = state.map.mapFilters.proximityDistance

        if (type === "delete") {
            const index = points["add"].findIndex(e => e.lat === latLng.lat && e.lng === latLng.lng)
            if (index !== -1) {
                let array = [...points["add"]]
                array.splice(index, 1)
                points["add"] = array
            } else {
                let array = [...points["delete"]]
                array.push({...latLng})
                points["delete"] = array
            }
        } else {
            const index = points["delete"].findIndex(e => e.lat === latLng.lat && e.lng === latLng.lng)
            if (index !== -1) {
                let array = [...points["delete"]]
                array.splice(index, 1)
                points["delete"] = array
            } else {
                let array = [...points["add"]]
                array.push({...latLng})
                points["add"] = array
            }
        }

        const [focused, unfocused, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

        dispatch(setPointFocus({
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedPoints: focused,
            unfocusedPoints: unfocused,
            focusedSpecialPoints: points
        }))
    }
}

export const changeFocusedProximityPoints = (latLng) => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        let proximityPoints = [...state.map.mapFilters.focusedProximityPoints]
        const proximityDistance = state.map.mapFilters.proximityDistance

        const index = proximityPoints.findIndex(list =>
            list.findIndex(e => e.coordinates[0] === latLng.lat && e.coordinates[1] === latLng.lng) !== -1
        )
        if (index === -1) {
            const newEntry = getProximityPoints([latLng.lat, latLng.lng], state.map.allData, proximityDistance)
            proximityPoints.push(newEntry)
        } else {
            let array = [...proximityPoints]
            array.splice(index, 1)
            proximityPoints = array
        }

        const [focused, unfocused, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

        dispatch(setProximityFocus({
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedPoints: focused,
            unfocusedPoints: unfocused,
            focusedProximityPoints: proximityPoints
        }))
    }
}

export const changeProximityDistance = (distance) => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints

        const startPoints = proximityPoints.map(e => e[0])
        const newPoints = startPoints.map(e => getProximityPoints(e.coordinates, state.map.allData, distance))

        const [focused, unfocused, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, newPoints, distance)

        dispatch(setProximityFocus({
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedPoints: focused,
            unfocusedPoints: unfocused,
            focusedProximityPoints: newPoints,
            proximityDistance: distance
        }))
    }
}

export const deleteAllAreas = () => {
    return (dispatch, getState) => {
        const state = getState()
        const timeRange = state.map.focusedTimeRange
        const areas = {}
        const points = {add: [], delete: []}
        const proximityPoints = []
        const proximityDistance = state.map.mapFilters.proximityDistance

        const [focused, unfocused, isFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

        dispatch(setDeleted({
            isFocused: isFocused,
            focusedPoints: focused,
            unfocusedPoints: unfocused
        }))
    }
}

export const isMapFilterChanged = () => {
    return (_, getState) => {
        const state = getState()
        return !l.isEqual(state.map.mapFilters, initialMapFilter)
    }
}

const initialMapFilter = {
    focusedArea: {},
    focusedSpecialPoints: {
        add: [],
        delete: []
    },
    focusedProximityPoints: [],
    proximityDistance: standardProximity
}

const initialState = {
    allData: [],
    mapPoints: [],
    isFocused: false,
    isMapFocused: false,
    focusedPoints: [],
    unfocusedPoints: [],
    focusedTimeRange: [],
    mapFilters: initialMapFilter
}

export const mapSlice = createSlice({
    name: 'mapSlice',
    initialState: initialState,
    reducers: {
        setData: (state, action) => {
            state.allData = action.payload.allData
            state.mapPoints = action.payload.mapPoints
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedPoints = action.payload.focusedPoints
            state.unfocusedPoints = action.payload.unfocusedPoints
            state.focusedTimeRange = []
            state.mapFilters.focusedSpecialPoints = {add: [], delete: []}
            state.mapFilters.focusedProximityPoints = []
        },
        setLoading: (state) => {
            state.status = 'loading'
        },
        setTimeFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedPoints = action.payload.focusedPoints
            state.unfocusedPoints = action.payload.unfocusedPoints
            state.focusedTimeRange = action.payload.focusedTimeRange
        },
        setAreaFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedPoints = action.payload.focusedPoints
            state.unfocusedPoints = action.payload.unfocusedPoints
            state.mapFilters.focusedArea = action.payload.focusedArea
        },
        setPointFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedPoints = action.payload.focusedPoints
            state.unfocusedPoints = action.payload.unfocusedPoints
            state.mapFilters.focusedSpecialPoints = action.payload.focusedSpecialPoints
        },
        setProximityFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedPoints = action.payload.focusedPoints
            state.unfocusedPoints = action.payload.unfocusedPoints
            state.mapFilters.focusedProximityPoints = action.payload.focusedProximityPoints
            if (action.payload.proximityDistance !== undefined) {
                state.mapFilters.proximityDistance = action.payload.proximityDistance
            }
        },
        setDeleted: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = false
            state.focusedPoints = action.payload.focusedPoints
            state.unfocusedPoints = action.payload.unfocusedPoints
            state.mapFilters.focusedArea = {}
            state.mapFilters.focusedSpecialPoints = {add: [], delete: []}
            state.mapFilters.focusedProximityPoints = []
        },
        clearMap: (state) => {
            state.allData = []
            state.mapPoints = []
            state.isFocused = false
            state.isMapFocused = false
            state.focusedPoints = []
            state.unfocusedPoints = []
            state.focusedTimeRange = []
            state.mapFilters = initialMapFilter
        }
    }
})

export const {setData, setTimeFocus, setAreaFocus, setPointFocus, setProximityFocus, setDeleted, clearMap} = mapSlice.actions
export default mapSlice.reducer
