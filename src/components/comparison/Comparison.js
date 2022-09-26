import React from "react";
import {useSelector} from "react-redux";
import Map from "./Map";
import GeneralButtons from "./GeneralButtons";
import "../../static/style/comparison.css"
import HistogramBox from "./histogram/HistogramBox";

const dimensions = {
    width: 500,
    height: 200,
    margin: {
        top: 10,
        right: 40,
        bottom: 60,
        left: 40
    }
}

const Comparison = () => {

    const events = useSelector(state => {
        return state.comparison.events
    })

    return (
        <div>
            <div id="Map">
                <Map/>
                <div id="ComparisonHistogram">
                    {events.map(e => (
                        <HistogramBox
                            key={e.info.id}
                            id={e.info.id}
                            dimensions={dimensions}
                        />
                    ))}
                    <GeneralButtons/>
                </div>
            </div>
            <Map/>
        </div>
    )
}

export default Comparison;
