import {useDispatch, useSelector} from "react-redux";
import {setCurrent} from "../../shared/features/SavingsSlice";
import {StyledInputField, StyledSlider} from "../../../static/style/muiStyling";

const HistogramOptions = () => {
    const dispatch = useDispatch()

    const isDisplayed = useSelector(state => {
        return state.savings.current.histogram.displayed
    })

    const bins = useSelector(state => {
        return state.savings.current.histogram.bins
    })

    const handleSliderChange = (event) => {
        dispatch(setCurrent({name: "histogram", value: {bins: event.target.value, displayed: isDisplayed}}))
    }

    const handleInputChange = (event) => {
        let inputValue = Number(event.target.value)
        if (inputValue === "" || inputValue < 1) {
            inputValue = 1
        } else if (inputValue > 100) {
            inputValue = 100
        }
        dispatch(setCurrent({name: "histogram", value: {bins: inputValue, displayed: isDisplayed}}))
    }

    return(
        <div>
            <p>Bins</p>
            <div className="areaOptions">
                <StyledSlider
                    valueLabelDisplay="off"
                    aria-label="Bin slider"
                    value={bins}
                    min={1}
                    onChange={handleSliderChange}
                    disabled={!isDisplayed}
                />
                <StyledInputField
                    value={bins}
                    size="small"
                    onChange={handleInputChange}
                    inputProps={{
                        step: 1,
                        min: 1,
                        max: 100,
                        type: 'number',
                        'aria-labelledby': 'input-slider',
                    }}
                    disabled={!isDisplayed}
                />
            </div>
        </div>
    )
}

export default HistogramOptions;
