import {createSlice} from '@reduxjs/toolkit'
import {
    focusArea,
    focusPoints,
    focusProximity,
    getProximityPoints,
} from "../functions/MapFunctions";
import l from "lodash";
import {setHistogramFocused} from "./HistogramSlice";

const maxDataPoints = 1000
const standardProximity = 20

export const setMapData = (data) => {
    return (dispatch, getState) => {
        let coordsList = []
        let singlePoints = []
        let multiplePoints = []

        data.forEach(e => {
            let index = coordsList.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
            if (index === -1) {
                singlePoints.push(e)
                coordsList.push({coordinates: e.coordinates, isSingle: true})
            } else {
                if (coordsList[index].isSingle) {
                    let newDouble = singlePoints.splice(singlePoints.findIndex(s => [0, 1].every(k => e.coordinates[k] === s.coordinates[k])), 1)
                    multiplePoints.push({coordinates: e.coordinates, count: 2, focused: [newDouble[0], e], unfocused:[]})
                    coordsList[index].isSingle = false
                } else {
                    let multiIndex = multiplePoints.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
                    multiplePoints[multiIndex].count += 1
                    multiplePoints[multiIndex].focused.push(e)
                }
            }
        })

        const state = getState()
        const [focusedData, singleData, multiData, isFocused, isMapFocused] = setFocuses(state, [], state.map.mapFilters.focusedArea, {add: [], delete: []}, [], state.map.mapFilters.proximityDistance, {singleData: singlePoints, multiData: multiplePoints})

        dispatch(setData({
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedData: focusedData,
            allData: data,
            singlePoints: singleData,
            multiplePoints: multiData
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp)
        }))
    }
}

const focusTime = (state, timeRange, data) => {
    if (timeRange.length !== 0) {
        let focused = []
        data.forEach(e => {
            if (e.timestamp >= timeRange[0]
                && e.timestamp <= timeRange[1]) {
                focused.push(e)
            }
        })
        return [focused, true]
    } else {
        return [data, false]
    }
}

const focusMultiTime = (state, timeRange, data) => {
    if (timeRange.length !== 0) {
        let newData = [...data]
        newData.forEach(p => {
            let newFocused = []
            let newUnfocused = []
            let allMultiPoints = p.focused.concat(p.unfocused)
            allMultiPoints.forEach(e => {
                if (e.timestamp >= timeRange[0]
                    && e.timestamp <= timeRange[1]) {
                    newFocused.push(e)
                } else {
                    newUnfocused.push(e)
                }
            })
            p.focused = newFocused
            p.unfocused = newUnfocused
        })
        return [newData, true]
    } else {
        return [data, false]
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
    let singlePoints, isSingleFocused, isSingleMapFocused, multiPoints, isMultiFocused, isMultiMapFocused
    if (loadedData === null) {
        [singlePoints, isSingleFocused, isSingleMapFocused] = setSingleFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance);
        [multiPoints, isMultiFocused, isMultiMapFocused] = setMultiFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)
    } else {
        [singlePoints, isSingleFocused, isSingleMapFocused] = setSingleFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance, loadedData.singleData);
        [multiPoints, isMultiFocused, isMultiMapFocused] = setMultiFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance, loadedData.multiData)
    }
    const focusedData = singlePoints.focused.concat(multiPoints.map(e => e.focused).flat())
    return [focusedData, singlePoints, multiPoints, isSingleFocused || isMultiFocused, isSingleMapFocused || isMultiMapFocused]
}

const setSingleFocuses = (state, timeRange, areas, points, proximityPoints, proximityDistance, loadedData = null) => {
    let allData = loadedData === null ? state.map.singlePoints.focused.concat(state.map.singlePoints.unfocused) : loadedData
    let [focused, isAreaFocused] = focusArea(allData, areas)

    let isProximityFocused
    [focused, isProximityFocused] = focusProximity(focused, allData, proximityPoints, isAreaFocused)

    let isPointFocused
    [focused, isPointFocused] = focusPoints(focused, allData, points)

    const isMapFocused = isAreaFocused || isPointFocused || isProximityFocused

    let isTimeFocused
    if (timeRange.length !== 0) {
        [focused, isTimeFocused] = focusTime(state, timeRange, focused)
    }

    let unfocused
    let isFocused
    if (isTimeFocused || isMapFocused) {
        isFocused = true
        unfocused = getUnfocused(allData, focused)
    } else {
        isFocused = false
        unfocused = []
    }

    return [{focused: focused, unfocused: unfocused}, isFocused, isMapFocused]
}

