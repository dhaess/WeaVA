import {useDispatch, useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {changeVisibility, deleteEvent} from "../../shared/features/ComparisonSlice";
import {setSelection} from "../../shared/features/SavingsSlice";
import {resetPlayer} from "../../shared/features/PlayerSlice";
import {getIcon} from "../../shared/functions/WeatherIcons";
import Histogram from "./Histogram";
import DeleteDialog from "./DeleteDialog";
import {styled} from "@mui/material/styles";
import {ImageButton, StyledButton} from "../../../static/style/muiStyling";
import Hide from "../../../static/images/hide.png";
import Show from "../../../static/images/show.png";
import Delete from "../../../static/images/delete.png";
import ImagePic from "../../../static/images/image.png";
import {getHistColor} from "../../shared/functions/HistogramFunctions";

const LocalStyledButton = styled(StyledButton)({
    width: "94px",
    marginTop: "0px",
    fontSize: "12px",
    padding: "3px 0px",
    "&:disabled": {
        border: "2px solid #8080807a"
    }
})

const HistogramBox = ({dimensions, id}) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const [event,
        data,
        categories,
        name,
        color,
        hidden
    ] = useSelector(state => {
        const event = state.comparison.events.find(e => e.info.id === id)
        return [event,
            event.data,
            [...new Set(event.data.map(e => e.category))],
            event.info.name,
            event.info.color,
            event.hidden
        ]})

    const histColor = useSelector(state => state.settings.histogram.color)

    const [openDelete, setOpen] = useState(false)

    const [themeColor, setThemeColor] = useState(false)
    const [currHistColor, setCurrHistColor] = useState(["var(--opacity-bg-color)", "var(--main-bg-color)", "var(--shadow-bg-color)"])

    useEffect(() => {
        setThemeColor(histColor === "theme")
        setCurrHistColor(getHistColor(histColor, color))
    }, [color, histColor])

    const setVisibility = (hide) => {
        dispatch(changeVisibility(id, hide))
        dispatch(resetPlayer())
    }

    const editEvent = () => {
        dispatch(setSelection(event))
        dispatch(resetPlayer())
        navigate(`/selection`)
    }

    const deleteId = () => setOpen(true)

    const handleClose = (deleteConfirmed) => {
        setOpen(false)
        if (deleteConfirmed) {
            dispatch(deleteEvent(id))
            dispatch(resetPlayer())
        }
    }

    return (
            <div className={"histogramBox"}>
                <div className="histogramComparisonContent">
                    <div className={"histogramTop"}>
                        <div className={"histogramTitle"}>
                            {categories.map(e => (
                                <div key={e} className={"iconBox"} style={{backgroundColor: color}}>
                                    <img src={getIcon(e)} alt={e} width={18}/>
                                </div>
                            ))}
                            <p style={{marginTop: "0px"}}>{name} - Total reports: {data.length}</p>
                        </div>
                        <div className={"histogramComparisonButtons"}>
                            <LocalStyledButton onClick={editEvent} disabled={hidden}>Edit event</LocalStyledButton>
                            <div hidden={hidden}>
                                <ImageButton onClick={() => setVisibility(true)}>
                                    <img src={Hide} width={18} alt={"hide"}/>
                                </ImageButton>
                            </div >
                            <div hidden={!hidden}>
                                <ImageButton onClick={() => setVisibility(false)}>
                                    <img src={Show} width={18} alt={"show"}/>
                                </ImageButton>
                            </div>
                            <ImageButton onClick={deleteId}>
                                <img src={Delete} width={18} alt={"delete"}/>
                            </ImageButton>
                            <DeleteDialog
                                open={openDelete}
                                name={name}
                                onClose={handleClose}
                            />
                        </div>
                    </div>
                    {!hidden &&
                        <div style={{position: 'relative', height: '200px', width: '500px'}}>
                            <div style={{position: "absolute"}}>
                                <Histogram
                                    id={id}
                                    dimensions={dimensions}
                                />
                            </div>
                            {!themeColor &&
                                <div style={{position: "absolute", bottom: "4px"}}>
                                    <div className="histLegend"><span style={{backgroundColor: currHistColor[1]}}></span><div><div><div/></div><img src={ImagePic} width={18} alt={"noImagePic"}/></div></div>
                                    <div className="histLegend"><span style={{backgroundColor: currHistColor[2]}}></span><div><img src={ImagePic} width={18} alt={"imagePic"}/></div></div>
                                </div>
                            }
                        </div>
                    }
                    {hidden &&
                        <div style={{height: "3px"}}/>
                    }
                </div>
            </div>
        )
}

export default HistogramBox;
