import {createSlice} from "@reduxjs/toolkit";
import {setPointsData} from "../functions/MapFunctions";

const setPlayerData = (state, props, event) => {
    const data = event === undefined ? state.map.allData : event.data
    const totalTimeRange = event === undefined ? state.savings.current.timeRange : event.info.timeRange
    const type = props.type === undefined ? state.player.type : props.type
    const totalSteps = props.totalSteps === undefined ? state.player.totalSteps : props.totalSteps
    const stepDuration = (totalTimeRange[1]-totalTimeRange[0])/totalSteps
    let timeSteps

    switch (type) {
        case "add":
            timeSteps = [...new Array(totalSteps)].map((e, i) => [totalTimeRange[0], totalTimeRange[0]+(i+1)*stepDuration])
            break
        case "delete":
            timeSteps = [...new Array(totalSteps)].map((e, i) => [totalTimeRange[1]-(totalSteps-i)*stepDuration, totalTimeRange[1]])
            break
        case "current":
            timeSteps = [...new Array(totalSteps)].map((e, i) => [totalTimeRange[0]+i*stepDuration, totalTimeRange[0]+(i+1)*stepDuration])
            break
        default:
    }
    let playerData = timeSteps.map(e => data.filter(d => d.timestamp >= e[0] && d.timestamp <= e[1]))
    if (type === "delete") {
        playerData.push([])
    } else {
        playerData.unshift([])
    }
    const histData = playerData.map(e => e.map(e2 => e2.timestamp))
    const histImageData = playerData.map(e => e.filter(e2 => e2.imageName !== null).map(e2 => e2.timestamp))

    if (event !== undefined) {
        return [playerData, histData, histImageData]
    }

    const mapData = playerData.map(e => setPointsData(e))
    return [playerData, mapData, histData, histImageData]
}

const setEventPlayerData = (state, props) => {
    const events = state.comparison.events
    const totalSteps = props.totalSteps === undefined ? state.player.totalSteps : props.totalSteps
    let eventBasicPlayerData = {}
    let eventHistData = {}
    let eventHistImageData = {}

    events.forEach(event => {
        const [playerData, histData, histImageData] = setPlayerData(state, props, event)
        eventBasicPlayerData[event.info.id] = playerData
        eventHistData[event.info.id] = histData
        eventHistImageData[event.info.id] = histImageData
    })

    const eventPlayerData = [...new Array(totalSteps+1)].map((e, i) => events.map((event) => eventBasicPlayerData[event.info.id][i]).flat())
    const eventMapData = eventPlayerData.map(e => setPointsData(e))

    return[eventPlayerData, eventMapData, eventHistData, eventHistImageData]
}

const playData = (dispatch, state, currentStep) => {
    const totalSteps = state.player.totalSteps
    const stepTime = state.player.stepTime
    let timerId = state.player.timerId
    clearInterval(timerId)

    timerId = setInterval(() => {
        dispatch(setCurrentStep(currentStep))
        currentStep++;
        if (currentStep === totalSteps+1) {
            clearInterval(timerId);
        }
    }, stepTime)
    dispatch(setTimerId(timerId))
}

export const playFromStart = (isComparison= false) => {
    return (dispatch, getState) => {
        const state = getState()

        if (!state.player.isPrepared) {
            const [data, mapData, histData, histImageData] = isComparison ? setEventPlayerData(state, {}) : setPlayerData(state, {})
            dispatch(initPlayer({data: data, mapData: mapData, histData: histData, histImageData: histImageData}))
        }
        return playData(dispatch, state, 0)
    }
}

export const pause = () => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(setTimerId(null))
    }
}

export const resume = () => {
    return (dispatch, getState) => {
        const state = getState()
        const currentStep = state.player.currentStep

        return playData(dispatch, state, currentStep)
    }
}

export const stop = () => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(stopPlayer())
    }
}

export const moveToStep = (currentStep) => {
    return (dispatch, getState) => {
        const state = getState()
        if (state.player.timerId === null) {
            dispatch(setCurrentStep(currentStep))
        } else {
            playData(dispatch, state, currentStep)
        }
    }
}

export const setPlayerType = (type, isComparison = false) => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(setTimerId(null))
        dispatch(setLocalType(type))

        if (state.player.isActive) {
            let updateId = state.player.updateId
            if (updateId !== null) {
                clearTimeout(updateId)
            }
            updateId = setTimeout(() => {
                const [data, mapData, histData, histImageData] = isComparison ? setEventPlayerData(state, {type: type}) : setPlayerData(state, {type: type})
                dispatch(initPlayer({data: data, mapData: mapData, histData: histData, histImageData: histImageData, type: type}))
            }, 200)
            dispatch(setUpdateId(updateId))
        }
    }
}

export const setTotalSteps = (totalSteps, isComparison = false) => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(setTimerId(null))
        dispatch(setCurrentStep(0))
        dispatch(setLocalTotalSteps(totalSteps))

        if (state.player.isActive) {
            let updateId = state.player.updateId
            if (updateId !== null) {
                clearTimeout(updateId)
            }
            updateId = setTimeout(() => {
                const [data, mapData, histData, histImageData] = isComparison ? setEventPlayerData(state, {totalSteps: totalSteps}) : setPlayerData(state, {totalSteps: totalSteps})
                dispatch(initPlayer({data: data, mapData: mapData, histData: histData, histImageData: histImageData, totalSteps: totalSteps}))
            }, 200)
            dispatch(setUpdateId(updateId))
        }
    }
}

export const setStepTime = (stepTime) => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(setTimerId(null))
        dispatch(setLocalStepTime(stepTime))
    }
}

export const playerSlice = createSlice(({
    name: "playerSlice",
    initialState: {
        isPrepared: false,
        isActive: false,
        updateId: null,
        timerId: null,
        type: "add",
        stepTime: 500,
        totalSteps: 40,
        currentStep: 0,
        data: [],
        mapData: [],
        histData: [],
        histImageData: []
    },
    reducers: {
        initPlayer: (state, action) => {
            state.updateId = null
            state.isPrepared = true
            state.isActive = true
            state.data = action.payload.data
            state.mapData = action.payload.mapData
            state.histData = action.payload.histData
            state.histImageData = action.payload.histImageData
            if (action.payload.type !== undefined) state.type = action.payload.type
            if (action.payload.stepTime !== undefined) state.stepTime = action.payload.stepTime
            if (action.payload.totalSteps !== undefined) state.totalSteps = action.payload.totalSteps
        },
        resetPlayer: (state) => {
            state.isPrepared = false
            state.isActive = false
            state.timerId = null
            state.currentStep = 0
            state.data = []
            state.mapData = []
            state.histData = []
            state.histImageData = []
        },
        stopPlayer: (state) => {
            state.isActive = false
            state.timerId = null
            state.currentStep = 0
        },
        setTimerId: (state, action) => {
            state.timerId = action.payload
            if (action.payload !== null) state.isActive = true
        },
        setUpdateId: (state, action) => {
            state.updateId = action.payload
        },
        setCurrentStep: (state, action) => {
            state.currentStep = action.payload
        },
        setLocalType: (state, action) => {
            state.type = action.payload
        },
        setLocalTotalSteps: (state, action) => {
            state.totalSteps = action.payload
        },
        setLocalStepTime: (state, action) => {
            state.stepTime = action.payload
        }
    }
}))

export const {initPlayer, resetPlayer, stopPlayer, setTimerId, setUpdateId, setCurrentStep, setLocalType, setLocalTotalSteps, setLocalStepTime} = playerSlice.actions
export default playerSlice.reducer
