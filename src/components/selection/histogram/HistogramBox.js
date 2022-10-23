import React, {useEffect, useState, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Box, Button, CircularProgress, Popper} from "@mui/material";
import $ from 'jquery';
import {changeFilter, setCurrent} from "../../shared/features/SavingsSlice";
import {changeFocusedTimeRange} from "../../shared/features/MapSlice";
import {styled} from "@mui/material/styles";
import Arrow from "../../../static/images/left-arrow.png";
import Histogram from "./Histogram";
import SettingsIcon from "../../../static/images/settings.png";
import HistogramOptions from "./HistogramOptions";
import * as d3 from "d3";

const StyledButton = styled(Button)({
    backgroundColor: "var(--light-bg-color)",
    border: "var(--border-bg-color) 2px solid",
    marginTop: "18px",
    marginBottom: "0px",
    color: "black",
    fontSize: "12px",
    width: "93px",
    height: "52px",
    "&:hover": {
        backgroundColor: "var(--light-bg-color)",
        boxShadow: "1px 1px var(--border-bg-color)"
    },
    "&.Mui-disabled": {
        border: "2px solid #b9b9b9",
    }
})

const OpenCloseButton = styled(Button)({
    position: "absolute",
    bottom: "0",
    left: "0",
    minWidth: "16px",
    marginBottom: "-3px",
    padding: "4px",
    background: "var(--main-bg-color)",
    borderRadius: "0",
    zIndex: "1000",
    "&:hover": {
        backgroundColor: "var(--border-bg-color)",
        boxShadow: "1px 1px var(--shadow-bg-color)"
    }
})

const SettingsButton = styled(Button)({
    color: "var(--main-bg-color)",
    "&:hover": {
        backgroundColor: "var(--light-bg-color)",
        boxShadow: "1px 1px var(--border-bg-color)"
    }
})

