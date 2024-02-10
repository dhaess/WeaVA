import {useDispatch, useSelector} from "react-redux";
import {setCurrent} from "../../shared/features/SavingsSlice";
import {StyledTextField} from "../../../static/style/muiStyling";

export default function NameSelector() {
    const dispatch = useDispatch()

    const name = useSelector(state => state.savings.current.name)

    const handleChange = (event) => dispatch(setCurrent({name: "name", value: event.target.value}))

    return (
        <div>
            <StyledTextField
                id="name"
                label="Name"
                variant="outlined"
                size="small"
                defaultValue={name}
                sx={{
                    width: "100%"
                }}
                onChange={handleChange}
            />
        </div>
    )
}
