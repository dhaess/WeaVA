import {StyledRadio} from "../../../static/style/muiStyling";
import {useDispatch, useSelector} from "react-redux";
import {changeFilter, setCurrent} from "../../shared/features/SavingsSlice";
import {useEffect, useState} from "react";

export default function ImageSelect() {
    const dispatch = useDispatch()

    const images = useSelector(state => {
        return state.savings.current.images
    })

    const handleChange = (event) => {
        const val = event.target.value
        handleClick(val)
    }

    const [allStyle, setAllStyle] = useState({})
    const [withStyle, setWithStyle] = useState({})
    const [withoutStyle, setWithoutStyle] = useState({})

    useEffect(() => {
        const grayOut = {color: "rgb(0,0,0,68%)"}
        setAllStyle(grayOut)
        setWithStyle(grayOut)
        setWithoutStyle(grayOut)
        switch (images) {
            case "all":
                setAllStyle({})
                break
            case "with":
                setWithStyle({})
                break
            case "without":
                setWithoutStyle({})
                break
            default:
        }
    }, [images])

    const handleClick = (val) => {
        dispatch(setCurrent({name: "images", value: val}))
        switch (val) {
            case "with":
                dispatch(changeFilter([{type: "add", filter: [{"imageUrl": {'$ne': null}}, {"timesReportedForImage": {'$lt': 1}}]}, {type: "remove", filter: ["$or"]}]))
                break
            case "without":
                dispatch(changeFilter([{type: "add", filter: [{"$or": [{"properties.imageUrl": null}, {"properties.timesReportedForImage": {'$gt': 1}}]}]}, {type: "remove", filter: ["timesReportedForImage", "imageUrl"]}]))
                break
            default:
                dispatch(changeFilter([{type: "remove", filter: ["imageUrl", "timesReportedForImage", "$or"]}]))
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
                <p className="singleAreaChoice" style={allStyle} onClick={() => handleClick("all")}>With & without pictures</p>
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
                <p className="singleAreaChoice" style={withStyle}
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
                <p className="singleAreaChoice" style={withoutStyle}
                   onClick={() => handleClick("without")}>Without pictures</p>
            </div>
        </div>
    )
}
