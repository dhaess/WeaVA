import {useDispatch, useSelector} from "react-redux";

import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {changeFilter, setCurrent} from "../../shared/features/SavingsSlice";
import {styled} from "@mui/material/styles";
import {StyledRadio, StyledTextField} from "../../../static/style/muiStyling";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";

const minDataDate = 1633593924245
const maxDataDate = 1654187033966

const minArray = [...Array(60).keys()]
const hourArray = [...Array(24).keys()]
const dayArray = [...Array(365).keys()]

const StyledTimeTextField = styled(StyledTextField)({
    width: "100%",
    '& label': {
        color: 'black',
    },
    paddingTop: "0px",
    marginTop: "10px",
    marginBottom: "15px"
})

const StyledFormControl = styled(FormControl)({
    marginTop: "5px",
})

const StyledInputLabel = styled(InputLabel)({
    width: "calc(133% - 16px)",
    maxWidth: "calc(133% - 16px)",
    textAlign: "center",
    marginLeft: "-8px",
    "&.Mui-focused": {
        color: "black",
    }
})

const StyledSelect = styled(Select)({
    width: "56px",
    marginRight: "5px",
    marginBottom: "10px",
    "& .MuiOutlinedInput-input.MuiSelect-select": {
        padding: "8px 0",
        paddingRight: "0 !important",
        textAlign: "center",
    },
    "& .MuiSelect-icon": {
        display: "none",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        padding: "0 5px 0 5px",
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--main-bg-color)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--main-bg-color)',
    },
})

const timePaperProps = {
    sx: {
        boxShadow: "#000000c4 0px 0px 5px",
        "& .MuiPickersDay-root.Mui-selected": {
            backgroundColor: "var(--main-bg-color)",
        },
        "& .MuiPickersDay-root.Mui-selected:hover": {
            backgroundColor: "var(--main-bg-color)",
        },
        "& .css-118whkv": {
            backgroundColor: "var(--main-bg-color)",
            border: "16px solid var(--main-bg-color)",
        },
        "& .css-7lip4c": {
            backgroundColor: "var(--main-bg-color)",
        },
        "& .css-12ha4i7": {
            backgroundColor: "var(--main-bg-color)",
        },
        "& .css-a1rc6s": {
            backgroundColor: "var(--main-bg-color)",
        },
        "& .css-2ujp1m": {
            border: "16px solid var(--main-bg-color)",
        }
    }
}

const menuProps = {
    sx: {
        height: "200px",
    },
}

const StyledMenuItem = styled(MenuItem)({
    "&.Mui-selected": {
        backgroundColor: '#da876b1a',
    },
    "&.Mui-selected:hover": {
        backgroundColor: '#da876b4f',
    }
})

