import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import * as d3 from "d3";
import {changeFocusedTimeRange} from "../../shared/features/MapSlice";
import {setBins} from "../../shared/features/SettingsSlice";
import {
    controlBinNumber,
    getBinTimeRange,
    setBinTimeBorders,
    setHistData
} from "../../shared/functions/HistogramFunctions";

const Histogram = ({dimensions}) => {
    const dispatch = useDispatch()

    const [binType,
        binCount,
        divided]
        = useSelector(state => {
        const histogram = state.settings.histogram
        return [histogram.type,
            histogram.bins,
            histogram.divided]
    })

    const [data,
        imageData,
        isFocused,
        focusedData,
        focusedImageData,
        timeRange
    ] = useSelector(state => {
        const histogram = state.histogram
        return [histogram.data,
            histogram.imageData,
            histogram.isFocused,
            histogram.focusedData,
            histogram.focusedImageData,
            histogram.timeRange
        ]})

    const svgRef = useRef(null);

    const [dragStart, setDrag] = useState(undefined)

    useEffect(() => {
        dispatch(setBins({type: binType, bins: binCount, divided: divided}))
    }, [binCount, binType, data, dispatch, divided])

    useEffect(() => {
        const margin = {top: 10, right: 50, bottom: 50, left: 40}
        const width = dimensions.width - dimensions.margin.left - dimensions.margin.right
        const height = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

        const handleMouseDown = (event) => {
            const rectList = document.querySelectorAll('rect')
            const newTimeRange = getBinTimeRange(event.screenX, rectList)
            if (newTimeRange !== undefined) {
                setDrag(newTimeRange)
                dispatch(changeFocusedTimeRange(newTimeRange))
            }
        }

        const handleMouseOver = (event) => {
            const rectList = document.querySelectorAll('rect')
            const newTimeRange = getBinTimeRange(event.screenX, rectList)
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

        const toDelay = controlBinNumber(timeRange, binType, binCount, divided, dispatch)

        if (!toDelay) {
            if (document.getElementsByTagName('g').length>0) {
                d3.select(svgRef.current).select('g').remove()
            }
            if (data.length !== 0) {
                const [binTimeStart, binTimeBorder] = setBinTimeBorders(binType, binCount, timeRange)

                const histDataFocused = isFocused ?
                    setHistData(focusedData, binTimeStart, binTimeBorder) :
                    setHistData(data, binTimeStart, binTimeBorder)

                const histDataUnfocused = isFocused ?
                    setHistData(data, binTimeStart, binTimeBorder) : []

                const imageHistData = isFocused ?
                    setHistData(focusedImageData, binTimeStart, binTimeBorder) :
                    setHistData(imageData, binTimeStart, binTimeBorder)

                const x = d3
                    .scaleTime()
                    .domain([binTimeBorder[0], binTimeBorder.slice(-1)])
                    .range([0, width-25]);

                const yMax = d3.max(isFocused ? histDataUnfocused: histDataFocused, function(d) { return d.length; })
                const y = d3.scaleLinear()
                    .domain([0, yMax]).nice()
                    .range([height, 0]);

                const marginLeft = margin.left+20
                const svg = d3.select(svgRef.current)
                    .append("g")
                    .attr("transform", "translate(" + marginLeft + "," + margin.top + ")")

                const appendData = (data, color, opacity) => {
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
                        .data(data)
                        .enter()
                        .append("rect")
                        .attr("x", 1)
                        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
                        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
                        .attr("height", function(d) { return height - y(d.length); })
                        .style("fill", color)
                        .style("opacity", opacity)
                }


                if (isFocused) {
                    appendData(histDataUnfocused, "var(--opacity-bg-color)", "0.4")
                }
                if (histDataFocused.length !== 0) {
                    appendData(histDataFocused, "var(--main-bg-color)", "1")
                }
                if (divided && imageHistData.length !== 0) {
                    appendData(imageHistData, "var(--shadow-bg-color)", "1")
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
    }, [binCount, binType, data, dimensions, dispatch, divided, dragStart, focusedData, focusedImageData, imageData, isFocused, timeRange]);

    return <>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{flexShrink: "0"}} />
    </>
}

export default Histogram;
