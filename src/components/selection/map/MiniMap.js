import {useSelector} from "react-redux";
import {LayerGroup, MapContainer, Marker, TileLayer} from "react-leaflet";
import {useEffect, useState} from "react";
import {getMapIcon, getPieIcon} from "../../shared/functions/WeatherIcons";
// import {createClusterCustomIcon, getMapIcon, getPieIcon} from "../../shared/functions/WeatherIcons";
// import MarkerClusterGroup from "../../shared/components/MarkerClusterGroup";
import {getGridData} from "../../shared/functions/MapFunctions";
import {Button} from "@mui/material";
import Arrow from "../../../static/images/left-arrow.png";
import MarkerMode from "../../../static/data/MarkerMode.json";

const MiniMap = ({color, id, mapData}) => {
    const [events,
        hasEvents
    ] = useSelector(state => {
        const events = state.comparison.events
        return [events,
            events.length>0
        ]
    })
    const data = useSelector(state => state.map.focusedData)
    const [mapTile,
        markerMode
    ] = useSelector(state => {
        const settings = state.settings
        return [
            settings.mapTile,
            settings.markerMode
        ]
    })

    const [showMap, setMap] = useState(false)
    const [pointsData, setPointsData] = useState([])
    const [gridData, setGridData] = useState([])

    const handleCloseClick = () => setMap(false)

    const handleOpenClick = () => setMap(true)

    useEffect(() => setMap(hasEvents), [hasEvents])

    useEffect(() => {
        if (showMap) {
            if (events.length>0) {
                let localMapData = data.map(d => {
                    let e = {...d}
                    e.color = color
                    e.eventId = id
                    return e
                }).concat(events.filter(event => event.info.id !== id && !event.hidden).map(e => e.data)).flat()

                let coordsList = []
                let newPointsData = []
                localMapData.forEach(e => {
                    let index = coordsList.findIndex(c => [0, 1].every(k => e.coordinates[k] === c[k]))
                    if (index === -1) {
                        newPointsData.push({coordinates: e.coordinates, focused: [e]})
                        coordsList.push(e.coordinates)
                    } else {
                        let multiIndex = newPointsData.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
                        newPointsData[multiIndex].focused.push(e)
                    }
                })
                setPointsData(newPointsData)
            } else {
                setPointsData(mapData)
            }
        }
    }, [color, data, events, id, mapData, showMap])

    useEffect(() => {
        if (markerMode===MarkerMode["Grid"]) {
            const gridInput = pointsData.map(e => e.focused).flat()
            setGridData(getGridData(gridInput, 8))
        }
    }, [markerMode, pointsData])

    if (showMap) {
        return (
            <div className={"leaflet-minimap"}>
                <div>
                    <div className={"MapBoxTitle"}>Preview</div>
                    <Button id={"previewButton"} onClick={handleCloseClick}><img src={Arrow} width={16} alt={"close"} style={{transform: "rotate(180deg)"}}/></Button>
                </div>
                <div>

                </div>
                <MapContainer
                    style={{ height: 170, width: 250, pointerEvents: "none" }}
                    center={[46.798333, 8.231944]}
                    zoom={6}
                    dragging={false}
                    doubleClickZoom={false}
                    scrollWheelZoom={false}
                    attributionControl={false}
                    zoomControl={false}
                >
                    {mapTile === "CH" && <TileLayer url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png" />}
                    {mapTile === "OSM" && <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
                    {mapTile === "NationalMapColor" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg" />}
                    {mapTile === "NationalMapGrey" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg" />}
                    {mapTile === "SWISSIMAGE" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg" />}
                    {markerMode===MarkerMode["Grid"] &&
                        <LayerGroup>
                            {gridData.map(e => {
                                if (e.focused.length === 1) {
                                    const singlePoint = e.focused[0]
                                    const pointColor = hasEvents ? singlePoint.color : color
                                    return (
                                        <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getMapIcon(singlePoint.category, pointColor, 7)}
                                        />
                                    )
                                } else {
                                    return (
                                        <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                                color={color}
                                                data={e}
                                                position={e.coordinates}
                                                icon={getPieIcon(e.focused, hasEvents ? {sum: e.focused.length, size: 7} : {color: color, sum: e.focused.length, size: 7})}
                                        />
                                    )
                                }
                            })}
                        </LayerGroup>
                    }
                    {/*{markerMode===MarkerMode["Cluster"] &&*/}
                    {/*    <MarkerClusterGroup*/}
                    {/*        iconCreateFunction={d => createClusterCustomIcon(d, 7)}*/}
                    {/*        zoomToBoundsOnClick={false}*/}
                    {/*        chunkedLoading={true}*/}
                    {/*        maxClusterRadius={20}*/}
                    {/*    >*/}
                    {/*        {pointsData.filter(e => e.focused.length !== 0).map(e => {*/}
                    {/*            if (e.focused.length === 1) {*/}
                    {/*                return (*/}
                    {/*                    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}*/}
                    {/*                            color={color}*/}
                    {/*                            data={e.focused[0]}*/}
                    {/*                            position={e.coordinates}*/}
                    {/*                            icon={getMapIcon(e.focused[0].category, hasEvents ? e.focused[0].color : color, 7, "minimapMarkers minimapSingle")}*/}
                    {/*                    />*/}
                    {/*                )*/}
                    {/*            } else {*/}
                    {/*                return (*/}
                    {/*                    <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}*/}
                    {/*                            color={color}*/}
                    {/*                            data={e}*/}
                    {/*                            position={e.coordinates}*/}
                    {/*                            icon={getPieIcon(e.focused, hasEvents ? {size: 7} : {color: color, size: 7})}*/}
                    {/*                    />*/}
                    {/*                )*/}
                    {/*            }*/}
                    {/*        })}*/}
                    {/*    </MarkerClusterGroup>*/}
                    {/*}*/}
                    {markerMode===MarkerMode["Location"] &&
                        <LayerGroup>
                            {pointsData.map(e => {
                                if (e.focused.length === 1) {
                                    return (
                                        <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getMapIcon(e.focused[0].category, hasEvents ? e.focused[0].color : color, 7, "minimapMarkers minimapSingle")}
                                        />
                                    )
                                } else {
                                    return (
                                        <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getPieIcon(e.focused, hasEvents ? {size: 7, className: "minimapMarkers"} : {color: color, size: 7, className: "minimapMarkers"})}
                                        />
                                    )
                                }
                            })}
                        </LayerGroup>
                    }
                </MapContainer>
            </div>
        )
    } else {
        return (
            <div className={"leaflet-minimap"}>
                <Button id={"previewButton"} onClick={handleOpenClick}><img src={Arrow} width={16} alt={"open"}/></Button>
            </div>
        )
    }
}

export default MiniMap;
