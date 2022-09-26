import {
    FeatureGroup,
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
    useMapEvent, ZoomControl
} from 'react-leaflet';
import {getMapIcon, getPieIcon} from "../../shared/functions/WeatherIcons";
import {useDispatch, useSelector} from "react-redux";
import {Box, Button, CircularProgress, Popper, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import $ from "jquery";
import {EditControl} from "react-leaflet-draw";
import "../../../static/tooltipHelper"
import "leaflet-draw/dist/leaflet.draw.css"
import {
    changeFocusedArea,
    changeFocusedPoints,
    changeFocusedProximityPoints, changeProximityDistance,
    deleteAllAreas
} from "../../shared/features/MapSlice";
import {pointInCircle, pointInPolygon, pointInRectangle} from "../../shared/functions/MapFunctions";
import {changeMapFilters, resetMapFilters} from "../../shared/features/SavingsSlice";
import Delete from "../../../static/images/delete.png";
import Edit from "../../../static/images/edit.png";
import Polygon from "../../../static/images/polygon.png";
import Rectangle from "../../../static/images/rectangle.png";
import Circle from "../../../static/images/circle.png";
import Point from "../../../static/images/point.png";
import Proximity from "../../../static/images/proximity.png";
import Save from "../../../static/images/save.png";
import Reset from "../../../static/images/reset.png";
import {styled} from "@mui/material/styles";
import {StyledInputField, StyledSlider, StyledTooltip} from "../../../static/style/muiStyling";
import L from "leaflet";
import MiniMap from "./MiniMap";
import Arrow from "../../../static/images/left-arrow.png";
import PieMarker from "../../shared/functions/PieMarker";

const maxDataPoints = 1000

const StyledPopupButtons = styled(Button)({
    width: "32px",
    height: "32px",
    minWidth: "0"
})

const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
    display: "grid",
    gridTemplateColumns: "35px 35px 35px 35px 35px",
    gridTemplateRows: "35px 35px",
    columnGap: "2px",
    rowGap: "0px",
    backgroundColor: "var(--main-bg-color)",
})

const StyledToggleButton = styled(ToggleButton)({
    border: "1px solid var(--main-bg-color)",
    borderRadius: "0",
    backgroundColor: "white",
    padding: "0",
    marginLeft: "-1px",
    borderLeft: "1px solid transparent",
    "&.Mui-disabled": {
        border: "1px solid var(--main-bg-color)",
        backgroundColor: "var(--gray-bg-color)"
    },
    "&.Mui-disabled div": {
        opacity: "40%"
    }
})

// for loading whole map when changing size
const MapResizer = () => {
    const mapDiv = document.getElementById("Map");
    const map = useMap()
    if (map !== undefined) {
        const resizeObserver = new ResizeObserver(() => {
            if (map._panes.length !== 0) {
                map.invalidateSize()
            }
        });
        resizeObserver.observe(mapDiv)
    }
}

