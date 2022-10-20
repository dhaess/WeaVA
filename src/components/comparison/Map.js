import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    LayersControl,
    ZoomControl,
    LayerGroup,
    useMapEvents
} from "react-leaflet";
import {useSelector} from "react-redux";
import {getMapIcon, getPieIcon} from "../shared/functions/WeatherIcons";
import {createClusterCustomIcon, getGridData, MultiMarkerPopup} from "../shared/functions/MapFunctions";
import {getCategoryName, getIntensityName} from "../shared/functions/WeatherCategories";
import {StyledPopup} from "../../static/style/muiStyling";
import MarkerClusterGroup from "../shared/functions/MarkerClusterGroup";
import {useEffect, useState} from "react";
import MarkerMode from "../../static/data/MarkerMode.json";

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
    const events = useSelector(state => state.comparison.events)
    const mapTile = useSelector(state => state.settings.mapTile)

    const [singleData, setSingleData] = useState({focused: [], unfocused: []})
    const [multipleData, setMultipleData] = useState([])
    const [markerPos, setMarkerPos] = useState(null)
    const [clusterPopup, setClusterPopup] = useState(null)
    const [clusterData, setClusterData] = useState(null)
    const [zoomLevel, setZoomLevel] = useState(8)
    const [gridData, setGridData] = useState([])

    const showClusterPopup = (event) => {
        let markerList = event.layer.getAllChildMarkers().map(e => e.options.data)
        let dataList = markerList.map(e => {
            if (e.count === undefined) {
                return e
            } else {
                return e.focused
            }
        }).flat()
        setClusterData(dataList)
        setMarkerPos(event.latlng)
        setClusterPopup(true)
    }

    const ZoomLevel = () => {
        const mapEvents = useMapEvents({
            zoomend: () => {
                setZoomLevel(mapEvents.getZoom())
            },
        });
        return null
    }

    useEffect(() => {
        const shownEvents = events.filter(event => !event.hidden)
        let coordsList = []
        let newSingleData = {focused: [], unfocused: []}
        let newMultipleData = []

        shownEvents.forEach(event => {
            event.data.forEach(e => {
                const e2 = {...e}
                e2.color = event.info.color
                e2.eventId = event.info.id
                let index = coordsList.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
                if (index === -1) {
                    newSingleData.focused.push(e2)
                    coordsList.push({coordinates: e.coordinates, isSingle: true})
                } else {
                    if (coordsList[index].isSingle) {
                        let newDouble = newSingleData.focused.splice(newSingleData.focused.findIndex(s => [0, 1].every(k => e.coordinates[k] === s.coordinates[k])), 1)
                        newMultipleData.push({coordinates: e.coordinates, count: 2, focused: [newDouble[0], e2], unfocused:[]})
                        coordsList[index].isSingle = false
                    } else {
                        let multiIndex = newMultipleData.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
                        newMultipleData[multiIndex].count += 1
                        newMultipleData[multiIndex].focused.push(e2)
                    }
                }
            })
        })
        setSingleData(newSingleData)
        setMultipleData(newMultipleData)

    }, [events])

    useEffect(() => {
        let data = singleData.focused.concat(multipleData.map(e => e.focused).flat())

        setGridData(getGridData(data, zoomLevel))
    }, [singleData, multipleData, zoomLevel])

    return (
        <MapContainer style={{width: "100vw", height: "100vh", zIndex: "0"}} center={[46.3985, 8.2318]} zoom={8} zoomControl={false}>
            <MapResizer/>
            <ZoomControl position="bottomright" />
            <ZoomLevel/>
            {mapTile === "CH" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png" />}
            {mapTile === "OSM" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
            {mapTile === "NationalMapColor" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg" />}
            {mapTile === "NationalMapGrey" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg" />}
            {mapTile === "SWISSIMAGE" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg" />}
            <LayersControl position="bottomright">
                <LayersControl.BaseLayer checked name={MarkerMode["Grid"]}>
                    <LayerGroup>
                        {gridData.map(e => {
                            if (e.count === 1) {
                                const singlePoint = e.focused[0]
                                return (
                                    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getMapIcon(singlePoint.category, singlePoint.color)}
                                    >
                                        <StyledPopup>
                                            <p>{getCategoryName(singlePoint.category)}: {getIntensityName(singlePoint.category, singlePoint.auspraegung)}</p>
                                        </StyledPopup>
                                    </Marker>
                                )
                            } else {
                                return (
                                    <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                            data={e}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused, {sum: e.focused.length})}
                                    >
                                        <MultiMarkerPopup data={e}/>
                                    </Marker>
                                )
                            }
                        })}
                    </LayerGroup>
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name={MarkerMode["Cluster"]}>
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
                        {singleData.focused.map(e => (
                            <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                    data={e}
                                    position={e.coordinates}
                                    icon={getMapIcon(e.category, e.color)}
                            >
                                <StyledPopup>
                                    <p>{getCategoryName(e.category)}: {getIntensityName(e.category, e.auspraegung)}</p>
                                </StyledPopup>
                            </Marker>
                        ))}
                        {multipleData.filter(e => e.focused.length !== 0).map(e => {
                            return (
                                <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}
                                        data={e}
                                        position={e.coordinates}
                                        icon={getPieIcon(e.focused)}
                                >
                                    <MultiMarkerPopup data={e}/>
                                </Marker>
                            )
                        })}
                    </MarkerClusterGroup>
                    {clusterPopup &&
                        <MultiMarkerPopup
                            position={markerPos}
                            data={clusterData}
                            isCluster={true}
                        />
                    }
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name={MarkerMode["Location"]}>
                    <LayerGroup>
                        {singleData.unfocused.map(e => (
                            <Marker opacity={0.5} zIndexOffset={-1000}
                                    key={e.coordinates[0] + "," + e.coordinates[1]}
                                    position={e.coordinates}
                                    icon={getMapIcon(e.category, "var(--gray-bg-color)")}
                            >
                                <StyledPopup>
                                    <p>{getCategoryName(e.category)}: {getIntensityName(e.category, e.auspraegung)}</p>
                                </StyledPopup>
                            </Marker>
                        ))}
                        {singleData.focused.map(e => (
                            <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                    position={e.coordinates}
                                    icon={getMapIcon(e.category, e.color)}
                            >
                                <StyledPopup>
                                    <p>{getCategoryName(e.category)}: {getIntensityName(e.category, e.auspraegung)}</p>
                                </StyledPopup>
                            </Marker>
                        ))}
                        {multipleData.map(e => {
                            if (e.focused.length === 0) {
                                return (
                                    <Marker opacity={0.5} zIndexOffset={-1000}
                                            key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused, {color: "var(--gray-bg-color)"})}
                                    >
                                        <MultiMarkerPopup data={e}/>
                                    </Marker>
                                )
                            } else {
                                return (
                                    <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused)}
                                    >
                                        <MultiMarkerPopup data={e}/>
                                    </Marker>
                                )
                            }
                        })}
                    </LayerGroup>
                </LayersControl.BaseLayer>
            </LayersControl>
        </MapContainer>
    )
}

export default Map;
