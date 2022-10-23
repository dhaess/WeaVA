import {useDispatch, useSelector} from "react-redux";
import {setCurrent} from "../../shared/features/SavingsSlice";
import {StyledInputField, StyledRadio, StyledSlider} from "../../../static/style/muiStyling";
import * as d3 from "d3";
import {useEffect, useState} from "react";

const HistogramOptions = () => {
    const dispatch = useDispatch()

    const [binType,
        binCount]
        = useSelector(state => {
        const histogram = state.savings.current.histogram
        return [histogram.type,
            histogram.bins]
    })

    const timeRange = useSelector(state => state.histogram.timeRange)

    const handleChange = (event) => {
        const val = event.target.value
        handleClick(val)
    }

    const [monthStyle, setMonthStyle] = useState({})
    const [dayStyle, setDayStyle] = useState({})
    const [hourStyle, setHourStyle] = useState({})
    const [minuteStyle, setMinuteStyle] = useState({})
    const [numberStyle, setNumberStyle] = useState({})
    const [topDayStyle, setTopDayStyle] = useState({})
    const [topHourStyle, setTopHourStyle] = useState({})
    const [topMinuteStyle, setTopMinuteStyle] = useState({})

    useEffect(() => {
        const grayOut = {color: "rgb(0,0,0,68%)"}
        setMonthStyle(grayOut)
        setDayStyle(grayOut)
        setHourStyle(grayOut)
        setMinuteStyle(grayOut)
        setNumberStyle({color: "rgb(0,0,0,68%)", marginBottom: "9px"})
        switch (binType) {
            case "month":
                setMonthStyle({})
                break
            case "day":
                setDayStyle({})
                break
            case "hour":
                setHourStyle({})
                break
            case "minute":
                setMinuteStyle({})
                break
            default:
                setNumberStyle({marginBottom: "9px"})
        }
    }, [binType])

    useEffect(() => {
        const topDay = d3.timeDay.count(d3.timeDay.floor(timeRange[0]), d3.timeDay.ceil(timeRange[1])) > 100 ?
            {display: "none"} : {}
        setTopDayStyle(topDay)
        const topHour = d3.timeHour.count(d3.timeHour.floor(timeRange[0]), d3.timeHour.ceil(timeRange[1])) > 100 ?
            {display: "none"} : {}
        setTopHourStyle(topHour)
        const topMinute = d3.timeMinute.count(d3.timeMinute.floor(timeRange[0]), d3.timeMinute.ceil(timeRange[1])) > 100 ?
            {display: "none"} : {}
        setTopMinuteStyle(topMinute)
    }, [timeRange])

    const handleClick = (val) => {
        dispatch(setCurrent({name: "histogram", value: {type: val, bins: binCount}}))
    }

    const handleSliderChange = (event) => {
        dispatch(setCurrent({name: "histogram", value: {type: "number", bins: event.target.value}}))
    }

    const handleInputChange = (event) => {
        let inputValue = Number(event.target.value)
        if (inputValue === "" || inputValue < 1) {
            inputValue = 1
        } else if (inputValue > 100) {
            inputValue = 100
        }
        dispatch(setCurrent({name: "histogram", value: {type: "number", bins: inputValue}}))
    }

    return(
        <div>
            <p>Bins</p>
            <div className="areaOptions">
                <StyledRadio
                    checked={binType === 'month'}
                    onChange={handleChange}
                    value="month"
                    name="bin-buttons"
                    inputProps={{ 'aria-label': 'all' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p className="singleAreaChoice" style={monthStyle}
                   onClick={() => handleClick("month")}>Per month</p>
            </div>
            <div className="areaOptions"  style={topDayStyle}>
                <StyledRadio
                    checked={binType === 'day'}
                    onChange={handleChange}
                    value="day"
                    name="bin-buttons"
                    inputProps={{ 'aria-label': 'all' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p className="singleAreaChoice" style={dayStyle}
                   onClick={() => handleClick("day")}>Per day</p>
            </div>
            <div className="areaOptions"  style={topHourStyle}>
                <StyledRadio
                    checked={binType === 'hour'}
                    onChange={handleChange}
                    value="hour"
                    name="bin-buttons"
                    inputProps={{ 'aria-label': 'all' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p className="singleAreaChoice" style={hourStyle}
                   onClick={() => handleClick("hour")}>Per hour</p>
            </div>
            <div className="areaOptions" style={topMinuteStyle}>
                <StyledRadio
                    checked={binType === 'minute'}
                    onChange={handleChange}
                    value="minute"
                    name="bin-buttons"
                    inputProps={{ 'aria-label': 'all' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p className="singleAreaChoice" style={minuteStyle}
                   onClick={() => handleClick("minute")}>Per minute</p>
            </div>
            <div className="areaOptions">
                <StyledRadio
                    checked={binType === 'number'}
                    onChange={handleChange}
                    value="number"
                    name="bin-buttons"
                    inputProps={{ 'aria-label': 'without' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p className="singleAreaChoice" style={numberStyle}
                   onClick={() => handleClick("number")}>Exact number</p>
                {binType==="number" &&
                    <div style={{display: "flex", width: "300px", marginLeft: "10px"}}>
                        <StyledSlider
                        valueLabelDisplay="off"
                        aria-label="Bin slider"
                        value={binCount}
                        min={1}
                        onChange={handleSliderChange}
                    />
                        <StyledInputField
                            value={binCount}
                            size="small"
                            onChange={handleInputChange}
                            inputProps={{
                                step: 1,
                                min: 1,
                                max: 100,
                                type: 'number',
                                'aria-labelledby': 'input-slider',
                            }}
                        />
                    </div>
                }
            </div>
        </div>
    )
}

export default HistogramOptions;