const HistogramBox = ({dimensions}) => {
    const dispatch = useDispatch()

    const isLoading = useSelector(state => state.savings.status === "loading")

    const data = useSelector(state => state.histogram.data)

    const [binType,
        binCount]
        = useSelector(state => {
        const histogram = state.savings.current.histogram
        return [histogram.type,
            histogram.bins]
    })
    const [focusedTimeRange,
        focusedData
    ] = useSelector(state => {
        const map = state.map
        return [
            map.focusedTimeRange,
            map.singlePoints.focused
        ]})

    const [showHistogram, setHistogram] = useState(true)

    let anchorRef = useRef()
    const [anchorEl, setAnchorEl] = useState(null)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        setTimeout(() => setAnchorEl(anchorRef?.current), 1)
    },  [anchorRef])

    const handleCloseClick = () => {
        setHistogram(false)
        setOpen(false)
        setAnchorEl(null)
    }

    const handleOpenClick = () => {
        setHistogram(true)
    }

    const resetSelection = () => {
        dispatch(changeFocusedTimeRange([]))
    }

    const openSettings = (e) => {
        setAnchorEl(e.currentTarget)
        setOpen(!open)
    }

    const zoomSelection = async () => {
        const filter = {
            "timestamp": {
                '$gt': focusedTimeRange[0],
                '$lt': focusedTimeRange[1]
            }
        }
        const response = await dispatch(changeFilter([{type: "add", filter: [filter]}]))
        if (response) {
            dispatch(setCurrent({name: "timeRange", value: focusedTimeRange}))
            switch (binType) {
                case "month":
                    if (d3.timeDay.count(d3.timeDay.floor(focusedTimeRange[0]), d3.timeDay.ceil(focusedTimeRange[1])) <= 100) {
                        dispatch(setCurrent({name: "histogram", value: {type: "day", bins: binCount}}))
                    }
                    break
                case "day":
                    if (d3.timeHour.count(d3.timeHour.floor(focusedTimeRange[0]), d3.timeHour.ceil(focusedTimeRange[1])) <= 100) {
                        dispatch(setCurrent({name: "histogram", value: {type: "hour", bins: binCount}}))
                    }
                    break
                case "hour":
                    if (d3.timeMinute.count(d3.timeMinute.floor(focusedTimeRange[0]), d3.timeMinute.ceil(focusedTimeRange[1])) <= 100) {
                        dispatch(setCurrent({name: "histogram", value: {type: "minute", bins: binCount}}))
                    }
                    break
                default:
            }
        }
    }

    const styleDateString = (dateVal) => {
        const date = new Date(dateVal)
        const day = date.getDate()<10 ? "0" + date.getDate() : date.getDate()
        const month = date.getMonth()+1<10 ? "0" + (date.getMonth()+1) : (date.getMonth()+1)
        const year = date.getFullYear()
        const hours = date.getHours()<10 ? "0" + date.getHours() : date.getHours()
        const minutes = date.getMinutes()<10 ? "0" + date.getMinutes() : date.getMinutes()
        return day + "." + month + "." + year + " (" + hours + ":" + minutes + ")"
    }

    useEffect(() => {
        if (isLoading) {
            $(".histogramLoading").css('display', "flex")
        } else {
            $(".histogramLoading").css('display', "none")
        }
    }, [isLoading])

    useEffect(() => {
        if (showHistogram) {
            $(".histogramContent").css('display', "flex")
            $(".histogramMini").css('display', "none")
        } else {
            $(".histogramContent").css('display', "none")
            $(".histogramMini").css('display', "flex")
        }
    }, [showHistogram])

    if (data.length === 0) {
        return (
            <>
                <div style={{margin: "25px"}} className="histogramContent">
                    <OpenCloseButton onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"}/></OpenCloseButton>
                    <div className={"histogramLoading"} style={{display: "none"}}>
                        <CircularProgress size={80}/>
                    </div>
                    <div style={{"fontSize": "40px", "flex": "1"}}>No Data</div>
                </div>
                <div style={{position: "relative", display: "none"}} className={"histogramMini"}>
                    <OpenCloseButton onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"} style={{transform: "rotate(180deg)"}}/></OpenCloseButton>
                </div>
            </>
        )
    } else {
        return <>
            <div className="histogramContent" ref={anchorRef}>
                <OpenCloseButton onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"}/></OpenCloseButton>
                <div className={"histogramLoading"} style={{display: "none"}}>
                    <CircularProgress size={80}/>
                </div>
                <div style={{alignItems: "flex-start"}}>
                    <SettingsButton onClick={openSettings} sx={{minWidth: "0", margin: "2px", marginRight: "25px"}}><img src={SettingsIcon} width={20} alt={"Settings"}/></SettingsButton>
                    <div style={{flexDirection: "column", alignItems: "flex-start", padding: "6px 0px"}}>
                        <p style={{marginTop: "10px"}}>Total reports: {data.length}</p>
                        <p hidden={focusedTimeRange.length===0}>Selected reports: {focusedData.length}</p>
                        <p hidden={focusedTimeRange.length===0}>Time range: {styleDateString(focusedTimeRange[0])} to {styleDateString(focusedTimeRange[1])}</p>
                    </div>
                </div>
                <div>
                    <Histogram
                        dimensions={dimensions}
                    />
                    <div className="histogramButtons">
                        <StyledButton
                            disabled={focusedTimeRange.length===0}
                            onClick={resetSelection}
                        >
                            Reset selection
                        </StyledButton>
                        <StyledButton
                            disabled={focusedTimeRange.length===0}
                            onClick={zoomSelection}
                        >
                            Zoom selection
                        </StyledButton>
                    </div>
                </div>
            </div>
            { anchorEl &&
                <Popper open={open} anchorEl={anchorEl} placement={"top-start"}>
                    <Box sx={{
                        border: "2px solid var(--border-bg-color)",
                        borderLeft: "0",
                        p: 1,
                        backgroundColor: 'white',
                        marginBottom: "3px",
                        marginLeft: "-2px"
                    }}>
                        <HistogramOptions/>
                    </Box>
                </Popper>
            }
            <div style={{position: "relative", display: "none"}} className={"histogramMini"}>
                <OpenCloseButton onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"} style={{transform: "rotate(180deg)"}}/></OpenCloseButton>
            </div>
        </>
    }
}

export default HistogramBox;
