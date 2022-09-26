import {StyledRadio} from "../../../static/style/muiStyling";
import {useDispatch, useSelector} from "react-redux";
import $ from "jquery";
import {changeFilter, setCurrent} from "../../shared/features/SavingsSlice";

export default function ImageSelect() {
    const dispatch = useDispatch()

    const images = useSelector(state => {
        return state.savings.current.images
    })

    const handleChange = (event) => {
        const val = event.target.value
        handleClick(val)
    }

    const handleClick = (val) => {
        if (val === "all") {
            $("#AllImages").css("color", "")
        } else {
            $("#AllImages").css("color", "rgb(0,0,0,68%)")
        }
        if (val === "with") {
            $("#WithPictures")
                .css("color", "")
        } else {
            $("#WithPictures")
                .css("color", "rgb(0,0,0,68%)")
        }
        if (val === "without") {
            $("#WithoutPictures")
                .css("color", "")
        } else {
            $("#WithoutPictures")
                .css("color", "rgb(0,0,0,68%)")
        }
        dispatch(setCurrent({name: "images", value: val}))
        switch (val) {
            case "with":
                dispatch(changeFilter([{type: "add", filter: [{"imageUrl": {'$ne': null}}, {"timesReportedForImage": {'$lt': 1}}]}]))
                break
            case "without":
                dispatch(changeFilter([{type: "add", filter: [{"imageUrl": null}]}, {type: "remove", filter: ["timesReportedForImage"]}]))
                break
            default:
                dispatch(changeFilter([{type: "remove", filter: ["imageUrl", "timesReportedForImage"]}]))
        }
    }

    return (
        <div>
            <p>Containing Images</p>
            <div className="areaOptions">
                <StyledRadio
                    checked={images === 'all'}
                    onChange={handleChange}
                    value="all"
                    name="image-buttons"
                    inputProps={{ 'aria-label': 'all' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p id="AllImages" className="singleAreaChoice" onClick={() => handleClick("all")}>With & without pictures</p>
            </div>
            <div className="areaOptions">
                <StyledRadio
                    checked={images === 'with'}
                    onChange={handleChange}
                    value="with"
                    name="image-buttons"
                    inputProps={{ 'aria-label': 'with' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p id="WithPictures" className="singleAreaChoice" style={{color: "rgb(0,0,0,68%)"}}
                   onClick={() => handleClick("with")}>With pictures</p>
            </div>
            <div className="areaOptions">
                <StyledRadio
                    checked={images === 'without'}
                    onChange={handleChange}
                    value="without"
                    name="image-buttons"
                    inputProps={{ 'aria-label': 'without' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p id="WithoutPictures" className="singleAreaChoice" style={{color: "rgb(0,0,0,68%)"}}
                   onClick={() => handleClick("without")}>Without pictures</p>
            </div>
        </div>
    )
}