const Map = () => {
    const dispatch = useDispatch()

    const mapRef = useRef()
    let featureRef = useRef()

    const [allData,
        mapPoints,
        focusedPoints,
        unfocusedPoints,
        focusedArea,
        proximityDistance,
        isFocused,
        isMapFocused
    ] = useSelector(state => {
        const map = state.map
        return [map.allData,
            map.mapPoints,
            map.focusedPoints,
            map.unfocusedPoints,
            map.mapFilters.focusedArea,
            map.mapFilters.proximityDistance,
            map.isFocused,
            map.isMapFocused
        ]})

    const [isLoading,
        hasMapFilter,
        color,
        id
    ] = useSelector(state => {
        const savings = state.savings
        return [savings.status === "loading",
            savings.current.hasMapFilter,
            savings.current.color,
            savings.current.id
        ]})

    const mapTile = useSelector(state => state.settings.mapTile)

    const [selectionButton, setButton] = useState(null);
    const [pointSelection, setPointSelection] = useState(false);
    const [changedPoint, setPoint] = useState(null);
    const [proximitySelection, setProximitySelection] = useState(false);
    const [changedProximity, setProximity] = useState(null);

    useEffect(() => {
        if (mapRef.current !== undefined) {
            mapRef.current._toolbars.draw._modes.polygon.handler.disable()
            mapRef.current._toolbars.draw._modes.rectangle.handler.disable()
            mapRef.current._toolbars.draw._modes.circle.handler.disable()
            setPointSelection(false)
            setProximitySelection(false)
            setPoint(null)
            Object.keys(featureRef.current._layers).forEach(e => {
                featureRef.current._layers[e].editing.disable()
            })
            switch (selectionButton) {
                case "polygon":
                    mapRef.current._toolbars.draw._modes.polygon.handler.enable()
                    break
                case "rectangle":
                    mapRef.current._toolbars.draw._modes.rectangle.handler.enable()
                    break
                case "circle":
                    mapRef.current._toolbars.draw._modes.circle.handler.enable()
                    break
                case "points":
                    setPointSelection(true)
                    break
                case "proximity":
                    setProximitySelection(true)
                    break
                case "deleteAll":
                    if (isMapFocused) {
                        featureRef.current.clearLayers()
                        dispatch(deleteAllAreas())
                    }
                    setButton(null)
                    break
                case "editAll":
                    Object.keys(featureRef.current._layers).forEach(e => {
                        featureRef.current._layers[e].editing.enable()
                    })
                    break
                case "save":
                    if (isMapFocused) {
                        dispatch(changeMapFilters())
                        featureRef.current.clearLayers()
                    }
                    setButton(null)
                    break
                case "reset":
                    dispatch(resetMapFilters())
                    setButton(null)
                    break
                default:
            }
        }
    }, [dispatch, focusedArea, isMapFocused, selectionButton])

    useEffect(() => {
        if (isLoading) {
            $(".mapLoading").css('display', "flex")
        } else {
            $(".mapLoading").css('display', "none")
        }
    }, [isLoading])

    useEffect(() => {
        if (pointSelection && changedPoint !== null) {
            if (changedPoint[0]) {
                dispatch(changeFocusedPoints("delete", changedPoint[1]._latlng))
            } else {
                dispatch(changeFocusedPoints("add", changedPoint[1]._latlng))
            }
        } else if (!pointSelection) {
            setPoint(null)
        }
    }, [changedPoint, dispatch, pointSelection])

    useEffect(() => {
        if (proximitySelection && changedProximity !== null) {
            dispatch(changeFocusedProximityPoints(changedProximity._latlng))
        }
        setProximity(null)
    }, [changedProximity, dispatch, proximitySelection])

    const pointInArea = (coords) => {
        return Object.keys(focusedArea).filter(k => {
            switch (focusedArea[k].type) {
                case "rectangle":
                    return pointInRectangle(coords, focusedArea[k])
                case "circle":
                    return pointInCircle(coords, focusedArea[k])
                case "polygon":
                    return pointInPolygon(coords, focusedArea[k])
                default:
                    return []
            }
        })
    }

    const addPoint = (focused, e) => {
        setPoint([focused, e.target])
    }

    const addProximity = (e) => {
        setProximity(e.target)
    }

    const handleEdit = (clickedAreas) => {
        mapRef.current._map.closePopup()
        Object.keys(featureRef.current._layers).forEach(e => {
            featureRef.current._layers[e].editing.disable()
        })
        clickedAreas.forEach(e => {
            featureRef.current._layers[e].editing.enable()
        })
    }

    const handleDelete = (clickedAreas) => {
        clickedAreas.forEach(e => {
            const layer = featureRef.current._layers[e]
            featureRef.current.removeLayer(layer)
        })
        dispatch(changeFocusedArea("delete", clickedAreas))
    }

    const EditPopup = () => {
        const [position, setPosition] = useState(null)
        const [clickedAreas, setAreas] = useState(null)
        useMapEvent('click', (e) => {
            if (selectionButton !== "editAll") {
                const getAreas = pointInArea([e.latlng.lat, e.latlng.lng])
                setAreas(getAreas)
                if (getAreas.length > 0) {
                    setPosition(e.latlng)
                }
                Object.keys(featureRef.current._layers).forEach(f => {
                    if (!getAreas.includes(f)) {
                        featureRef.current._layers[f].editing.disable()
                    }
                })
            }
        })

        return position === null ? null : (
            <Popup position={position} closeButton={false}>
                <StyledPopupButtons onClick={() => handleEdit(clickedAreas)}>
                    <img src={Edit} width={20} alt={"edit"}/>
                </StyledPopupButtons>
                <StyledPopupButtons onClick={() => handleDelete(clickedAreas)}>
                    <img src={Delete} width={20} alt={"delete"}/>
                </StyledPopupButtons>
            </Popup>
        )
    }

    const handleMounted = (e) => {
        mapRef.current = e
    }

    const handleCreated = e => {
        switch (e.layerType) {
            case "rectangle":
                dispatch(changeFocusedArea("add", e.layer._leaflet_id, {type: "rectangle", northEast: e.layer._bounds._northEast, southWest: e.layer._bounds._southWest}))
                e.layer.on("edit", function(e) {
                    dispatch(changeFocusedArea("add", e.target._leaflet_id, {type: "rectangle", northEast: e.target._bounds._northEast, southWest: e.target._bounds._southWest}))
                })
                break
            case "circle":
                dispatch(changeFocusedArea("add", e.layer._leaflet_id, {type: "circle", center: e.layer._latlng, radius: e.layer._mRadius}))
                e.layer.on("edit", function(e) {
                    dispatch(changeFocusedArea("add", e.target._leaflet_id, {type: "circle", center: e.target._latlng, radius: e.target._mRadius}))
                })
                break
            case "polygon":
                dispatch(changeFocusedArea("add", e.layer._leaflet_id, {type: "polygon", coordinates: e.layer._latlngs[0].map(e => [e.lat, e.lng])}))
                e.layer.on("edit", function(e) {
                    dispatch(changeFocusedArea("add", e.target._leaflet_id, {type: "polygon", coordinates: e.target._latlngs[0].map(e => [e.lat, e.lng])}))
                })
                break
            default:
        }
        setButton(null)
    }

    const handleSliderChange = (event) => {
        dispatch(changeProximityDistance(event.target.value))
    }

    const handleInputChange = (event) => {
        let inputValue = Number(event.target.value)
        if (inputValue === "" || inputValue < 0.001) {
            inputValue = 0.001
        } else if (inputValue > 100) {
            inputValue = 100
        }
        dispatch(changeProximityDistance(inputValue))
    }

    let isTooLarge
    let markerData = []
    let unfocusedData = []
    let infoLength
    if (isFocused) {
        if (focusedPoints.length > maxDataPoints) {
            infoLength = focusedPoints.length
            isTooLarge = true
        } else {
            isTooLarge = false
            markerData = focusedPoints
        }
        unfocusedData = unfocusedPoints
    } else {
        markerData = mapPoints
        infoLength = allData.length
        isTooLarge = allData.length > maxDataPoints
    }

    let mapBoxStyle = {zIndex: "-1", width: "0px", height: "0px"}
    if (isLoading) {
        mapBoxStyle.display = "none"
    } else if (isTooLarge) {
        mapBoxStyle.width = "270px"
        mapBoxStyle.height = "120px"
        mapBoxStyle.zIndex = "1"
        mapBoxStyle.fontSize = "23px"
    }

    let mapBoxText = ["", "", ""]
    if (isTooLarge) {
        mapBoxText = ["Too many data points", "(found " + infoLength + ", max. 1000),", "refine your search!"]
    }

    const MapSelection = () => {
        let proximityRef = useRef()
        const [anchorEl, setAnchorEl] = useState()

        useEffect(() => {
            setTimeout(() => setAnchorEl(proximityRef?.current), 1)
        },  [proximityRef])

        const handleButtons = (event, newButton) => {
            setButton(newButton);
        }

        const [showTools, setTools] = useState(true)

        const handleCloseClick = () => {
            setTools(false)
        }

        const handleOpenClick = () => {
            setTools(true)
        }

        if (showTools) {
            return (
                <div id={"SelectionButtons"}>
                    <div>
                        <div className={"MapBoxTitle"}>Map selection</div>
                        <Button id={"selectionBoxButton"} onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"}/></Button>
                    </div>
                    <StyledToggleButtonGroup
                        exclusive
                        onChange={handleButtons}
                        value={selectionButton}
                        aria-label={"Selection Button"}
                        ref={proximityRef}
                    >
                        <StyledToggleButton value={"polygon"}>
                            <StyledTooltip title={"Select polygon"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Polygon} width={24} alt={"Polygon"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                        <StyledToggleButton value={"rectangle"}>
                            <StyledTooltip title={"Select rectangle"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Rectangle} width={24} alt={"Rectangle"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                        <StyledToggleButton value={"points"} disabled={markerData.length===0}>
                            <StyledTooltip title={"Select individual points"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Point} width={14} alt={"Point"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                        <StyledToggleButton value={"canton"} disabled={true}>
                        </StyledToggleButton>
                        <StyledToggleButton value={"save"} disabled={!isFocused}>
                            <StyledTooltip title={"Save map filters"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Save} width={21} alt={"Save map filters"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                        <StyledToggleButton value={"circle"}>
                            <StyledTooltip title={"Select circle"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Circle} width={22} alt={"Circle"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                        <StyledToggleButton value={"editAll"} disabled={!isMapFocused}>
                            <StyledTooltip title={"Edit all unsaved map area filters"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Edit} width={20} alt={"Edit all"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                        <StyledToggleButton value={"proximity"} disabled={markerData.length===0}>
                            <StyledTooltip title={"Select point to get all points with maximal given distance"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Proximity} width={20} alt={"Proximity"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                        <StyledToggleButton value={"deleteAll"} disabled={!isMapFocused}>
                            <StyledTooltip title={"Delete all unsaved map filters"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Delete} width={21} alt={"Delete all"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                        <StyledToggleButton value={"reset"} disabled={!hasMapFilter}>
                            <StyledTooltip title={"Reset all saved map filters"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Reset} width={21} alt={"Reset map filters"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                    </StyledToggleButtonGroup>
                    { anchorEl &&
                        <Popper open={selectionButton === "proximity" && markerData.length!==0} anchorEl={anchorEl} placement={"bottom-start"}>
                            <Box sx={{
                                border: "2px solid var(--main-bg-color)",
                                p: 1,
                                backgroundColor: 'white',
                                marginLeft: '-3px'
                            }}>
                                <div style={{display: "flex", alignItems: "center"}}>
                                    <StyledTooltip title={"Maximal distance two reports in the group can have"} arrow
                                                   enterDelay={500}>
                                        <div>
                                            Proximity range:
                                        </div>
                                    </StyledTooltip>
                                    <StyledInputField
                                        value={proximityDistance}
                                        size="small"
                                        onChange={handleInputChange}
                                        inputProps={{
                                            step: 0.001,
                                            min: 0,
                                            max: 100,
                                            type: 'number',
                                            'aria-labelledby': 'input-slider',
                                        }}
                                    />
                                    <div style={{marginLeft: "5px"}}>
                                        km
                                    </div>
                                </div>
                                <StyledSlider
                                    valueLabelDisplay="off"
                                    aria-label="Proximity slider"
                                    value={proximityDistance}
                                    min={0}
                                    max={100}
                                    onChange={handleSliderChange}
                                />
                            </Box>
                        </Popper>
                    }
                </div>
            )
        } else {
            return (
                <div style={{position: "relative"}}>
                    <Button id={"selectionBoxButton"} onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"} style={{transform: "rotate(180deg)"}}/></Button>
                </div>
            )
        }
    }

    return <div style={{width: "100%", height: "100vh"}}>
        {/*<MapSelection/>*/}
        <MiniMap
            markerData={markerData}
            color={color}
            id={id}
        />
        {/*<PieMarker/>*/}
        <div style={{display: "contents"}}>
            <MapContainer style={{width: "100%", height: "100vh", zIndex: "0"}} center={[46.3985, 8.2318]} zoom={8}  zoomControl={false}>
                <MapResizer/>
                <ZoomControl position="bottomright" />
                {mapTile === "CH" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png" />}
                {mapTile === "OSM" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
                {mapTile === "NationalMapColor" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg" />}
                {mapTile === "NationalMapGrey" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg" />}
                {mapTile === "SWISSIMAGE" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg" />}
                {/*{unfocusedData.map(e => (*/}
                {/*    <Marker opacity={0.5} zIndexOffset={-1000}*/}
                {/*            key={e.coordinates[0] + "," + e.coordinates[1]}*/}
                {/*            position={e.coordinates}*/}
                {/*            icon={getMapIcon(e.category, "var(--gray-bg-color)")}*/}
                {/*            eventHandlers={{*/}
                {/*                click: e => {*/}
                {/*                    addPoint(false, e)*/}
                {/*                    addProximity(e)*/}
                {/*                }*/}
                {/*            }}*/}
                {/*    />*/}
                {/*))}*/}
                {/*{markerData.map(e => (*/}
                {/*    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}*/}
                {/*            position={e.coordinates}*/}
                {/*            icon={getMapIcon(e.category, color)}*/}
                {/*            eventHandlers={{*/}
                {/*                click: e => {*/}
                {/*                    addPoint(true, e)*/}
                {/*                    addProximity(e)*/}
                {/*                }*/}
                {/*            }}*/}
                {/*    >*/}
                {/*    </Marker>*/}
                {/*))}*/}
                {markerData.map(e => (
                    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                            position={e.coordinates}
                            icon={getPieIcon(e.category)}
                            eventHandlers={{
                                click: e => {
                                    addPoint(true, e)
                                    addProximity(e)
                                }
                            }}
                    >
                    </Marker>
                ))}
                <FeatureGroup ref={featureRef}>
                    <EditControl
                        position="topright"
                        onCreated={handleCreated}
                        onMounted={handleMounted}
                        draw={{
                            polyline: false,
                            polygon: {
                                name: "polygon",
                                shapeOptions: {
                                    weight: 3,
                                    opacity: 0.4,
                                },
                                icon: new L.DivIcon({
                                    iconSize: new L.Point(12, 12),
                                    className: 'leaflet-div-icon leaflet-editing-icon'
                                }),
                            },
                            circle: {
                                name: "circle",
                                shapeOptions: {
                                    weight: 3,
                                    opacity: 0.4,
                                }
                            },
                            rectangle: {
                                name: "rectangle",
                                shapeOptions: {
                                    weight: 3,
                                    opacity: 0.4,
                                }
                            },
                            circlemarker: false,
                            marker: false,
                        }}
                    />
                </FeatureGroup>
                <EditPopup/>
            </MapContainer>
            <div id={"MapOverloadBox"} style={mapBoxStyle}>
                <p>{mapBoxText[0]}</p>
                <p style={{fontSize: "18px"}}>{mapBoxText[1]}</p>
                <p>{mapBoxText[2]}</p>
            </div>
            <div className={"mapLoading"}>
                <CircularProgress size={120}/>
            </div>
        </div>
    </div>
}

export default Map;