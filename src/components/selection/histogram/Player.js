import {useDispatch, useSelector} from "react-redux";
import {moveToStep, pause, playFromStart, resume, stop} from "../../shared/features/PlayerSlice";
import {ImageButton, StyledTooltip} from "../../../static/style/muiStyling";
import {styled} from "@mui/material/styles";
import {Box, Slider} from "@mui/material";
import Pause from "../../../static/images/pause.png";
import Play from "../../../static/images/play.png";
import Rewind from "../../../static/images/rewind.png";
import Stop from "../../../static/images/stop.png";

const PlayerSlider = styled(Slider)({
    color: 'var(--main-bg-color)',
    height: 4,
    padding: "6px 0",
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 12,
        width: 12,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
        '&:after': {
            width: '20px',
            height: '20px',
        }
    },
})

const Player = () => {
    const dispatch = useDispatch()

    const [isPlaying,
        isPrepared,
        isActive,
        currentStep,
        totalSteps
    ] = useSelector(state => {
        const player = state.player
        return [player.timerId !== null,
            player.isPrepared,
            player.isActive,
            player.currentStep,
            player.totalSteps]
    })

    const rewindPlayer = () => {
        if (isPlaying) {
            dispatch(playFromStart())
        } else {
            dispatch(moveToStep(0))
        }
    }

    const playPlayer = () => {
        if (isPrepared) {
            dispatch(resume())
        } else {
            dispatch(playFromStart())
        }
    }

    const pausePlayer = () => {
        dispatch(pause())
    }

    const stopPlayer = () => {
        dispatch(stop())
    }

    const handleSliderChange = (event) => {
        dispatch(moveToStep(event.target.value))
    }

    return (
        <div className={"playerBox"}>
            <div>
                <ImageButton disabled={!isPrepared} onClick={rewindPlayer}><img src={Rewind} width={18} alt={"rewind"}/></ImageButton>
                {!isPlaying && <ImageButton onClick={playPlayer}><img src={Play} width={18} alt={"play"}/></ImageButton>}
                {isPlaying && <ImageButton onClick={pausePlayer}><img src={Pause} width={18} alt={"pause"}/></ImageButton>}
                <ImageButton onClick={stopPlayer}><img src={Stop} width={18} alt={"stop"}/></ImageButton>
            </div>
            {isActive &&
                <div style={{position: 'absolute', width: '395px', bottom: '84.5px', flexDirection: 'column'}}>
                    <StyledTooltip title={"Stop player to focus bins"} arrow placement="top" followCursor enterDelay={500}>
                        <Box height={175} width={395}/>
                    </StyledTooltip>
                    <PlayerSlider
                        valueLabelDisplay="off"
                        aria-label="Player Slider"
                        value={currentStep}
                        min={0}
                        max={totalSteps}
                        onChange={handleSliderChange}
                    />
                </div>
            }
        </div>
    )
}

export default Player;
