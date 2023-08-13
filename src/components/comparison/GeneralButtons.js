import {useDispatch, useSelector} from "react-redux";
import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {moveToStep, resetPlayer} from "../shared/features/PlayerSlice";
import {initNewCurrent} from "../shared/features/SavingsSlice";
import Settings from "../shared/components/Settings";
import Player from "../shared/components/histogram/Player";
import {PlayerSlider, StyledButton} from "../../static/style/muiStyling";
import ImagePic from "../../static/images/image.png";

const GeneralButtons = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const boxRef = useRef()

    const [divided,
        histColor
    ] = useSelector(state => {
        const histogram = state.settings.histogram
        return [histogram.divided,
            histogram.color
        ]})

    const events = useSelector(state => state.comparison.events)

    const [currentStep,
        totalSteps
    ] = useSelector(state => {
        const player = state.player
        return [player.currentStep,
            player.totalSteps
        ]
    })

    const [anchorEl, setAnchorEl] = useState()
    const [legendStyle, setLegendStyle] = useState({})

    const [themeColor, setThemeColor] = useState(false)

    useEffect(() => {
        divided && events.length > 0 ? setLegendStyle({flexDirection: "column"}) : setLegendStyle({display: "none", flexDirection: "column"})
    }, [divided, events.length])

    useEffect(() => {
        setTimeout(() => setAnchorEl(boxRef?.current), 1)
    },  [boxRef])

    useEffect(() => {
        if (histColor === "theme") {
            setThemeColor(true)
        } else {
            setThemeColor(false)
        }
    }, [histColor])

    const handleClick = () => {
        dispatch(initNewCurrent())
        dispatch(resetPlayer())
        navigate(`/selection`)
    }

    const handleSliderChange = (event) => dispatch(moveToStep(event.target.value))

    return (
        <div id={"GeneralButtonContainer"} style={{minWidth: "300px"}} ref={boxRef}>
            {events.length>0 &&
                <>
                    <div id={"SliderBox"}>
                        <div style={{width: '395px', marginTop: '3px'}}>
                            <PlayerSlider
                                valueLabelDisplay="off"
                                aria-label="Player Slider"
                                value={currentStep}
                                min={0}
                                max={totalSteps}
                                onChange={handleSliderChange}
                            />
                        </div>
                        <div id={"ComparisonPlayer"}>
                            <Player isComparison={true}/>
                        </div>
                    </div>
                </>
            }
            <div id={"GeneralButtons"}>
                <StyledButton sx={{marginBottom: "10px"}} onClick={handleClick}>Add Event</StyledButton>
                {themeColor &&
                    <div style={{padding: "5px 5px 1px 5px", backgroundColor: "white", borderRadius: "8px", ...legendStyle}}>
                        <div className="histLegend"><span style={{backgroundColor: "var(--main-bg-color)"}}></span><div><div><div/></div><img src={ImagePic} width={18} alt={"noImagePic"}/></div></div>
                        <div className="histLegend"><span style={{backgroundColor: "var(--shadow-bg-color)"}}></span><div><img src={ImagePic} width={18} alt={"imagePic"}/></div></div>
                    </div>
                }
                <Settings additional boxAnchor={anchorEl}/>
            </div>
        </div>
    )
}

export default GeneralButtons;
