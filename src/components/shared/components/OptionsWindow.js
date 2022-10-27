import HistogramOptions from "./HistogramOptions";
import PlayerOptions from "./PlayerOptions";
import {ImageButton} from "../../../static/style/muiStyling";
import Close from "../../../static/images/close.png";

const OptionsWindow = ({additional, setOpenHistOptions}) => {
    return(
        <>
            <ImageButton
                onClick={() => setOpenHistOptions(false)}
                sx={{position: "absolute", right: "10px", padding: "4px", minWidth: "27px"}}>
                <img src={Close} width={18} alt={"close"}/>
            </ImageButton>
            <div style={{display: "flex", flexDirection: "column"}}>
                <HistogramOptions additional={additional}/>
                <PlayerOptions/>
            </div>
        </>
    )
}

export default OptionsWindow;
