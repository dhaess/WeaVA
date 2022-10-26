import {useDispatch, useSelector} from "react-redux";
import {
    FeatureGroup,
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    ZoomControl,
    LayersControl, LayerGroup, ScaleControl, Polygon
} from 'react-leaflet';
import {EditControl} from "react-leaflet-draw";
import L from "leaflet";
import {createClusterCustomIcon, getMapIcon, getPieIcon} from "../../shared/functions/WeatherIcons";
import {useEffect, useRef, useState} from "react";
import {
    changeFocusedArea,
    changeFocusedPoints,
    changeFocusedProximityPoints, changeProximityDistance,
    deleteAllAreas
} from "../../shared/features/MapSlice";
import {changeMapFilters, resetMapFilters} from "../../shared/features/SavingsSlice";
import {getClusterList, getGridData} from "../../shared/functions/MapFunctions";
import {getCategoryName, getIntensityName} from "../../shared/functions/WeatherCategories";
import MarkerClusterGroup from "../../shared/components/MarkerClusterGroup";
import {MultiMarkerPopup} from "../../shared/components/MultiMarkerPopup";
import MiniMap from "./MiniMap";
import EditPopup from "./EditPopup";
import MapFilterOverlay from "./MapFilterOverlay";
import {styled} from "@mui/material/styles";
import {Box, Button, CircularProgress, Popover, Popper, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {
    CancelButton,
    DeleteButton,
    StyledInputField, StyledPopup,
    StyledSlider,
    StyledTooltip
} from "../../../static/style/muiStyling";
import "leaflet-draw/dist/leaflet.draw.css";
import Delete from "../../../static/images/delete.png";
import Edit from "../../../static/images/edit.png";
import PolygonIcon from "../../../static/images/polygon.png";
import Rectangle from "../../../static/images/rectangle.png";
import Circle from "../../../static/images/circle.png";
import Point from "../../../static/images/point.png";
import Proximity from "../../../static/images/proximity.png";
import Save from "../../../static/images/save.png";
import Reset from "../../../static/images/reset.png";
import MarkerMode from "../../../static/data/MarkerMode.json";
import Arrow from "../../../static/images/left-arrow.png";
import "../../../static/tooltipHelper"
import MapEvents from "../../shared/components/MapEvents";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
    display: "grid",
    gridTemplateColumns: "35px 35px 35px 35px 35px",
    gridTemplateRows: "35px 35px",
    columnGap: "2px",
    rowGap: "0px",
    backgroundColor: "var(--main-bg-color)",
})

