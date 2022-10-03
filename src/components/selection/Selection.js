import Map from "./map/Map";
import Sidebar from "./sidebar/Sidebar";
import {useDispatch, useSelector} from "react-redux";
import {initNewCurrent} from "../shared/features/SavingsSlice";
import HistogramBox from "./histogram/HistogramBox";

const dimensions = {
    width: 500,
    height: 250,
    margin: {
        top: 10,
        right: 40,
        bottom: 60,
        left: 40
    }
}

const Selection = () => {
    const dispatch = useDispatch()

    const name = useSelector(state => {
        return state.savings.current.name
    })

    if (name === "") {
        dispatch(initNewCurrent())
    }

    return (
        <div className="App" style={{overflow: "hidden"}}>
            <Sidebar/>
            <div id="Map">
                <Map/>
                <div id="Histogram">
                    <HistogramBox
                        dimensions={dimensions}
                    />
                </div>
            </div>
        </div>
    );
}

export default Selection;
