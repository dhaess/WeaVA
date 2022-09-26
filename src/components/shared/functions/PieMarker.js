import * as d3 from "d3";
import {useEffect, useRef} from "react";

const useD3 = (renderChartFn, dependencies) => {
    const ref = useRef();

    useEffect(() => {
        renderChartFn(d3.select(ref.current));
        return () => {};
        }, dependencies);
    return ref;
}

const testData = [
    {color: "blue", count: 3},
    {color: "red", count: 2}
]

const PieMarker = (props) => {
    const size = props.size
    const radius = size/2
    const ref = useD3(
        (svg) => {
            const data = testData.map(e => e.count)
            const color = d3.scaleOrdinal()
                .domain(data)
                .range(testData.map(e => e.color))

            const pie = d3.pie().sort(null)

            const dataReady = pie(data)

            svg.selectAll('path').remove()

            svg.selectAll('whatever')
                .data(dataReady)
                .enter()
                .append("path")
                .attr("transform", "translate(" + (radius + 2) + "," + (radius + 2) + ")")
                .attr('d', d3.arc()
                    .innerRadius(0)
                    .outerRadius(radius)
                )
                .attr('fill', (d) => color(d.index))
                .attr("stroke", "black")
                .style("stroke-width", "2px")
                .style("opacity", 0.7)
        }
    )

    return (
        <div>
            <svg
                ref={ref}
                style={{
                    height: size,
                    width: size,
                    marginRight: "0px",
                    marginLeft: "0px",
                }}>
            </svg>
        </div>
    )
}

export default PieMarker;
