import {createSlice} from "@reduxjs/toolkit";
import {setMapData} from "./MapSlice";

const setPlayerData = (state, props) => {
    const data = props.data === undefined ? state.player.originalData : props.data
    const type = props.type === undefined ? state.player.type : props.type
    const totalTimeRange = props.totalTimeRange === undefined ? state.player.originalTimeRange : props.totalTimeRange
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
    let playerData = timeSteps.map(e => data.filter(d => d.timestamp >= e[0] && d.timestamp < e[1]))
    if (type === "delete") {
        playerData.push([])
    } else {
        playerData.unshift([])
    }
    return playerData
}

const playData = (dispatch, state, playerData, totalTimeRange, currentStep) => {
    const totalSteps = state.player.totalSteps
    const stepTime = state.player.stepTime
    let timerId = state.player.timerId
    clearInterval(timerId)

    timerId = setInterval(() => {
        dispatch(setMapData(playerData[currentStep]))
        dispatch(setCurrentStep(currentStep))
        currentStep++;
        if (currentStep === totalSteps+1) {
            clearInterval(timerId);
        }
    }, stepTime)
    dispatch(setTimerId(timerId))
}

export const playFromStart = () => {
    return (dispatch, getState) => {
        const state = getState()
        let totalTimeRange, playerData

        if (state.player.isPrepared) {
            totalTimeRange = state.player.originalTimeRange
            playerData = state.player.data
        } else {
            const originalData = state.map.allData
            totalTimeRange = state.savings.current.timeRange
            playerData = setPlayerData(state, {data: originalData, totalTimeRange: totalTimeRange})
            dispatch(initPlayer({originalTimeRange: totalTimeRange, originalData: originalData, data: playerData}))
        }

        return playData(dispatch, state, playerData, totalTimeRange, 0)
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
        const playerData = state.player.data
        const totalTimeRange = state.player.originalTimeRange
        const currentStep = state.player.currentStep

        return playData(dispatch, state, playerData, totalTimeRange, currentStep)
    }
}

export const stop = () => {
    return (dispatch, getState) => {
        const state = getState()
        clearInterval(state.player.timerId)
        dispatch(setMapData(state.player.originalData))
        dispatch(stopPlayer())
    }
}

export const moveToStep = (currentStep) => {
    return (dispatch, getState) => {
        const state = getState()
        const playerData = state.player.data
        dispatch(setMapData(playerData[currentStep]))
        dispatch(setCurrentStep(currentStep))
    }
}

export const setPlayerType = (type) => {
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
                const playerData = setPlayerData(state, {type: type})
                dispatch(initPlayer({data: playerData, type: type}))
            }, 200)
            dispatch(setUpdateId(updateId))
        }
    }
}

export const setTotalSteps = (totalSteps) => {
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
                const playerData = setPlayerData(state, {totalSteps: totalSteps})
                dispatch(initPlayer({data: playerData, totalSteps: totalSteps}))
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

        if (state.player.isActive) {
            let updateId = state.player.updateId
            if (updateId !== null) {
                clearTimeout(updateId)
            }
            updateId = setTimeout(() => {
                const playerData = setPlayerData(state, {stepTime: stepTime})
                dispatch(initPlayer({data: playerData, stepTime: stepTime}))
            }, 200)
            dispatch(setUpdateId(updateId))
        }
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
        originalTimeRange: [],
        originalData: [],
        data: []
    },
    reducers: {
        initPlayer: (state, action) => {
            state.updateId = null
            state.isPrepared = true
            state.isActive = true
            if (action.payload.originalTimeRange !== undefined) state.originalTimeRange = action.payload.originalTimeRange
            if (action.payload.originalData !== undefined) state.originalData = action.payload.originalData
            state.data = action.payload.data
            if (action.payload.type !== undefined) state.type = action.payload.type
            if (action.payload.stepTime !== undefined) state.stepTime = action.payload.stepTime
            if (action.payload.totalSteps !== undefined) state.totalSteps = action.payload.totalSteps
        },
        resetPlayer: (state) => {
            state.isPrepared = false
            state.isActive = false
            state.timerId = null
            state.currentStep = 0
            state.originalTimeRange = []
            state.originalData = []
            state.data = []
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
