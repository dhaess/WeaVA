import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import {useDispatch, useSelector} from "react-redux";
import {Button, CircularProgress} from "@mui/material";
import $ from 'jquery';
import {changeFilter, setCurrent} from "../shared/features/SavingsSlice";
import {changeFocusedTimeRange} from "../shared/features/MapSlice";
import {styled} from "@mui/material/styles";
import Arrow from "../../static/images/left-arrow.png";

const StyledButton = styled(Button)({
    backgroundColor: "var(--opacity-bg-color)",
    border: "var(--main-bg-color) 2px solid",
    marginTop: "18px",
    marginBottom: "0px",
    color: "black",
    fontSize: "12px",
    width: "93px",
    height: "52px",
    "&:hover": {
        backgroundColor: "var(--opacity2-bg-color);",
    },
    "&.Mui-disabled": {
        border: "2px solid #b9b9b9",
    }
})

const Histogram = ({dimensions}) => {
    const dispatch = useDispatch()

    const [isLoading,
        binCount
    ] = useSelector(state => {
        const savings = state.savings
        return [savings.status==="loading",
            savings.current.histogram.bins
        ]})

    const [data,
        timeRange
    ] = useSelector(state => {
        const histogram = state.histogram
        return [histogram.data,
            histogram.timeRange
        ]})

    const [focusedTimeRange,
        focusedData
    ] = useSelector(state => {
        const map = state.map
        return [
            map.focusedTimeRange,
            map.focusedPoints
        ]})

    const [showHistogram, setHistogram] = useState(true)

    const handleCloseClick = () => {
        setHistogram(false)
    }

    const handleOpenClick = () => {
        setHistogram(true)
    }

    const resetSelection = () => {
        dispatch(changeFocusedTimeRange([]))
    }

    const zoomSelection = () => {
        const filter = {"timestamp": {
                '$gt': focusedTimeRange[0],
                '$lt': focusedTimeRange[1]
            }}
        dispatch(changeFilter([{type: "add", filter: [filter]}]))
        dispatch(setCurrent({name: "timeRange", value: focusedTimeRange}))
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

    useEffect(() => {
        dispatch(setCurrent({name: "histogram", value: {bins: binCount, displayed: data.length!==0}}))
    }, [binCount, data, dispatch])

    const svgRef = useRef(null);
    const margin = {top: 10, right: 50, bottom: 50, left: 40},
        width = dimensions.width - dimensions.margin.left - dimensions.margin.right,
        height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    const [dragStart, setDrag] = useState(undefined)

    useEffect(() => {

        const getBinTimeRange = (x) => {
            const rectList = document.querySelector('#Histogram').querySelectorAll('rect')
            let rectBound = []
            for (let rect of rectList) {
                rectBound.push({
                    x: [rect.getBoundingClientRect().left, rect.getBoundingClientRect().right],
                    t: [rect.__data__.x0, rect.__data__.x1]
                })
            }
            const xRect = rectBound.find(rect => rect.x[0] <= x && rect.x[1] >= x)
            if (xRect !== undefined) {
                return xRect.t
            } else {
                return undefined
            }
        }

        const handleMouseDown = (event) => {
            const newTimeRange = getBinTimeRange(event.screenX)
            if (newTimeRange !== undefined) {
                setDrag(newTimeRange)
                dispatch(changeFocusedTimeRange(newTimeRange))
            }
        }

        const handleMouseOver = (event) => {
            const newTimeRange = getBinTimeRange(event.screenX)
            if (newTimeRange !== undefined) {
                if (dragStart !== undefined) {
                    const start = dragStart[0] < newTimeRange[0] ? dragStart[0] : newTimeRange[0]
                    const end = dragStart[1] > newTimeRange[1] ? dragStart[1] : newTimeRange[1]
                    dispatch(changeFocusedTimeRange([start, end]))
                } else {
                    dispatch(changeFocusedTimeRange([]))
                }
            }
        }

        const setFillColor = (d) => {
            return (focusedTimeRange.length > 0 && (d.x0 < focusedTimeRange[0] || d.x1 > focusedTimeRange[1])) ?
                "var(--light-bg-color)" : "var(--main-bg-color)"
        }

        if (document.getElementsByTagName('g').length>0) {
            d3.select(svgRef.current).select('g').remove()
        }
        const marginLeft = margin.left+20
        if (data.length !== 0) {
            const svg = d3.select(svgRef.current)
                .append("g")
                .attr("transform", "translate(" + marginLeft + "," + margin.top + ")")

            const binTimeStart = d3.range(binCount).map(t => timeRange[0] + (t / binCount) * (timeRange[1] - timeRange[0]))
            const binDataRange = d3
                .bin()
                .thresholds(binTimeStart)
            const histData = binDataRange(data);

            let binTimeBorder = [...binTimeStart]
            binTimeBorder.push(timeRange[1])

            histData.map(a => {
                a.x0 = d3.max(binTimeBorder.filter(e => e <= a.x0))
                a.x1 = d3.min(binTimeBorder.filter(e => e >= a.x1))
                return a
            })
            for (let i in binTimeBorder) {
                let iP = Number(i)+1
                if (i < binTimeBorder.length-1) {
                    const binStart = histData.find(e => e.x0 === binTimeBorder[i])
                    if (binStart === undefined) {
                        const newBin = []
                        newBin.x0 = binTimeBorder[i]
                        newBin.x1 = binTimeBorder[iP]
                        histData.push(newBin)
                    }
                }
            }

            const x = d3
                .scaleTime()
                .domain(timeRange)
                .range([0, width-25]);

            const yMax = d3.max(histData, function(d) { return d.length; })
            const y = d3.scaleLinear()
                .domain([0, yMax]).nice() // d3.hist has to be called before the Y axis obviously
                .range([height, 0]);

            svg.append("svg")
                .on("mousedown", (event) => {
                    handleMouseDown(event)
                })
                .on("mousemove", (event) => {
                    if (event.buttons === 1) {
                        handleMouseOver(event)
                    }
                })
                .attr("cursor", "pointer")
                .selectAll("rect")
                .data(histData)
                .enter()
                .append("rect")
                .attr("x", 1)
                .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                .attr("height", function(d) { return height - y(d.length); })
                .style("fill", d => setFillColor(d))

            let formatDate = d3.timeFormat("%d.%m.%y");
            if (d3.timeMonth.count(timeRange[0], timeRange[1])===0) {
                if (d3.timeDay.count(timeRange[0], timeRange[1])<2) {
                    formatDate = d3.timeFormat("%d.%m. %H:%M");
                } else {
                    formatDate = d3.timeFormat("%d.%m.");
                }
            }
            // Add the X Axis
            svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(d3.axisBottom(x).tickFormat(formatDate).ticks(10))
                .selectAll("text")
                .attr("y", 8)
                .attr("x", 5)
                .attr("dy", ".35em")
                .attr("transform", "rotate(45)")
                .style("text-anchor", "start")
                .style("user-select", "none")

            // Add the Y Axis and label
            const yTicks = yMax<10 ? yMax : 5
            svg.append("g")
                .attr("class", "y axis")
                .call(d3.axisLeft(y).ticks(yTicks))
                .style("user-select", "none")

            svg.append("text")
                .attr("transform", "rotate(-90) translate(-25, 0)")
                .attr("y", 6)
                .attr("dy", "-2.9em")
                .style("text-anchor", "end")
                .text("Number of Reports");
        }

    }, [data, binCount, height, margin.bottom, margin.left, margin.right, margin.top, width, focusedTimeRange, dispatch, dragStart, timeRange]);

    if (data.length === 0) {
        return (
            <>
                <div style={{margin: "25px"}} className="histogramContent">
                    <Button id={"histogramButton"} onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"}/></Button>
                    <div className={"histogramLoading"} style={{display: "none"}}>
                        <CircularProgress size={80}/>
                    </div>
                    <div style={{"fontSize": "40px", "flex": "1"}}>No Data</div>
                </div>
                <div style={{position: "relative"}} className={"histogramMini"}>
                    <Button id={"histogramButton"} onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"} style={{transform: "rotate(180deg)"}}/></Button>
                </div>
            </>
        )
    } else {
        return <>
            <div className="histogramContent">
                <Button id={"histogramButton"} onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"}/></Button>
                <div className={"histogramLoading"} style={{display: "none"}}>
                    <CircularProgress size={80}/>
                </div>
                <div style={{flexDirection: "column"}}>
                    <p style={{marginTop: "10px"}}>Total reports: {data.length}</p>
                    <p hidden={focusedTimeRange.length===0}>Selected reports: {focusedData.length}</p>
                    <p hidden={focusedTimeRange.length===0}>Time range: {styleDateString(focusedTimeRange[0])} to {styleDateString(focusedTimeRange[1])}</p>
                </div>
                <div>
                    <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{flexShrink: "0"}} />
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
            <div style={{position: "relative"}} className={"histogramMini"}>
                <Button id={"histogramButton"} onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"} style={{transform: "rotate(180deg)"}}/></Button>
            </div>
        </>
    }
}

export default Histogram;
