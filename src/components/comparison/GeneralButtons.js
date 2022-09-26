import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {StyledButton} from "../../static/style/muiStyling";
import {initNewCurrent} from "../shared/features/SavingsSlice";
import Settings from "../shared/Settings";
// import {getImage2} from "../shared/features/ComparisonSlice";

const GeneralButtons = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleClick = () => {
        dispatch(initNewCurrent())
        navigate(`/selection`)
    }

    // const test = (e) => {
    //     console.log(e)
    //     console.log(dispatch(getImage2(e.target.files[0])))
    // }

    return (
        <div id={"EndButtonContainerComparison"}>
            <StyledButton sx={{marginBottom: "10px"}} onClick={handleClick}>Add Event</StyledButton>
            <Settings/>
            {/*<input*/}
            {/*    type={"file"}*/}
            {/*    name={"test"}*/}
            {/*    onChange={e => test(e)}*/}
            {/*/>*/}
            {/*<img src={"file:///domi/Desktop/TestImages/icy.png"}/>*/}
        </div>
    )
}

export default GeneralButtons;
