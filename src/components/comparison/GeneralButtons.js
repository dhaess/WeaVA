import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {StyledButton} from "../../static/style/muiStyling";
import {initNewCurrent} from "../shared/features/SavingsSlice";
import Settings from "../shared/components/Settings";

const GeneralButtons = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const boxRef = useRef()

    const divided = useSelector(state => state.settings.histogram.divided)
    const events = useSelector(state => state.comparison.events)

    const [anchorEl, setAnchorEl] = useState()
    const [legendStyle, setLegendStyle] = useState({})

    useEffect(() => {
        divided && events.length>0 ? setLegendStyle({flexDirection: "column"}) : setLegendStyle({display: "none", flexDirection: "column"})
    }, [divided, events.length])

    useEffect(() => {
        setTimeout(() => setAnchorEl(boxRef?.current), 1)
        
    },  [boxRef])

    const handleClick = () => {
        dispatch(initNewCurrent())
        navigate(`/selection`)
    }

    return (
        <div id={"EndButtonContainerComparison"} style={{minWidth: "300px"}} ref={boxRef}>
            <StyledButton sx={{marginBottom: "10px"}} onClick={handleClick}>Add Event</StyledButton>
            <div style={{padding: "0 5px 5px 5px", backgroundColor: "white", borderRadius: "8px", ...legendStyle}}>
                <div className="histLegend"><span style={{backgroundColor: "var(--main-bg-color)"}}></span><p>Without images</p></div>
                <div className="histLegend"><span style={{backgroundColor: "var(--shadow-bg-color)"}}></span><p>With images</p></div>
            </div>
            <Settings additional boxAnchor={anchorEl}/>
        </div>
    )
}

export default GeneralButtons;
