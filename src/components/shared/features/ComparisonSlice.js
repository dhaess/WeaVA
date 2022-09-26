import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {clearMap} from "./MapSlice";
import {clearHistogram} from "./HistogramSlice";

export const saveEvent = (eventInfo) => {
    return (dispatch, getState) => {
        const state = getState()
        let newEvent
        if (eventInfo === undefined) {
            newEvent = {info: state.savings.saved, data: state.map.allData, hidden:false}
        } else {
            newEvent = {info: eventInfo.info, data: eventInfo.data, hidden: false}
        }
        let index = -1
        if (state.comparison.events.length > 0) {
            index = state.comparison.events.findIndex(e => e.info.id === newEvent.info.id)
        }
        if (index === -1) {
            dispatch(saveComparison(newEvent))
        } else {
            let events = [...state.comparison.events]
            events[index] = newEvent
            dispatch(editComparison(events))
        }
        dispatch(clearMap())
        dispatch(clearHistogram())
    }
}

export const deleteEvent = (id) => {
    return (dispatch, getState) => {
        const state = getState()
        const events = [...state.comparison.events]
        const index = events.findIndex(event => event.info.id === id)
        if (index !== -1) {
            events.splice(index, 1)
            dispatch(editComparison(events))
        }
    }
}

export const changeVisibility = (id, hidden) => {
    return (dispatch, getState) => {
        const state = getState()
        const events = [...state.comparison.events]
        const index = events.findIndex(event => event.info.id === id)
        const event = {...events[index]}
        event.hidden = hidden
        events[index] = event
        dispatch(editComparison(events))
    }
}

// const getImage = async (name) => {
//     return await fetch('getImage', {
//         'method': 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(name)
//     })
//         .then(response => {
//             console.log(response)
//         })
// }
//
// export const getImage2 = createAsyncThunk('posts/getImage',
//     async (file) => {
//     console.log(file.name)
//     const img = await getImage(file.name);
//     return img
//     })

const tempInit = [{"info":{"id":1,"category":["NEBEL"],"intensity":[],"timeRange":[1641024000000,1641027600000],"area":{"dimension":"all","entries":[]},"images":"all","histogram":{"bins":10,"displayed":true},"name":"Event 1","color":"#7fe2e8","filter":{"$and":[{"properties.qualityCheckPassed":true},{"properties.timestamp":{"$gt":1641024000000,"$lt":1641027600000}},{"properties.category":{"$in":["NEBEL"]}}]},"hasMapFilter":false,"mapFilter":{"focusedArea":{},"focusedSpecialPoints":{"add":[],"delete":[]},"focusedProximityPoints":[],"proximityDistance":20}},
    "data":[{"id":84632,"coordinates":[47.195,7.39],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641024122760},{"id":84634,"coordinates":[47.61,9.295],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641024142767},{"id":84628,"coordinates":[47.14,7.34],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641024031000},{"id":84643,"coordinates":[47.595,9.32],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641024312490},{"id":84649,"coordinates":[47.42,8.54],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641024232918},{"id":84653,"coordinates":[47.52,8.19],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641024393171},{"id":84648,"coordinates":[47.42,8.54],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641024357484},{"id":84657,"coordinates":[47.585,9.34],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641024467258},{"id":84661,"coordinates":[46.195,6.19],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641024499324},{"id":84647,"coordinates":[47.365,7.95],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641024343977},{"id":84659,"coordinates":[47.38,8.52],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641024479000},{"id":84683,"coordinates":[47.6,9.035],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641024918770},{"id":84672,"coordinates":[47.58,9.005],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641024805085},{"id":84680,"coordinates":[47.315,7.655],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641024878169},{"id":84671,"coordinates":[47.53,7.845],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641024784350},{"id":84666,"coordinates":[47.5,8.25],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641024588448},{"id":84673,"coordinates":[47.405,8.49],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641024820044},{"id":84687,"coordinates":[47.44,8.13],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641025007221},{"id":84690,"coordinates":[47.545,9.385],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641025160039},{"id":84688,"coordinates":[47.31,8.395],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641024960010},{"id":84691,"coordinates":[47.31,7.815],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641025167346},{"id":84694,"coordinates":[47.435,8.445],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641025285655},{"id":84701,"coordinates":[47.335,8.03],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641025503000},{"id":84706,"coordinates":[47.54,8.475],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641025595884},{"id":84713,"coordinates":[47.525,8.58],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641025841099},{"id":84668,"coordinates":[47.085,8.44],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641024667066},{"id":84700,"coordinates":[46.47,6.395],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641025475919},{"id":84718,"coordinates":[46.595,6.54],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641025904256},{"id":84719,"coordinates":[46.785,6.575],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641025933661},{"id":84722,"coordinates":[47.565,8.545],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641025982000},{"id":84721,"coordinates":[46.265,6.15],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641025989307},{"id":84726,"coordinates":[47.5,8.325],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641026025622},{"id":84728,"coordinates":[47.525,7.695],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026022471},{"id":84740,"coordinates":[46.81,6.62],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026213934},{"id":84732,"coordinates":[47.175,8.515],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641026103000},{"id":84736,"coordinates":[47.495,8.495],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026199000},{"id":84745,"coordinates":[47.35,8.24],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026430483},{"id":84747,"coordinates":[46.435,6.91],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641026527848},{"id":84750,"coordinates":[47.44,8.275],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641026589174},{"id":84753,"coordinates":[47.31,7.93],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026639129},{"id":84749,"coordinates":[47.265,8.205],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026544513},{"id":84756,"coordinates":[46.745,6.625],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641026683818},{"id":84739,"coordinates":[47.48,8.49],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641026226876},{"id":84761,"coordinates":[47.4,8.13],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026803519},{"id":84763,"coordinates":[47.61,9.155],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641026862000},{"id":84772,"coordinates":[46.26,6.15],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026956282},{"id":84768,"coordinates":[47.58,8.25],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026904731},{"id":84778,"coordinates":[47.525,7.815],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026992758},{"id":84781,"coordinates":[46.395,6.93],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641027050665},{"id":84779,"coordinates":[46.255,6.14],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641027058032},{"id":84776,"coordinates":[47.585,9.025],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641026984641},{"id":84777,"coordinates":[47.195,7.385],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641026971000},{"id":84787,"coordinates":[47.67,9.08],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641027091224},{"id":84782,"coordinates":[47.615,8.55],"category":"NEBEL","auspraegung":"NEBEL_LEICHT","timestamp":1641027085000},{"id":84786,"coordinates":[47.14,8.195],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641027128879},{"id":84790,"coordinates":[47.085,8.34],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641027207551},{"id":84788,"coordinates":[47.615,8.55],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641027163000},{"id":84797,"coordinates":[46.995,6.935],"category":"NEBEL","auspraegung":"NEBEL_EXTREM","timestamp":1641027422352},{"id":84799,"coordinates":[47.045,7.095],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641027504447},{"id":84805,"coordinates":[46.185,6.145],"category":"NEBEL","auspraegung":"NEBEL_DICHT","timestamp":1641027597000}],
    "hidden": false
}]

export const comparisonSlice = createSlice({
    name: "comparisonSlice",
    initialState: {
        events: []
        // events: tempInit
    },
    reducers: {
        saveComparison: (state, action) => {
            state.events.push(action.payload)
        },
        editComparison: (state, action) => {
            state.events = action.payload
        }
    }
})

export const {saveComparison, editComparison} = comparisonSlice.actions
export default comparisonSlice.reducer
