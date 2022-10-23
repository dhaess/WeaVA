import {Autocomplete} from "@mui/material";
import {useDispatch, useSelector} from "react-redux";
import locations from "../../../static/data/PLZO_CSV_WGS84.json"
import {styled} from "@mui/material/styles";
import {StyledRadio, StyledTextField} from "../../../static/style/muiStyling";
import {setCurrent, changeFilter} from "../../shared/features/SavingsSlice";
import {useEffect, useState} from "react";

const StyledAutocomplete = styled(Autocomplete)({
    width: "100%",
    '& .MuiAutocomplete-tag': {
        color: "black"
    },
    "& .Mui-disabled": {
        cursor: "pointer",
    }
})

const placeList = locations.map(entry => {
    if (entry["Kantonskürzel"] === "") {
        return {place: entry["Ortschaftsname"], canton: "FL"}
    } else {
        return {place: entry["Ortschaftsname"], canton: entry["Kantonskürzel"]}
    }
})
let placeOptions = [];
placeList.filter(function(item){
    let i = placeOptions.findIndex(x => (x.place === item.place && x.canton === item.canton));
    if(i <= -1){
        placeOptions.push(item);
    }
    return null;
});
placeOptions.sort((a, b) => -b.canton.localeCompare(a.canton) || -b.place.localeCompare(a.place))

const cantonList = locations.map(entry => {return entry["Kantonskürzel"]})
cantonList.push("FL")
const cantonOptions = [...new Set(cantonList)]
cantonOptions.sort()

const swissPlaces = locations
    .filter(e => e["Kantonskürzel"] !== "")
    .map(e => e["Ortschaftsname"])

export default function AreaSelector() {
    const dispatch = useDispatch()

    const dimension = useSelector(state => {
        return state.savings.current.area.dimension
    })

    const locElements = useSelector(state => {
        return state.savings.current.area.entries
    })

    const cantonValue = dimension === "cantons" ? locElements : []
    const placeValue = dimension === "places" ? locElements : []

    const [allStyle, setAllStyle] = useState({})
    const [allSwitzerlandStyle, setAllSwitzerlandStyle] = useState({})

    useEffect(() => {
        const grayOut = {color: "rgb(0,0,0,68%)"}
        setAllStyle(grayOut)
        setAllSwitzerlandStyle(grayOut)
        switch (dimension) {
            case "all":
                setAllStyle({})
                break
            case "allSwitzerland":
                setAllSwitzerlandStyle({})
                break
            default:
        }
    }, [dimension])

    const handleClick = (val) => {
        switch (val) {
            case "cantons":
                dispatch(setCurrent({name: "area", value: {dimension: val, entries: []}}))
                break
            case "places":
                dispatch(setCurrent({name: "area", value: {dimension: val, entries: []}}))
                break
            case "allSwitzerland":
                const filter = {"place":  {'$in': swissPlaces}}
                dispatch(changeFilter([{type: "add", filter: [filter]}]))
                dispatch(setCurrent({name: "area", value: {dimension: val, entries: []}}))
                break
            default:
                dispatch(changeFilter([{type: "remove", filter: ["place"]}]))
                dispatch(setCurrent({name: "area", value: {dimension: val, entries: []}}))
        }
    }

    const handleFieldClick = (val) => {
        if (dimension !== val) {
            handleClick(val)
        }
    }

    const handleRadioChange = (event) => {
        const val = event.target.value
        handleClick(val)
    }

    const handleTextChange = (val) => {
        switch (dimension) {
            case "cantons":
                const placeFilterList = val.map(canton => {
                    return locations
                        .filter(entry => {return entry["Kantonskürzel"] === canton})
                        .map(entry => {return entry["Ortschaftsname"]})
                }).flat()
                const cantonFilter = {"place":  {'$in': placeFilterList}}
                dispatch(changeFilter([{type: "add", filter: [cantonFilter]}]))
                dispatch(setCurrent({name: "area", value: {dimension: "cantons", entries: val}}))
                break
            case "places":
                const placeFilter = {"place":  {'$in': val}}
                dispatch(changeFilter([{type: "add", filter: [placeFilter]}]))
                dispatch(setCurrent({name: "area", value: {dimension: "places", entries: val}}))
                break
            default:
        }
    }

    return (
        <div>
            <p>Area</p>
            <div className="areaOptions">
                <StyledRadio
                    checked={dimension === 'all'}
                    onChange={handleRadioChange}
                    value="all"
                    name="area-buttons"
                    inputProps={{ 'aria-label': 'all' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p className="singleAreaChoice"
                   style={allStyle} onClick={() =>
                    handleClick("all")}>Everywhere</p>
            </div>
            <div className="areaOptions">
                <StyledRadio
                    checked={dimension === 'allSwitzerland'}
                    onChange={handleRadioChange}
                    value="allSwitzerland"
                    name="area-buttons"
                    inputProps={{ 'aria-label': 'allSwitzerland' }}
                    sx={{
                        margin: "4px 7px 0px 0px;",
                    }}
                />
                <p className="singleAreaChoice"
                   style={allSwitzerlandStyle}
                   onClick={() => handleClick("allSwitzerland")}>All Switzerland</p>
            </div>
            <div className="areaOptions">
                <StyledRadio
                    checked={dimension === 'cantons'}
                    onChange={handleRadioChange}
                    value="cantons"
                    name="area-buttons"
                    inputProps={{ 'aria-label': 'cantons' }}
                />
                <div style={{width: "100%", cursor: "pointer"}} onClick={() => handleFieldClick("cantons")}>
                    <StyledAutocomplete
                        disabled={dimension !== 'cantons'}
                        multiple
                        id="tags-outlined"
                        options={cantonOptions}
                        size="small"
                        value={cantonValue}
                        disableClearable
                        renderInput={(params) => (
                            <StyledTextField
                                {...params}
                                label="Cantons"
                                placeholder="Add"
                            />
                        )}
                        onChange={(event: any, newValue: string | null) => {
                            handleTextChange(newValue);
                        }}
                    />
                </div>
            </div>
            <div className="areaOptions">
                <StyledRadio
                    checked={dimension === 'places'}
                    onChange={handleRadioChange}
                    value="places"
                    name="area-buttons"
                    inputProps={{ 'aria-label': 'places' }}
                />
                <div style={{width: "100%", cursor: "pointer"}} onClick={() => handleFieldClick("places")}>
                    <StyledAutocomplete
                        // todo: work with given value
                        disabled={dimension !== 'places'}
                        multiple
                        id="tags-outlined"
                        // value={placeValue}
                        options={placeOptions}
                        groupBy={(option) => option.canton}
                        getOptionLabel={(option) => option.place}
                        isOptionEqualToValue={(option, value) => option.place === value.place && option.canton === value.canton}
                        size="small"
                        disableClearable
                        renderInput={(params) => (
                            <StyledTextField
                                {...params}
                                label="Places"
                                placeholder="Add"
                            />
                        )}
                        onChange={(event: any, newValue: string | null) => {
                            handleTextChange(newValue);
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
