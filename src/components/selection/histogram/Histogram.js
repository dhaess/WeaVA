import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import {useDispatch, useSelector} from "react-redux";
import {setCurrent} from "../../shared/features/SavingsSlice";
import {changeFocusedTimeRange} from "../../shared/features/MapSlice";

const Histogram = ({dimensions}) => {
    const dispatch = useDispatch()

    const binCount = useSelector(state => state.savings.current.histogram.bins)

    const [data,
        timeRange
    ] = useSelector(state => {
        const histogram = state.histogram
        return [histogram.data,
            histogram.timeRange
        ]})

    const focusedTimeRange = useSelector(state => state.map.focusedTimeRange)

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

    return <>
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{flexShrink: "0"}} />
    </>
}

export default Histogram;