const StyledToggleButton = styled(ToggleButton)({
    border: "1px solid var(--border-bg-color)",
    borderRadius: "0",
    backgroundColor: "white",
    padding: "0",
    marginLeft: "-1px",
    borderLeft: "1px solid transparent",
    "&.Mui-disabled": {
        border: "1px solid var(--border-bg-color)",
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

    const editControlRef = useRef()
    let featureRef = useRef()

    const [singlePoints,
        multiplePoints,
        proximityDistance,
        isFocused,
        isMapFocused
    ] = useSelector(state => {
        const map = state.map
        return [map.singlePoints,
            map.multiplePoints,
            map.mapFilters.proximityDistance,
            map.isFocused,
            map.isMapFocused
        ]})

    const [isLoading,
        hasMapFilter,
        color,
        id,
        mapFilter
    ] = useSelector(state => {
        const savings = state.savings
        return [savings.status === "loading",
            savings.current.hasMapFilter,
            savings.current.color,
            savings.current.id,
            savings.current.mapFilter
        ]})

    const [mapTile,
        markerMode
    ] = useSelector(state => {
        const settings = state.settings
        return [
            settings.mapTile,
            settings.markerMode
        ]
    })

    const [selectionButton, setButton] = useState(null)
    const [pointSelection, setPointSelection] = useState(false)
    const [changedPoint, setPoint] = useState(null)
    const [proximitySelection, setProximitySelection] = useState(false)
    const [changedProximity, setProximity] = useState(null)

    const [markerPos, setMarkerPos] = useState(null)
    const [clusterPopup, setClusterPopup] = useState(null)
    const [clusterData, setClusterData] = useState(null)

    const [zoomLevel, setZoomLevel] = useState(8)
    const [gridData, setGridData] = useState([])
    const [hoverPoint, setHoverPoint] = useState(null)
    const [hoverReset, setHoverReset] = useState(false)

    const [mapLoadingStyle, setMapLoadingStyle] = useState({})

    useEffect(() => {
        if (editControlRef.current !== undefined) {
            editControlRef.current._toolbars.draw._modes.polygon.handler.disable()
            editControlRef.current._toolbars.draw._modes.rectangle.handler.disable()
            editControlRef.current._toolbars.draw._modes.circle.handler.disable()
            setPointSelection(false)
            setProximitySelection(false)
            setPoint(null)
            Object.keys(featureRef.current._layers).forEach(e => {
                featureRef.current._layers[e].editing.disable()
            })
            switch (selectionButton) {
                case "polygon":
                    editControlRef.current._toolbars.draw._modes.polygon.handler.enable()
                    break
                case "rectangle":
                    editControlRef.current._toolbars.draw._modes.rectangle.handler.enable()
                    break
                case "circle":
                    editControlRef.current._toolbars.draw._modes.circle.handler.enable()
                    break
                case "points":
                    setPointSelection(true)
                    break
                case "proximity":
                    setProximitySelection(true)
                    break
                case "deleteAll":
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
    }, [dispatch, isMapFocused, selectionButton])

    useEffect(() => {
        isLoading ? setMapLoadingStyle({display: "flex"}) : setMapLoadingStyle({display: "none"})
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

    useEffect(() => {
        if (markerMode === MarkerMode["Grid"]) {
            const focusedData = singlePoints.focused.concat(multiplePoints.map(e => e.focused)).flat()
            setGridData(getGridData(focusedData, zoomLevel))
        }
    }, [markerMode, multiplePoints, singlePoints, zoomLevel])

    //todo: fix issue: Color change doesn't work on cluster icons

    // useEffect(() => {
    //     if (editControlRef.current !== undefined && clusterRef.current !== undefined) {
    //         let clusters = []
    //         editControlRef.current._map.eachLayer((l) => {
    //             if( l instanceof L.Marker && l._childCount !== undefined )
    //                 clusters.push(l)
    //         })
    //         clusters.forEach(e => {
    //             e.refreshIconOptions((d) => {
    //                     return createClusterCustomIcon(d)
    //                 })
    //         })
    //         clusterRef.current.refreshClusters()
    //     }
    // }, [color, editControlRef])

    const addPoint = (focused, e) => {
        setPoint([focused, e.target])
    }

    const addProximity = (e) => {
        setProximity(e.target)
    }

    const handleCreated = e => {
        switch (e.layerType) {
            case "rectangle":
                dispatch(changeFocusedArea("add", e.layer._leaflet_id, {type: "rectangle", northEast: e.layer._bounds._northEast, southWest: e.layer._bounds._southWest}))
                e.layer.on("edit", (e) => {
                    dispatch(changeFocusedArea("add", e.target._leaflet_id, {type: "rectangle", northEast: e.target._bounds._northEast, southWest: e.target._bounds._southWest}))
                })
                break
            case "circle":
                dispatch(changeFocusedArea("add", e.layer._leaflet_id, {type: "circle", center: e.layer._latlng, radius: e.layer._mRadius}))
                e.layer.on("edit", (e) => {
                    dispatch(changeFocusedArea("add", e.target._leaflet_id, {type: "circle", center: e.target._latlng, radius: e.target._mRadius}))
                })
                break
            case "polygon":
                dispatch(changeFocusedArea("add", e.layer._leaflet_id, {type: "polygon", coordinates: e.layer._latlngs[0].map(e => [e.lat, e.lng])}))
                e.layer.on("edit", (e) => {
                    dispatch(changeFocusedArea("add", e.target._leaflet_id, {type: "polygon", coordinates: e.target._latlngs[0].map(e => [e.lat, e.lng])}))
                })
                break
            default:
        }
        setButton(null)
    }

    const showClusterPopup = (event) => {
        let dataList = getClusterList(event)
        setClusterData(dataList)
        setMarkerPos(event.latlng)
        setClusterPopup(true)
    }

    const MapSelection = () => {
        let proximityRef = useRef()

        const [anchorEl, setAnchorEl] = useState()
        const [showTools, setTools] = useState(true)

        useEffect(() => {
            setTimeout(() => setAnchorEl(proximityRef?.current), 1)
        },  [proximityRef])

        const handleButtons = (event, newButton) => {
            setButton(newButton);
        }

        const handleCloseClick = () => {
            setTools(false)
        }

        const handleOpenClick = () => {
            setTools(true)
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

        const handleDeleteClose = (response) => {
            setButton(null)
            if (response && isMapFocused) {
                featureRef.current.clearLayers()
                dispatch(deleteAllAreas())
            }
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
                                    <img src={PolygonIcon} width={24} alt={"Polygon"}/>
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
                        <StyledToggleButton value={"points"} disabled={markerMode!==MarkerMode["Location"] || (singlePoints.focused.length===0 && singlePoints.unfocused.length===0 && multiplePoints.length===0)}>
                            <StyledTooltip title={"Select individual points"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Point} width={14} alt={"Point"}/>
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
                        <StyledToggleButton value={"canton"} disabled={true}>
                        </StyledToggleButton>
                        <StyledToggleButton value={"proximity"} disabled={markerMode!==MarkerMode["Location"] || (singlePoints.focused.length===0 && singlePoints.unfocused.length===0 && multiplePoints.length===0)}>
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
                        <StyledToggleButton value={"reset"} disabled={!hasMapFilter} onMouseEnter={() => setHoverReset(true)}  onMouseLeave={() => setHoverReset(false)}>
                            <StyledTooltip title={"Reset all saved map filters"} arrow enterDelay={500}>
                                <div className={"selectionButtonsContent"}>
                                    <img src={Reset} width={21} alt={"Reset map filters"}/>
                                </div>
                            </StyledTooltip>
                        </StyledToggleButton>
                    </StyledToggleButtonGroup>
                    { anchorEl &&
                        <Popper open={selectionButton === "proximity" && (singlePoints.focused.length!==0 || singlePoints.unfocused.length!==0 || multiplePoints.length!==0)} anchorEl={anchorEl} placement={"bottom-start"}>
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
                    { anchorEl &&
                        <Popover
                            id={id}
                            open={selectionButton === "deleteAll"}
                            anchorEl={anchorEl}
                            onClose={() => handleDeleteClose(false)}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'left',
                            }}
                            sx={{marginTop: "2px"}}
                        >
                            <Box sx={{margin: "8px"}}>
                                <p>Do you want to delete all shapes?</p>
                                <div style={{display: "flex", justifyContent: "flex-end", marginTop: "5px"}}>
                                    <CancelButton sx={{marginRight: "5px"}} onClick={() => handleDeleteClose(false)} autoFocus>Cancel</CancelButton>
                                    <DeleteButton onClick={() => handleDeleteClose(true)}>Delete</DeleteButton>
                                </div>
                            </Box>
                        </Popover>
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
        <MapSelection/>
        <MiniMap
            color={color}
            id={id}
        />
        <div style={{display: "contents"}}>
            <MapContainer
                style={{width: "100%", height: "100vh", zIndex: "0"}}
                center={[46.3985, 8.2318]}
                zoom={8}
                zoomControl={false}
            >
                <MapResizer/>
                <ScaleControl imperial={false} position="bottomright" />
                <ZoomControl position="bottomright" />
                <MapEvents setZoomLevel={setZoomLevel}/>
                {mapTile === "CH" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png" />}
                {mapTile === "OSM" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
                {mapTile === "NationalMapColor" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg" />}
                {mapTile === "NationalMapGrey" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg" />}
                {mapTile === "SWISSIMAGE" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg" />}
                <LayersControl position="bottomright">
                    <LayersControl.BaseLayer name={MarkerMode["Grid"]} checked={markerMode===MarkerMode["Grid"]}>
                        <LayerGroup>
                            {gridData.map(e => {
                                if (e.count === 1) {
                                    const singlePoint = e.focused[0]
                                    return (
                                        <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getMapIcon(singlePoint.category, color)}
                                                eventHandlers={{
                                                    click: e => {
                                                        addPoint(true, e)
                                                        addProximity(e)
                                                    }
                                                }}
                                        >
                                            <StyledPopup>
                                                <p>{getCategoryName(singlePoint.category)}: {getIntensityName(singlePoint.category, singlePoint.auspraegung)}</p>
                                            </StyledPopup>
                                        </Marker>
                                    )
                                } else {
                                    return (
                                        <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                                color={color}
                                                data={e}
                                                position={e.coordinates}
                                                icon={getPieIcon(e.focused, {color: color, sum: e.focused.length})}
                                                eventHandlers={{
                                                    click: e => {
                                                        addPoint(true, e)
                                                        addProximity(e)
                                                    },
                                                    mouseover: e => setHoverPoint(selectionButton===null ? e.target.options.data: null),
                                                    mouseout: () => setHoverPoint(null)
                                                }}
                                        >
                                            <MultiMarkerPopup data={e}/>
                                        </Marker>
                                    )
                                }
                            })}
                        </LayerGroup>
                        {hoverPoint &&
                            <Polygon
                                pathOptions={{color: 'var(--border-bg-color)', fillOpacity: "0.4", zIndex: "2000"}}
                                positions={hoverPoint.convexHull}
                                pane={"markerPane"}
                                eventHandlers={{
                                    mouseout: () => setHoverPoint(null)
                                }}
                            >
                            <MultiMarkerPopup data={hoverPoint}/>
                        </Polygon>}
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name={MarkerMode["Cluster"]} checked={markerMode===MarkerMode["Cluster"]}>
                        <MarkerClusterGroup
                            iconCreateFunction={d => createClusterCustomIcon(d)}
                            zoomToBoundsOnClick={false}
                            chunkedLoading={true}
                            eventHandlers={{
                                clusterclick: e => {
                                    showClusterPopup(e)
                                }
                            }}
                        >
                            {singlePoints.focused.map(e => (
                                <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                        color={color}
                                        data={e}
                                        position={e.coordinates}
                                        icon={getMapIcon(e.category, color)}
                                        eventHandlers={{
                                            click: e => {
                                                addPoint(true, e)
                                                addProximity(e)
                                            }
                                        }}
                                >
                                    <StyledPopup>
                                        <p>{getCategoryName(e.category)}: {getIntensityName(e.category, e.auspraegung)}</p>
                                    </StyledPopup>
                                </Marker>
                            ))}
                            {multiplePoints.filter(e => e.focused.length !== 0).map(e => (
                                <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                        color={color}
                                        data={e}
                                        position={e.coordinates}
                                        icon={getPieIcon(e.focused, {color: color})}
                                        eventHandlers={{
                                            click: e => {
                                                addPoint(true, e)
                                                addProximity(e)
                                            }
                                        }}
                                >
                                    <MultiMarkerPopup data={e}/>
                                </Marker>
                            ))}
                        </MarkerClusterGroup>
                        {clusterPopup &&
                            <MultiMarkerPopup
                                position={markerPos}
                                data={clusterData}
                                isCluster={true}
                            />
                        }
                    </LayersControl.BaseLayer>
                    <LayersControl.BaseLayer name={MarkerMode["Location"]} checked={markerMode===MarkerMode["Location"]}>
                        <LayerGroup>
                            {singlePoints.unfocused.map(e => (
                                <Marker opacity={0.5} zIndexOffset={-1000}
                                        key={e.coordinates[0] + "," + e.coordinates[1]}
                                        position={e.coordinates}
                                        icon={getMapIcon(e.category, "var(--gray-bg-color)")}
                                        eventHandlers={{
                                            click: e => {
                                                addPoint(false, e)
                                                addProximity(e)
                                            }
                                        }}
                                >
                                    <StyledPopup>
                                        <p>{getCategoryName(e.category)}: {getIntensityName(e.category, e.auspraegung)}</p>
                                    </StyledPopup>
                                </Marker>
                            ))}
                            {singlePoints.focused.map(e => {
                                return (
                                    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getMapIcon(e.category, color)}
                                            eventHandlers={{
                                                click: e => {
                                                    addPoint(true, e)
                                                    addProximity(e)
                                                }
                                            }}
                                    >
                                        <StyledPopup>
                                            <p>{getCategoryName(e.category)}: {getIntensityName(e.category, e.auspraegung)}</p>
                                        </StyledPopup>
                                    </Marker>
                                )
                            })}
                            {multiplePoints.map(e => {
                                if (e.focused.length === 0) {
                                    return (
                                        <Marker opacity={0.5} zIndexOffset={-1000}
                                                key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getPieIcon(e.focused, {color: "var(--gray-bg-color)"})}
                                                eventHandlers={{
                                                    click: e => {
                                                        addPoint(false, e)
                                                        addProximity(e)
                                                    }
                                                }}
                                        >
                                            <MultiMarkerPopup data={e}/>
                                        </Marker>
                                    )
                                } else {
                                    return (
                                        <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getPieIcon(e.focused, {color: color})}
                                                eventHandlers={{
                                                    click: e => {
                                                        addPoint(true, e)
                                                        addProximity(e)
                                                    }
                                                }}
                                        >
                                            <MultiMarkerPopup data={e}/>
                                        </Marker>
                                    )
                                }
                            })}
                        </LayerGroup>
                    </LayersControl.BaseLayer>
                </LayersControl>
                {hasMapFilter && hoverReset &&
                    <MapFilterOverlay
                        mapFilter={mapFilter}
                    />
                }
                <FeatureGroup ref={featureRef}>
                    <EditControl
                        position="topright"
                        onCreated={handleCreated}
                        onMounted={(e) => editControlRef.current = e}
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
                <EditPopup
                    selectionButton={selectionButton}
                    featureRef={featureRef}
                    editControlRef={editControlRef}
                />
            </MapContainer>
            <div className={"mapLoading"} style={mapLoadingStyle}>
                <CircularProgress size={120}/>
            </div>
        </div>
    </div>
}

export default Map;
