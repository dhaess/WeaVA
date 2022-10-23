import {LayerGroup, MapContainer, Marker, TileLayer} from "react-leaflet";
import {getMapIcon, getPieIcon} from "../../shared/functions/WeatherIcons";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {Button} from "@mui/material";
import Arrow from "../../../static/images/left-arrow.png"
import MarkerClusterGroup from "../../shared/functions/MarkerClusterGroup";
import {createClusterCustomIcon, getGridData} from "../../shared/functions/MapFunctions";
import MarkerMode from "../../../static/data/MarkerMode.json";

const MiniMap = ({color, id, markerMode}) => {

    const events = useSelector(state => state.comparison.events)
    const mapTile = useSelector(state => state.settings.mapTile)
    const data = useSelector(state => state.map.focusedData)

    const [showMap, setMap] = useState(true)
    const [singleData, setSingleData] = useState([])
    const [multipleData, setMultipleData] = useState([])
    const [gridData, setGridData] = useState([])

    const handleCloseClick = () => {
        setMap(false)
    }

    const handleOpenClick = () => {
        setMap(true)
    }

    useEffect(() => {
        let mapData = data.map(d => {
            let e = {...d}
            e.color = color
            return e
        }).concat(
            events.filter(event => event.info.id !== id && !event.hidden)
                .map(event => {
                    return event.data.map(e => {
                        const e2 = {...e}
                        e2.color = event.info.color
                        return e2
                    })
                })
        ).flat()

        let coordsList = []
        let newSingleData = []
        let newMultipleData = []
        mapData.forEach(e => {
            let index = coordsList.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
            if (index === -1) {
                const e2 = {...e}
                newSingleData.push(e2)
                coordsList.push({coordinates: e.coordinates, isSingle: true})
            } else {
                if (coordsList[index].isSingle) {
                    let newDouble = newSingleData.splice(newSingleData.findIndex(s => [0, 1].every(k => e.coordinates[k] === s.coordinates[k])), 1)
                    const e2 = {...e}
                    newMultipleData.push({coordinates: e.coordinates, count: 2, focused: [newDouble[0], e2]})
                    coordsList[index].isSingle = false
                } else {
                    let multiIndex = newMultipleData.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
                    newMultipleData[multiIndex].count += 1
                    newMultipleData[multiIndex].focused.push(e)
                }
            }
        })
        setSingleData(newSingleData)
        setMultipleData(newMultipleData)
    }, [color, data, events, id])

    useEffect(() => {
        if (markerMode===MarkerMode["Grid"]) {
            const gridInput = singleData.concat(multipleData.map(e => e.focused).flat())
            setGridData(getGridData(gridInput, 8))
        }
    }, [markerMode, multipleData, singleData])

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
                                if (e.count === 1) {
                                    const singlePoint = e.focused[0]
                                    return (
                                        <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                                position={e.coordinates}
                                                icon={getMapIcon(singlePoint.category, color, 7)}
                                        />
                                    )
                                } else {
                                    return (
                                        <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                                color={color}
                                                data={e}
                                                position={e.coordinates}
                                                icon={getPieIcon(e.focused, {color: color, sum: e.focused.length, size: 7})}
                                        />
                                    )
                                }
                            })}
                        </LayerGroup>
                    }
                    {markerMode===MarkerMode["Cluster"] &&
                        <MarkerClusterGroup
                            iconCreateFunction={d => createClusterCustomIcon(d, 7)}
                            zoomToBoundsOnClick={false}
                            chunkedLoading={true}
                            maxClusterRadius={20}
                            // chunkProgress={(processed, total, elapsed, layersArray) => updateProgressBar(processed, total, elapsed, layersArray)}
                        >
                            {singleData.map(e => (
                                <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                        color={color}
                                        data={e}
                                        position={e.coordinates}
                                        icon={getMapIcon(e.category, color, 7, "minimapMarkers minimapSingle")}
                                />
                            ))}
                            {multipleData.filter(e => e.focused.length !== 0).map(e => (
                                <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                        color={color}
                                        data={e}
                                        position={e.coordinates}
                                        icon={getPieIcon(e.focused, {color: color, size: 7})}
                                />
                            ))}
                        </MarkerClusterGroup>
                    }
                    {markerMode===MarkerMode["Location"] &&
                        <LayerGroup>
                            {singleData.map(e => (
                                <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                        position={e.coordinates}
                                        icon={getMapIcon(e.category, e.color, 7, "minimapMarkers minimapSingle")}
                                />
                            ))}
                            {multipleData.map(e => (
                                <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                        position={e.coordinates}
                                        icon={getPieIcon(e.focused, {size: 7, className: "minimapMarkers"})}
                                />
                            ))}
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
