import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import {useDispatch, useSelector} from "react-redux";
import {setCurrent} from "../../shared/features/SavingsSlice";
import {changeFocusedTimeRange} from "../../shared/features/MapSlice";

const Histogram = ({dimensions}) => {
    const dispatch = useDispatch()

    const [binType,
        binCount]
        = useSelector(state => {
        const histogram = state.savings.current.histogram
        return [histogram.type,
            histogram.bins]
    })

    const [data,
        isFocused,
        focusedData,
        timeRange
    ] = useSelector(state => {
        const histogram = state.histogram
        return [histogram.data,
            histogram.isFocused,
            histogram.focusedData,
            histogram.timeRange
        ]})

    useEffect(() => {
        dispatch(setCurrent({name: "histogram", value: {type: binType, bins: binCount}}))
    }, [binCount, binType, data, dispatch])

    const svgRef = useRef(null);
    const width = dimensions.width - dimensions.margin.left - dimensions.margin.right,
        height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    const [dragStart, setDrag] = useState(undefined)

    useEffect(() => {
        const margin = {top: 10, right: 50, bottom: 50, left: 40}

        const getBinTimeRange = (x) => {
            const rectList = document.querySelectorAll('rect')
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

        let toDelay = false
        switch (binType) {
            case "day":
                if (d3.timeDay.count(d3.timeDay.floor(timeRange[0]), d3.timeDay.ceil(timeRange[1])) > 100) {
                    toDelay = true
                    dispatch(setCurrent({name: "histogram", value: {type: "month", bins: binCount}}))
                }
                break
            case "hour":
                if (d3.timeHour.count(d3.timeHour.floor(timeRange[0]), d3.timeHour.ceil(timeRange[1])) > 100) {
                    toDelay = true
                    dispatch(setCurrent({name: "histogram", value: {type: "day", bins: binCount}}))
                }
                break
            case "minute":
                if (d3.timeMinute.count(d3.timeMinute.floor(timeRange[0]), d3.timeMinute.ceil(timeRange[1])) > 100) {
                    toDelay = true
                    dispatch(setCurrent({name: "histogram", value: {type: "hour", bins: binCount}}))
                }
                break
            default:
        }

        if (!toDelay) {
            if (document.getElementsByTagName('g').length>0) {
                d3.select(svgRef.current).select('g').remove()
            }
            const marginLeft = margin.left+20
            if (data.length !== 0) {
                const svg = d3.select(svgRef.current)
                    .append("g")
                    .attr("transform", "translate(" + marginLeft + "," + margin.top + ")")

                let binTimeStart
                let binTimeBorder, startTime, endTime
                switch (binType) {
                    case "month":
                        binTimeStart = d3.timeMonths(timeRange[0], timeRange[1])
                        startTime = d3.timeMonth.floor(new Date(timeRange[0]))
                        if (binTimeStart.length === 0 || startTime.getTime() !== binTimeStart[0].getTime()) {
                            binTimeStart.unshift(startTime)
                        }
                        binTimeStart = binTimeStart.map(e => e.getTime())
                        binTimeBorder = [...binTimeStart]
                        endTime = d3.timeMonth.ceil(new Date(timeRange[1])).getTime()
                        if (endTime !== binTimeBorder.slice(-1)) {
                            binTimeBorder.push(new Date(endTime).getTime())
                        }
                        break
                    case "day":
                        binTimeStart = d3.timeDays(timeRange[0], timeRange[1])
                        startTime = d3.timeDay.floor(new Date(timeRange[0]))
                        if (binTimeStart.length === 0 || startTime.getTime() !== binTimeStart[0].getTime()) {
                            binTimeStart.unshift(startTime)
                        }
                        binTimeStart = binTimeStart.map(e => e.getTime())
                        binTimeBorder = [...binTimeStart]
                        endTime = d3.timeDay.ceil(new Date(timeRange[1])).getTime()
                        if (endTime !== binTimeBorder.slice(-1)) {
                            binTimeBorder.push(endTime)
                        }
                        break
                    case "hour":
                        binTimeStart = d3.timeHours(timeRange[0], timeRange[1])
                        startTime = d3.timeHour.floor(new Date(timeRange[0]))
                        if (binTimeStart.length === 0 || startTime.getTime() !== binTimeStart[0].getTime()) {
                            binTimeStart.unshift(startTime)
                        }
                        binTimeStart = binTimeStart.map(e => e.getTime())
                        binTimeBorder = [...binTimeStart]
                        endTime = d3.timeHour.ceil(new Date(timeRange[1])).getTime()
                        if (endTime !== binTimeBorder.slice(-1)) {
                            binTimeBorder.push(endTime)
                        }
                        break
                    case "minute":
                        binTimeStart = d3.timeMinutes(timeRange[0], timeRange[1])
                        startTime = d3.timeMinute.floor(new Date(timeRange[0]))
                        if (binTimeStart.length === 0 || startTime.getTime() !== binTimeStart[0].getTime()) {
                            binTimeStart.unshift(startTime)
                        }
                        binTimeStart = binTimeStart.map(e => e.getTime())
                        binTimeBorder = [...binTimeStart]
                        endTime = d3.timeMinute.ceil(new Date(timeRange[1])).getTime()
                        if (endTime !== binTimeBorder.slice(-1)) {
                            binTimeBorder.push(endTime)
                        }
                        break
                    default:
                        binTimeStart = d3.range(binCount).map(t => timeRange[0] + (t / binCount) * (timeRange[1] - timeRange[0]))
                        binTimeBorder = [...binTimeStart]
                        binTimeBorder.push(timeRange[1])
                }
                const binDataRange = d3
                    .bin()
                    .thresholds(binTimeStart)

                const histData = binDataRange(data)
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

                const setHistData = (d) => {
                    if (d.length === 0) {
                        return []
                    }
                    const binDataRange = d3
                        .bin()
                        .thresholds(binTimeStart)
                    let histData = binDataRange(d)
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
                    return histData
                }

                const [histDataFocused, histDataUnfocused] = isFocused ?
                    [setHistData(focusedData), setHistData(data)] : [setHistData(data), []]

                const x = d3
                    .scaleTime()
                    .domain([binTimeBorder[0], binTimeBorder.slice(-1)])
                    .range([0, width-25]);

                const yMax = d3.max(isFocused ? histDataUnfocused: histDataFocused, function(d) { return d.length; })
                const y = d3.scaleLinear()
                    .domain([0, yMax]).nice()
                    .range([height, 0]);

                if (isFocused) {
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
                        .data(histDataUnfocused)
                        .enter()
                        .append("rect")
                        .attr("x", 1)
                        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                        .attr("height", function(d) { return height - y(d.length); })
                        .style("fill", "var(--opacity-bg-color)")
                }

                if (histDataFocused.length !== 0) {
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
                        .data(histDataFocused)
                        .enter()
                        .append("rect")
                        .attr("x", 1)
                        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                        .attr("height", function(d) { return height - y(d.length); })
                        .style("fill", "var(--main-bg-color)")
                }

                let formatDate = d3.timeFormat("%d.%m.%y");
                if (d3.timeMonth.count(binTimeBorder[0], binTimeBorder.slice(-1))===0) {
                    if (d3.timeDay.count(binTimeBorder[0], binTimeBorder.slice(-1))<2) {
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
        }
    }, [binCount, binType, data, dispatch, dragStart, focusedData, height, isFocused, timeRange, width]);

    return <>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{flexShrink: "0"}} />
    </>
}

export default Histogram;