const setMultiFocuses = (state, timeRange, areas, points, proximityPoints, proximityDistance, loadedData = null) => {
    let allData = loadedData === null ? [...state.map.multiplePoints] : [...loadedData]
    allData = allData.map(e => {
        let newE = {...e}
        newE.focused = []
        newE.unfocused = e.focused.concat(e.unfocused)
        return newE
    })

    let [focused, isAreaFocused] = focusArea(allData, areas, false)

    let isProximityFocused
    [focused, isProximityFocused] = focusProximity(focused, focused, proximityPoints, isAreaFocused, false)

    if (!(isAreaFocused || isProximityFocused)) {
        focused = allData.map(e => {
            let newE = {...e}
            newE.focused = e.focused.concat(e.unfocused)
            newE.unfocused = []
            return newE
        })
    }

    let isPointFocused
    [focused, isPointFocused] = focusPoints(focused, allData, points, false)

    const isMapFocused = isAreaFocused || isPointFocused || isProximityFocused

    let isTimeFocused
    if (timeRange.length !== 0) {
        [focused, isTimeFocused] = focusMultiTime(state, timeRange, focused)
    }

    let isFocused = isTimeFocused || isMapFocused;

    return [focused, isFocused, isMapFocused]
}

export const changeFocusedTimeRange = (timeRange) => {
    return (dispatch, getState) => {
        const state = getState()
        const areas = state.map.mapFilters.focusedArea
        const points = state.map.mapFilters.focusedSpecialPoints
        const proximityPoints = state.map.mapFilters.focusedProximityPoints
        const proximityDistance = state.map.mapFilters.proximityDistance

        if (!(state.map.focusedTimeRange[0] === timeRange[0] && state.map.focusedTimeRange[1] === timeRange[1])) {
            const [focusedData, singlePoints, multiplePoints, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

            dispatch(setTimeFocus({
                focusedData: focusedData,
                singlePoints: singlePoints,
                multiplePoints: multiplePoints,
                isFocused: isFocused,
                isMapFocused: isMapFocused,
                focusedTimeRange: timeRange
            }))
            dispatch(setHistogramFocused({
                isFocused: isFocused,
                focusedData: focusedData.map(e => e.timestamp)
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

        const [focusedData, singlePoints, multiplePoints, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

        dispatch(setAreaFocus({
            focusedData: focusedData,
            singlePoints: singlePoints,
            multiplePoints: multiplePoints,
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedArea: areas
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp)
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

        const [focusedData, singlePoints, multiplePoints, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

        dispatch(setPointFocus({
            focusedData: focusedData,
            singlePoints: singlePoints,
            multiplePoints: multiplePoints,
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedSpecialPoints: points
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp)
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
            list.findIndex(c => c[0] === latLng.lat && c[1] === latLng.lng) !== -1
        )

        if (index === -1) {
            const coordsList = state.map.singlePoints.focused.map(e => e.coordinates)
                .concat(state.map.singlePoints.unfocused.map(e => e.coordinates))
                .concat(state.map.multiplePoints.map(e => e.coordinates))
            const newEntry = getProximityPoints([latLng.lat, latLng.lng], coordsList, proximityDistance)
            proximityPoints.push(newEntry)
        } else {
            let array = [...proximityPoints]
            array.splice(index, 1)
            proximityPoints = array
        }

        const [focusedData, singlePoints, multiplePoints, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

        dispatch(setProximityFocus({
            focusedData: focusedData,
            singlePoints: singlePoints,
            multiplePoints: multiplePoints,
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedProximityPoints: proximityPoints
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp)
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
        const coordsList = state.map.singlePoints.focused.map(e => e.coordinates)
            .concat(state.map.singlePoints.unfocused.map(e => e.coordinates))
            .concat(state.map.multiplePoints.map(e => e.coordinates))
        const newPoints = startPoints.map(e => getProximityPoints(e, coordsList, distance))

        const [focusedData, singlePoints, multiplePoints, isFocused, isMapFocused] = setFocuses(state, timeRange, areas, points, newPoints, distance)

        dispatch(setProximityFocus({
            focusedData: focusedData,
            singlePoints: singlePoints,
            multiplePoints: multiplePoints,
            isFocused: isFocused,
            isMapFocused: isMapFocused,
            focusedProximityPoints: newPoints,
            proximityDistance: distance
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp)
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

        const [focusedData, singlePoints, multiplePoints, isFocused] = setFocuses(state, timeRange, areas, points, proximityPoints, proximityDistance)

        dispatch(setDeleted({
            focusedData: focusedData,
            singlePoints: singlePoints,
            multiplePoints: multiplePoints,
            isFocused: isFocused
        }))
        dispatch(setHistogramFocused({
            isFocused: isFocused,
            focusedData: focusedData.map(e => e.timestamp)
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
    focusedData: [],
    singlePoints: {focused: [], unfocused: []},
    multiplePoints: [],
    isFocused: false,
    isMapFocused: false,
    focusedTimeRange: [],
    mapFilters: initialMapFilter
}

export const mapSlice = createSlice({
    name: 'mapSlice',
    initialState: initialState,
    reducers: {
        setData: (state, action) => {
            state.allData = action.payload.allData
            state.focusedData = action.payload.focusedData
            state.singlePoints = action.payload.singlePoints
            state.multiplePoints = action.payload.multiplePoints
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedTimeRange = []
            state.mapFilters.focusedSpecialPoints = {add: [], delete: []}
            state.mapFilters.focusedProximityPoints = []
        },
        setLoading: (state) => {
            state.status = 'loading'
        },
        setTimeFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.focusedData = action.payload.focusedData
            state.isMapFocused = action.payload.isMapFocused
            state.singlePoints = action.payload.singlePoints
            state.multiplePoints = action.payload.multiplePoints
            state.focusedTimeRange = action.payload.focusedTimeRange
        },
        setAreaFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedData = action.payload.focusedData
            state.singlePoints = action.payload.singlePoints
            state.multiplePoints = action.payload.multiplePoints
            state.mapFilters.focusedArea = action.payload.focusedArea
        },
        setPointFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedData = action.payload.focusedData
            state.singlePoints = action.payload.singlePoints
            state.multiplePoints = action.payload.multiplePoints
            state.mapFilters.focusedSpecialPoints = action.payload.focusedSpecialPoints
        },
        setProximityFocus: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = action.payload.isMapFocused
            state.focusedData = action.payload.focusedData
            state.singlePoints = action.payload.singlePoints
            state.multiplePoints = action.payload.multiplePoints
            state.mapFilters.focusedProximityPoints = action.payload.focusedProximityPoints
            if (action.payload.proximityDistance !== undefined) {
                state.mapFilters.proximityDistance = action.payload.proximityDistance
            }
        },
        setDeleted: (state, action) => {
            state.isFocused = action.payload.isFocused
            state.isMapFocused = false
            state.focusedData = action.payload.focusedData
            state.singlePoints = action.payload.singlePoints
            state.multiplePoints = action.payload.multiplePoints
            state.mapFilters.focusedArea = {}
            state.mapFilters.focusedSpecialPoints = {add: [], delete: []}
            state.mapFilters.focusedProximityPoints = []
        },
        clearMap: (state) => {
            state.allData = []
            state.focusedData = []
            state.singlePoints = {focused: [], unfocused: []}
            state.multiplePoints = []
            state.isFocused = false
            state.isMapFocused = false
            state.focusedTimeRange = []
            state.mapFilters = initialMapFilter
        }
    }
})

export const {setData, setTimeFocus, setAreaFocus, setPointFocus, setProximityFocus, setDeleted, clearMap} = mapSlice.actions
export default mapSlice.reducer
