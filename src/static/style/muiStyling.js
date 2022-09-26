import {styled} from "@mui/material/styles";
import {Button, Input, Radio, Slider, TextField, Tooltip, tooltipClasses} from "@mui/material";

export const StyledTextField = styled(TextField)({
    '& label.Mui-focused': {
        color: 'black',
    },
    '& .MuiInput-underline:after': {
        borderBottomColor: '#00000080',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: '#00000080',
        },
        '&:hover fieldset': {
            borderColor: 'var(--main-bg-color)',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'var(--main-bg-color)',
        },
        '&.Mui-disabled:hover fieldset': {
            borderColor: '#b3b3b3',
        },
    }
})

export const StyledInputField = styled(Input)({
    border: "solid 2px var(--main-bg-color)",
    borderRadius: "4px",
    flexShrink: "0",
    marginLeft: "12px",
    "&.Mui-focused": {
        border: "solid 2px var(--main-bg-color)",
    },
    "&.Mui-disabled": {
        borderColor: "#8080805e"
    },
    "& .MuiInput-input": {
        textAlign: "end",
    },
    '&:after': {
        borderBottom: "2px solid var(--main-bg-color)",
    },
    '&:hover:not(.Mui-disabled):before': {
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)"
    }
})

export const StyledSlider = styled(Slider)({
    color: 'var(--main-bg-color)',
    height: 8,
    '& .MuiSlider-track': {
        border: 'none',
    },
    '& .MuiSlider-thumb': {
        height: 24,
        width: 24,
        backgroundColor: '#fff',
        border: '2px solid currentColor',
        '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
        },
        '&:before': {
            display: 'none',
        },
    },
})

export const StyledRadio = styled(Radio)({
    color: 'var(--main-bg-color)',
    margin: "9px 6px 0px 0px",
    padding: "0",
    '&.Mui-checked': {
        color: 'var(--main-bg-color)',
    },
})

export const StyledTooltip = styled(({ className, ...props }) => (
    <Tooltip {...props} arrow enterDelay={500} classes={{ popper: className }} />
))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
        backgroundColor: "#efefef",
        color: 'rgba(0, 0, 0, 0.87)',
        fontSize: 12,
        maxWidth: '150px',
        boxShadow: '#00000091 0px 0px 3px',
        textAlign: "center",
    },
    [`& .${tooltipClasses.tooltipPlacementBottom}`]: {
        marginTop: "8px !important",
    },
    [`& .${tooltipClasses.tooltipPlacementTop}`]: {
        marginBottom: "8px !important",
    },
    [`& .${tooltipClasses.arrow}`]: {
        backgroundColor: "#fff0",
        color: '#0000007a',
        fontSize: 11,
        maxWidth: '150px',
    },
}))

export const StyledButton = styled(Button)({
    width: "49%",
    backgroundColor: "white",
    border: "#2f2f2f 2px solid",
    marginTop: "10px",
    color: "black",
    "&:hover": {
        backgroundColor: "var(--opacity-bg-color)",
        boxShadow: "1px 1px grey"
    }
})
