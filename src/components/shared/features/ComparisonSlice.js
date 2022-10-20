import {createSlice} from "@reduxjs/toolkit";
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

const tempInit = [{"info":{"id":1,"category":["BEWOELKUNG"],"intensity":[],"timeRange":[1641024000000,1641027600000],"area":{"dimension":"all","entries":[]},"images":"all","histogram":{"bins":10,"displayed":true},"name":"Event 1","color":"#c0fcae","filter":{"$and":[{"properties.qualityCheckPassed":true},{"properties.timesReportedForWeather":{"$lt":5}},{"properties.timestamp":{"$gt":1641024000000,"$lt":1641027600000}},{"properties.category":{"$in":["BEWOELKUNG"]}}]},"hasMapFilter":false,"mapFilter":{"focusedArea":{},"focusedSpecialPoints":{"add":[],"delete":[]},"focusedProximityPoints":[],"proximityDistance":20}},"data":[{"id":84629,"coordinates":[46.835,9.67],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024033512},{"id":84627,"coordinates":[46.835,9.63],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024009963},{"id":84636,"coordinates":[47.465,7.855],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024132691},{"id":84631,"coordinates":[47.01,6.655],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024095524},{"id":84633,"coordinates":[46.445,9.365],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024132556},{"id":84630,"coordinates":[45.985,9.025],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641024081186},{"id":84638,"coordinates":[46.83,7.025],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024241000},{"id":84646,"coordinates":[47.43,7.705],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024338056},{"id":84640,"coordinates":[46.48,6.23],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024282357},{"id":84635,"coordinates":[47.45,8.65],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024121448},{"id":84644,"coordinates":[46.82,9.71],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024269410},{"id":84655,"coordinates":[47.405,8.685],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024411933},{"id":84651,"coordinates":[47.38,8.535],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024398735},{"id":84639,"coordinates":[47.32,8.8],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024245702},{"id":84641,"coordinates":[46.54,6.335],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024319801},{"id":84642,"coordinates":[46.825,6.945],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641024306700},{"id":84662,"coordinates":[47.39,8.52],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024350000},{"id":84656,"coordinates":[45.865,9.395],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641024447329},{"id":84650,"coordinates":[47.525,7.845],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024351630},{"id":84652,"coordinates":[46.78,9.68],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024400391},{"id":84654,"coordinates":[45.435,8.89],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024381000},{"id":84645,"coordinates":[47.42,8.54],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024239453},{"id":84658,"coordinates":[46.93,9.535],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024466520},{"id":84664,"coordinates":[47.14,7.48],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024531161},{"id":84663,"coordinates":[47.03,6.74],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024535399},{"id":84669,"coordinates":[47.06,7.62],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024761735},{"id":84670,"coordinates":[47.355,8.525],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024785918},{"id":84675,"coordinates":[46,9.395],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641024853090},{"id":84677,"coordinates":[46.79,9.16],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024869368},{"id":84678,"coordinates":[46.64,6.64],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024870112},{"id":84679,"coordinates":[47.485,8.055],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024842000},{"id":84676,"coordinates":[47.06,6.9],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024849924},{"id":84681,"coordinates":[47.335,9.225],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024910234},{"id":84674,"coordinates":[46.64,6.64],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024835321},{"id":84667,"coordinates":[46.545,6.03],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024573248},{"id":84665,"coordinates":[47.485,7.105],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024541137},{"id":84685,"coordinates":[47.08,9.475],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641024949860},{"id":84682,"coordinates":[46.1,8.28],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641024893748},{"id":84692,"coordinates":[47.1,8.27],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025245629},{"id":84693,"coordinates":[47.295,9.095],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025248949},{"id":84697,"coordinates":[46.205,9.02],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKIG","timestamp":1641025432384},{"id":84696,"coordinates":[46.5,7.67],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025406000},{"id":84689,"coordinates":[46.68,7.13],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025112355},{"id":84702,"coordinates":[45.825,9.395],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641025517485},{"id":84712,"coordinates":[47.17,8.98],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025832186},{"id":84704,"coordinates":[47.365,8.51],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025603736},{"id":84711,"coordinates":[47.135,8.74],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025836747},{"id":84708,"coordinates":[45.605,8.905],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641025646009},{"id":84710,"coordinates":[46.38,7.63],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025742279},{"id":84705,"coordinates":[47.02,7.765],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025525000},{"id":84709,"coordinates":[47.245,7.34],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025718061},{"id":84730,"coordinates":[47.49,7.585],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025800000},{"id":84698,"coordinates":[46.475,6.385],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025453842},{"id":84720,"coordinates":[46.265,6.15],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025977771},{"id":84714,"coordinates":[46.75,7.635],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025866237},{"id":84725,"coordinates":[47.335,9.585],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026002731},{"id":84724,"coordinates":[46.475,7.145],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641025991000},{"id":84727,"coordinates":[46.98,8.575],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026042374},{"id":84723,"coordinates":[45.85,8.795],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641025993000},{"id":84735,"coordinates":[47.345,7.7],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026195612},{"id":84731,"coordinates":[47.565,7.635],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026054689},{"id":84729,"coordinates":[47.215,8.605],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026033000},{"id":84733,"coordinates":[47.39,9.27],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026128634},{"id":84741,"coordinates":[46.975,8.76],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026298884},{"id":84742,"coordinates":[47.38,9.545],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026311492},{"id":84743,"coordinates":[46.98,8.665],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026320408},{"id":84734,"coordinates":[47.15,7],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026163000},{"id":84737,"coordinates":[46.955,7.97],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026198452},{"id":84746,"coordinates":[47.55,10.235],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026503968},{"id":84748,"coordinates":[47.13,9.525],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026540476},{"id":84754,"coordinates":[46.97,9.69],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026661737},{"id":84757,"coordinates":[46.505,7.29],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026664594},{"id":84738,"coordinates":[45.855,8.8],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641026220000},{"id":84752,"coordinates":[47.485,8.055],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026485000},{"id":84744,"coordinates":[47.085,7.48],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026341011},{"id":84751,"coordinates":[45.82,8.825],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641026615102},{"id":84755,"coordinates":[46.175,8.82],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026649707},{"id":84764,"coordinates":[47.195,7.175],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026874379},{"id":84759,"coordinates":[47.295,9.665],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026782466},{"id":84765,"coordinates":[46.69,7.905],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026880435},{"id":84760,"coordinates":[47.305,9.08],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641026750000},{"id":84758,"coordinates":[47.145,8.75],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026737000},{"id":84766,"coordinates":[47.445,9.135],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026910550},{"id":84769,"coordinates":[47.335,7.235],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026931787},{"id":84762,"coordinates":[45.815,8.82],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641026829141},{"id":84773,"coordinates":[47.505,7.71],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026957469},{"id":84771,"coordinates":[47.04,9.065],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026948126},{"id":84767,"coordinates":[46.425,9.215],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026891772},{"id":84774,"coordinates":[46.615,6.23],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026970192},{"id":84775,"coordinates":[47.39,8.685],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641026975534},{"id":84783,"coordinates":[47.04,8.77],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027099830},{"id":84780,"coordinates":[46.425,8.16],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027010237},{"id":84785,"coordinates":[46.825,8.03],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027112935},{"id":84784,"coordinates":[46.84,9.29],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027127388},{"id":84789,"coordinates":[46.245,6.125],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027191450},{"id":84791,"coordinates":[47.28,7.525],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027237167},{"id":84795,"coordinates":[45.775,8.435],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_LEICHT_BEWOELKT","timestamp":1641027401746},{"id":84796,"coordinates":[46.49,7.565],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027405320},{"id":84798,"coordinates":[46.78,7.155],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027458295},{"id":84793,"coordinates":[47.42,8.93],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027345350},{"id":84800,"coordinates":[46.87,7.625],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027496895},{"id":84801,"coordinates":[47.44,9.47],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027502443},{"id":84803,"coordinates":[46.6,8.505],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027524763},{"id":84802,"coordinates":[46.095,7.26],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027526750},{"id":84804,"coordinates":[47.16,9.475],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027556561},{"id":84792,"coordinates":[47.265,8.205],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027329291},{"id":84794,"coordinates":[45.835,8.775],"category":"BEWOELKUNG","auspraegung":"BEWOELKUNG_WOLKENLOS","timestamp":1641027324000}],"hidden":false},{"info":{"id":2,"category":["WIND"],"intensity":[],"timeRange":[1641024000000,1641027600000],"area":{"dimension":"all","entries":[]},"images":"all","histogram":{"bins":10,"displayed":true},"name":"Event 2","color":"#be76f2","filter":{"$and":[{"properties.qualityCheckPassed":true},{"properties.timesReportedForWeather":{"$lt":5}},{"properties.timestamp":{"$gt":1641024000000,"$lt":1641027600000}},{"properties.category":{"$in":["WIND"]}}]},"hasMapFilter":false,"mapFilter":{"focusedArea":{},"focusedSpecialPoints":{"add":[],"delete":[]},"focusedProximityPoints":[],"proximityDistance":20}},"data":[{"id":84684,"coordinates":[47.08,9.475],"category":"WIND","auspraegung":"WIND_SCHWACH","timestamp":1641024926409}],"hidden":false}]

export const comparisonSlice = createSlice({
    name: "comparisonSlice",
    initialState: {
        // events: []
        events: tempInit
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
