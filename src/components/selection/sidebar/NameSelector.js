import {useDispatch, useSelector} from "react-redux";
import {StyledTextField} from "../../../static/style/muiStyling";
import {setCurrent} from "../../shared/features/SavingsSlice";

export default function NameSelector() {
    const dispatch = useDispatch()

    const name = useSelector(state => {
        return state.savings.current.name
    })

    const handleChange = (event) => {
        dispatch(setCurrent({name: "name", value: event.target.value}))
    }

    return (
        <div>
            <StyledTextField
                id="outlined-basic"
                label="Name"
                variant="outlined"
                size="small"
                value={name}
                sx={{
                    width: "100%"
                }}
                onChange={handleChange}
            />
        </div>
    )
}