export default function TimePicker() {
    const dispatch = useDispatch()

    const timeRange = useSelector(state => {
        const stateTimeRange = state.savings.current.timeRange
        return [new Date(stateTimeRange[0]), new Date(stateTimeRange[1])]
    })

    const duration = useSelector(state => {
        const stateTimeRange = state.savings.current.timeRange
        let dist = stateTimeRange[1] - stateTimeRange[0]
        const days = Math.floor(dist / 86400000)
        dist -= days * 86400000
        const hours = Math.floor(dist / 3600000)
        dist -= hours * 3600000
        const minutes = Math.floor(dist / 60000)
        if (days < 0) {
            return [0, 0, 0]
        }
        return [days, hours, minutes]
    })

    const eventTimeRanges = useSelector(state => {
        const events = state.comparison.events
        const timeRanges = []
        events.filter(event => event.info.id !== state.savings.current.id)
            .forEach(event => {
                const index = timeRanges.findIndex(e => e.timeRange[0] === event.info.timeRange[0] && e.timeRange[1] === event.info.timeRange[1])
                if (index === -1) {
                    timeRanges.push({name: event.info.name, timeRange: event.info.timeRange})
                } else {
                    timeRanges[index].name = timeRanges[index].name + ", " + event.info.name
                }
            })
        return timeRanges
    })

    const handleTimeChange1 = (val) => {
        let startVal = val.getTime()
        if (startVal < minDataDate) {
            startVal = minDataDate
        } else if (startVal > maxDataDate) {
            startVal = maxDataDate
        }
        const timeVal = [
            startVal,
            startVal + 1000 * 60 * ( 60 * ( 24 * duration[0] + duration[1]) + duration[2])
        ]
        const delayDebounceFn = setTimeout(() => {
            const filter = {"timestamp": {
                    '$gt': timeVal[0],
                    '$lt': timeVal[1]
                }}
            dispatch(changeFilter([{type: "add", filter: [filter]}]))
            dispatch(setCurrent({name: "timeRange", value: timeVal}))
        }, 1000)

        return () => clearTimeout(delayDebounceFn)
    }

    const handleSelectChange = (event) => {
        const val = Number(event.target.value)
        let endTime = timeRange[0].getTime()
        switch (event.target.name) {
            case "day":
                endTime += val * 86400000 + duration[1] * 3600000 + duration[2] * 60000
                break
            case "hour":
                endTime += duration[0] * 86400000 + val * 3600000 + duration[2] * 60000
                break
            default: endTime += duration[0] * 86400000 + duration[1] * 3600000 + val * 60000
        }
        const timeVal = [timeRange[0].getTime(), endTime]
        if (endTime > maxDataDate) {
            timeVal[1] = maxDataDate
        }
        const filter = {"timestamp": {
                '$gt': timeVal[0],
                '$lt': timeVal[1]
            }}
        dispatch(setCurrent({name: "timeRange", value: timeVal}))
        dispatch(changeFilter([{type: "add", filter: [filter]}]))
    }

    const handleTimeChange2 = (val) => {
        const timeVal = [timeRange[0].getTime(), val.getTime()]
        if (timeVal[1] > maxDataDate) {
            timeVal[1] = maxDataDate
        }
        const delayDebounceFn = setTimeout(() => {
            const filter = {"timestamp": {
                    '$gt': timeVal[0],
                    '$lt': timeVal[1]
                }}
            dispatch(changeFilter([{type: "add", filter: [filter]}]))
            dispatch(setCurrent({name: "timeRange", value: timeVal}))
        }, 1000)

        return () => clearTimeout(delayDebounceFn)
    }

    const setTimeRange = (newRange, isSelected) => {
        if (isSelected || isSelected === undefined) {
            const filter = {"timestamp": {
                    '$gt': newRange[0],
                    '$lt': newRange[1]
                }}
            dispatch(setCurrent({name: "timeRange", value: newRange}))
            dispatch(changeFilter([{type: "add", filter: [filter]}]))
        }
    }

    return (
        <div>
            <p>Time range</p>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                    ampm={false}
                    PaperProps={timePaperProps}
                    inputFormat="dd.MM.yyyy HH:mm"
                    label="Start time"
                    minDate={minDataDate}
                    maxDate={maxDataDate}
                    value={timeRange[0]}
                    onChange={handleTimeChange1}
                    renderInput={(params) => <StyledTimeTextField size={"small"} {...params} />}
                />
                <DateTimePicker
                    ampm={false}
                    PaperProps={timePaperProps}
                    inputFormat="dd.MM.yyyy HH:mm"
                    renderInput={(params) => <StyledTimeTextField size={"small"} {...params} />}
                    label="End time"
                    minDate={timeRange[0]}
                    maxDate={maxDataDate}
                    value={timeRange[1]}
                    onChange={handleTimeChange2}
                />
                <p style={{fontSize: "14px", marginTop: "-12px"}}>or</p>
                <p style={{fontSize: "14px", marginTop: "-5px"}}>Duration (from start time)</p>
                <StyledFormControl size={"small"}>
                    <StyledInputLabel id="demo-simple-select-label">Days</StyledInputLabel>
                    <StyledSelect
                        labelId="daySelect"
                        id="daySelect"
                        value={duration[0]}
                        name={"day"}
                        label="Days"
                        onChange={handleSelectChange}
                        MenuProps={menuProps}
                    >
                        {dayArray.map(e => {
                            return <StyledMenuItem key={e} value={e}>{e}</StyledMenuItem>
                        })}
                    </StyledSelect>
                </StyledFormControl>
                <StyledFormControl size={"small"}>
                    <StyledInputLabel id="demo-simple-select-label">Hours</StyledInputLabel>
                    <StyledSelect
                        labelId="hourSelect"
                        id="hourSelect"
                        value={duration[1]}
                        name={"hour"}
                        label="Hours"
                        onChange={handleSelectChange}
                        MenuProps={menuProps}
                    >
                        {hourArray.map(e => {
                            return <StyledMenuItem key={e} value={e}>{e}</StyledMenuItem>
                        })}
                    </StyledSelect>
                </StyledFormControl>
                <StyledFormControl size={"small"}>
                    <StyledInputLabel id="demo-simple-select-label">Minutes</StyledInputLabel>
                    <StyledSelect
                        labelId="minSelect"
                        id="minSelect"
                        value={duration[2]}
                        name={"min"}
                        label="Minutes"
                        onChange={handleSelectChange}
                        MenuProps={menuProps}
                    >
                        {minArray.map(e => {
                            return <StyledMenuItem key={e} value={e}>{e}</StyledMenuItem>
                        })}
                    </StyledSelect>
                </StyledFormControl>
            </LocalizationProvider>
            {eventTimeRanges.map(event => (
                <div className="areaOptions" key={event.name}>
                    <StyledRadio
                        checked={event.timeRange[0] === timeRange[0].getTime() && event.timeRange[1] === timeRange[1].getTime()}
                        onChange={isSelected => setTimeRange(event.timeRange, isSelected)}
                        value={event.name}
                        name="event-time-buttons"
                        inputProps={{ 'aria-label': event.name }}
                        sx={{
                            margin: "4px 7px 0px 0px;",
                        }}
                    />
                    <p className="singleAreaChoice"
                       onClick={() => setTimeRange(event.timeRange)}>Equal to {event.name}</p>
                </div>
            ))}
        </div>
    )
}




