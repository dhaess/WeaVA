import {useDispatch, useSelector} from "react-redux";
import {useState} from "react";
import { HexColorPicker } from "react-colorful";
import $ from "jquery";
import {StyledTextField} from "../../../static/style/muiStyling";
import {setCurrent} from "../../shared/features/SavingsSlice";
import {Box, Popper} from "@mui/material";

export default function ColorSelector() {
    const dispatch = useDispatch()

    const color = useSelector(state => {
        const c = state.savings.current.color
        $("#colorBox").css("backgroundColor", c)
        return c
    })

    const handleTextChange = (event) => {
        dispatch(setCurrent({name: "color", value: event.target.value}))
    }

    const handlePickerChange = (val) => {
        dispatch(setCurrent({name: "color", value: val}))
    }

    const [boxFocus, setBoxFocus] = useState(false)
    const [fieldFocus, setFieldFocus] = useState(false)
    const [pickerFocus, setPickerFocus] = useState(false)


    return(
        <div id="colorAll">
            <Box id="colorOption">
                <input id="colorBox"
                       onFocus={() => setBoxFocus(true)}
                       onBlur={() => setBoxFocus(false)}
                       readOnly
                />
                <StyledTextField
                    id="outlined-basic"
                    label="Color"
                    variant="outlined"
                    size="small"
                    value={color}
                    sx={{
                        width: "100%",
                        fontSize: "16px"
                    }}
                    onChange={handleTextChange}
                    onFocus={() => setFieldFocus(true)}
                    onBlur={() => setFieldFocus(false)}
                />
            </Box>
            <Popper
                open={boxFocus || fieldFocus || pickerFocus}
                anchorEl={document.querySelector("#colorOption")}
                placement={"right"}
            >
                <div id="colorPickerBox">
                    <div className="pin-left"/>
                    <div className="pin">
                        <div
                            className="colorPicker"
                            onFocus={() => setPickerFocus(true)}
                            onBlur={() => setPickerFocus(false)}
                        >
                            <HexColorPicker color={color} onChange={handlePickerChange} />
                        </div>
                    </div>
                </div>
            </Popper>
        </div>
    )
}
