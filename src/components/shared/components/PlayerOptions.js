import {useDispatch, useSelector} from "react-redux";
import * as d3 from "d3";
import {setPlayerType, setStepTime, setTotalSteps} from "../features/PlayerSlice";
import {styled} from "@mui/material/styles";
import {Button, RadioGroup} from "@mui/material";
import {
    StyledFormControl,
    StyledFormControlLabel,
    StyledInputField,
    StyledRadio
} from "../../../static/style/muiStyling";

const OptionStyledInputField = styled(StyledInputField)({
    height: '28px',
    width: '60px',
    "& .MuiInput-input": {
        padding: "0",
    },
})

const DefaultButton = styled(Button)({
    color: 'black',
    fontSize: '12px',
    backgroundColor: 'var(--light-bg-color)',
    padding: '4px',
    height: '24px',
    marginLeft: '6px',
    '&:hover': {
        backgroundColor: 'var(--opacity-bg-color)',
        boxShadow: '1px 1px var(--main-bg-color)',
    }
})

const PlayerOptions = ({additional = false}) => {
    const dispatch = useDispatch()

    const [type,
        stepTime,
        totalSteps
    ] = useSelector(state => {
        const player = state.player
        return [player.type,
            player.stepTime,
            player.totalSteps
        ]
    })

    const [binType,
        binCount]
        = useSelector(state => {
        const histogram = state.settings.histogram
        return [histogram.type,
            histogram.bins]
    })

    const timeRange = useSelector(state => state.savings.current.timeRange)

    const handleTypeChange = (event) => {
        dispatch(setPlayerType(event.target.value, additional))
    }

    const handleTotalStepInputChange = (event) => {
        dispatch(setTotalSteps(Number(event.target.value), additional))
    }

    const setDefaultTotalNumber = () => {
        switch (binType) {
            case "month":
                dispatch(setTotalSteps(d3.timeMonth.count(d3.timeMonth.floor(timeRange[0]), d3.timeMonth.ceil(timeRange[1])), additional))
                break
            case "day":
                dispatch(setTotalSteps(d3.timeDay.count(d3.timeDay.floor(timeRange[0]), d3.timeDay.ceil(timeRange[1])), additional))
                break
            case "hour":
                dispatch(setTotalSteps(d3.timeHour.count(d3.timeHour.floor(timeRange[0]), d3.timeHour.ceil(timeRange[1])), additional))
                break
            case "minute":
                dispatch(setTotalSteps(d3.timeMinute.count(d3.timeMinute.floor(timeRange[0]), d3.timeMinute.ceil(timeRange[1])), additional))
                break
            default:
                dispatch(setTotalSteps(binCount, additional))
        }
    }

    const handleStepTimeInputChange = (event) => {
        dispatch(setStepTime(Number(event.target.value)))
    }

    const setDefaultStepTime = () => {
        dispatch(setStepTime(500))
    }

    return (
        <>
            <p style={{marginBottom: "10px", fontWeight: "bold", fontSize: "larger"}}>Player Options</p>
            <p style={{marginBottom: "5px"}}>Player type</p>
            <StyledFormControl>
                <RadioGroup
                    aria-labelledby="type-group-label"
                    value={type}
                    onChange={handleTypeChange}
                    name="type-group"
                >
                    <StyledFormControlLabel
                        value="add"
                        control={<StyledRadio />}
                        label="Add reports" />
                    <StyledFormControlLabel
                        value="current"
                        control={<StyledRadio />}
                        label="Show report at step"
                    />
                    <StyledFormControlLabel
                        value="delete"
                        control={<StyledRadio />}
                        label="Delete reports"
                    />
                </RadioGroup>
            </StyledFormControl>
            <div style={{display: "flex"}}>
                <p style={{marginBottom: "5px"}}>Number of steps:</p>
                <OptionStyledInputField
                    value={totalSteps}
                    size="small"
                    onChange={handleTotalStepInputChange}
                    inputProps={{
                        step: 1,
                        min: 1,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                    }}
                />
                <DefaultButton onClick={setDefaultTotalNumber}>Equal bin number</DefaultButton>
            </div>
            <div style={{display: "flex"}}>
                <p style={{marginBottom: "5px"}}>Time per step:</p>
                <OptionStyledInputField
                    value={stepTime}
                    size="small"
                    onChange={handleStepTimeInputChange}
                    inputProps={{
                        step: 1,
                        min: 1,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                    }}
                />
                <p style={{marginBottom: "5px"}}>ms</p>
                <DefaultButton onClick={setDefaultStepTime}>default</DefaultButton>
            </div>
        </>
    )
}

export default PlayerOptions;