// import $ from 'jquery';
// import DateTimeRangePicker from '@wojtekmaj/react-datetimerange-picker';
// import {useDispatch, useSelector} from "react-redux";
// import {changeFilter, setCurrent} from "../../shared/features/SavingsSlice";
//
// const minDataDate = new Date("2021-10-07")
// const maxDataDate = new Date("2022-06-02")
//
// export default function TimePicker() {
//     const dispatch = useDispatch()
//
//     const timeRange = useSelector(state => {
//         const stateTimeRange = state.savings.current.timeRange
//         return [new Date(stateTimeRange[0]), new Date(stateTimeRange[1])]
//     })
//
//     const handleChange = (val) => {
//         const timeVal = [val[0].getTime(), val[1].getTime()]
//         const delayDebounceFn = setTimeout(() => {
//             if (val[0]<val[1]) {
//                 $('.dateRangePicker').find(".react-datetimerange-picker__wrapper")
//                     .css("border", "var(--main-bg-color) 2px solid")
//                     .css("background-color", "rgb(171 42 42 / 0%")
//                 const filter = {"timestamp": {
//                         '$gt': timeVal[0],
//                         '$lt': timeVal[1]
//                     }}
//                 dispatch(changeFilter([{type: "add", filter: [filter]}]))
//                 dispatch(setCurrent({name: "timeRange", value: timeVal}))
//             } else {
//                 $('.dateRangePicker').find(".react-datetimerange-picker__wrapper")
//                     .css("border", "2px solid #ac2a2a")
//                     .css("background-color", "rgb(171 42 42 / 10%)")
//             }
//         }, 1000)
//
//         return () => clearTimeout(delayDebounceFn)
//     }
//
//     return (
//         <div>
//             <p>Time range</p>
//             <DateTimeRangePicker
//                 onChange={handleChange}
//                 value={timeRange}
//                 showLeadingZeros={true}
//                 disableClock={true}
//                 minDate={minDataDate}
//                 maxDate={maxDataDate}
//                 clearIcon={null}
//                 className={"dateRangePicker"}/>
//         </div>
//     );
// }