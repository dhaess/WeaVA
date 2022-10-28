import {useDispatch, useSelector} from "react-redux";
import {changeFilter, setCurrent} from "../../shared/features/SavingsSlice";
import {styled} from "@mui/material/styles";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {DateTimePicker, LocalizationProvider} from "@mui/x-date-pickers";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {StyledRadio, StyledTextField} from "../../../static/style/muiStyling";

const minDataDate = new Date("2021-10-07T08:00").getTime()
const maxDataDate = new Date("2022-06-02T20:00").getTime()

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
        borderColor: 'var(--border-bg-color)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'var(--border-bg-color)',
        boxShadow: "1px 1px var(--shadow-bg-color)"
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
            boxShadow: "1px 1px var(--shadow-bg-color)"
        },
        "& .css-118whkv": {
            backgroundColor: "var(--main-bg-color)",
            border: "16px solid var(--border-bg-color)",
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
            border: "16px solid var(--border-bg-color)",
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

    const handleStartTimeChange = (val) => {
        if (!isNaN(val)) {
            let startVal = val.getTime()
            if (startVal < minDataDate) {
                startVal = minDataDate
            } else if (startVal > maxDataDate) {
                startVal = maxDataDate
            }
            let timeVal = [
                startVal,
                startVal + 1000 * 60 * ( 60 * ( 24 * duration[0] + duration[1]) + duration[2])
            ]
            if (timeRange[1].getTime() === maxDataDate) {
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
    }

    const handleEndTimeChange = (val) => {
        const timeVal = [timeRange[0].getTime(), val.getTime()]
        if (timeVal[1] > maxDataDate) timeVal[1] = maxDataDate
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
        if (endTime > maxDataDate) timeVal[1] = maxDataDate
        const filter = {"timestamp": {
                '$gt': timeVal[0],
                '$lt': timeVal[1]
            }}
        dispatch(setCurrent({name: "timeRange", value: timeVal}))
        dispatch(changeFilter([{type: "add", filter: [filter]}]))
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
                    // onError={(e) => {console.log(e, "invalidDate", e === "invalidDate")}}
                    onChange={handleStartTimeChange}
                    renderInput={(params) => <StyledTimeTextField size={"small"} {...params} />}
                    sx={{}}
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
                    // onError={(e) => {console.log(e)}}
                    onChange={handleEndTimeChange}
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
