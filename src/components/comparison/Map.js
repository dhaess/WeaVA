import {
    MapContainer,
    Marker,
    TileLayer,
    useMap,
    LayersControl,
    ZoomControl,
    LayerGroup,
    Polygon
} from "react-leaflet";
import {useSelector} from "react-redux";
import {useEffect, useState} from "react";
import {createClusterCustomIcon, getMapIcon, getPieIcon} from "../shared/functions/WeatherIcons";
import {getClusterList, getGridData} from "../shared/functions/MapFunctions";
import {getCategoryName, getIntensityName} from "../shared/functions/WeatherCategories";
import MarkerClusterGroup from "../shared/components/MarkerClusterGroup";
import {MultiMarkerEventPopup} from "../shared/components/MultiMarkerPopup";
import {StyledPopup} from "../../static/style/muiStyling";
import MarkerMode from "../../static/data/MarkerMode.json";
import MapEvents from "../shared/components/MapEvents";

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
    const [pointsData, setPointsData] = useState([])
    const [markerPos, setMarkerPos] = useState(null)
    const [clusterPopup, setClusterPopup] = useState(null)
    const [clusterData, setClusterData] = useState(null)
    const [zoomLevel, setZoomLevel] = useState(8)
    const [gridData, setGridData] = useState([])
    const [hoverPoint, setHoverPoint] = useState(null)

    useEffect(() => {
        const shownEvents = events.filter(event => !event.hidden)
        let coordsList = []
        let newPointsData = []

        shownEvents.forEach(event => {
            event.data.forEach(e => {
                const e2 = {...e}
                let index = coordsList.findIndex(c => [0, 1].every(k => e.coordinates[k] === c[k]))
                if (index === -1) {
                    newPointsData.push({coordinates: e.coordinates, count: 1, focused: [e2], unfocused:[]})
                    coordsList.push(e.coordinates)
                } else {
                    let pointsIndex = newPointsData.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
                    newPointsData[pointsIndex].count += 1
                    newPointsData[pointsIndex].focused.push(e2)
                }
            })
        })
        setPointsData(newPointsData)

    }, [events])

    useEffect(() => {
        let data = pointsData.map(e => e.focused).flat()
        setGridData(getGridData(data, zoomLevel))
    }, [pointsData, zoomLevel])

    const showClusterPopup = (event) => {
        let dataList = getClusterList(event)
        setClusterData(dataList)
        setMarkerPos(event.latlng)
        setClusterPopup(true)
    }

    return (
        <MapContainer style={{width: "100vw", height: "100vh", zIndex: "0"}} center={[46.3985, 8.2318]} zoom={8} zoomControl={false}>
            <MapResizer/>
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
                                            eventHandlers={{
                                                mouseover: e => setHoverPoint(selectionButton===null ? e.target.options.data: null),
                                                mouseout: () => setHoverPoint(null)
                                            }}
                                    >
                                        <MultiMarkerEventPopup data={e}/>
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
                            <MultiMarkerEventPopup data={hoverPoint}/>
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
                        {pointsData.filter(e => e.focused.length !== 1).map(e => {
                            if (e.focused.length === 1 && e.unfocused.length === 0) {
                                return (
                                    <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}
                                            data={e.focused[0]}
                                            position={e.coordinates}
                                            icon={getMapIcon(e.focused[0].category, e.focused[0].color)}
                                    >
                                        <MultiMarkerEventPopup data={e}/>
                                    </Marker>
                                )
                            } else {
                                return (
                                    <Marker opacity={1} key={e.coordinates[0] + "," + e.coordinates[1]}
                                            data={e}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused)}
                                    >
                                        <MultiMarkerEventPopup data={e}/>
                                    </Marker>
                                )
                            }
                        })}
                    </MarkerClusterGroup>
                    {clusterPopup &&
                        <MultiMarkerEventPopup
                            position={markerPos}
                            data={clusterData}
                            isCluster={true}
                        />
                    }
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer name={MarkerMode["Location"]} checked={markerMode===MarkerMode["Location"]}>
                    <LayerGroup>
                        {pointsData.map(e => {
                            if (e.focused.length === 1 && e.unfocused.length === 0) {
                                return (
                                    <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getMapIcon(e.focused[0].category, e.focused[0].color)}
                                    >
                                        <StyledPopup>
                                            <p>{getCategoryName(e.focused[0].category)}: {getIntensityName(e.focused[0].category, e.focused[0].auspraegung)}</p>
                                        </StyledPopup>
                                    </Marker>
                                )
                            } else if (e.focused.length === 0 && e.unfocused.length === 1) {
                                return (
                                    <Marker opacity={0.5} zIndexOffset={-1000}
                                            key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getMapIcon(e.unfocused[0].category, "var(--gray-bg-color)")}
                                    >
                                        <StyledPopup>
                                            <p>{getCategoryName(e.unfocused[0].category)}: {getIntensityName(e.unfocused[0].category, e.unfocused[0].auspraegung)}</p>
                                        </StyledPopup>
                                    </Marker>
                                )
                            } else if (e.focused.length === 0) {
                                return (
                                    <Marker opacity={0.5} zIndexOffset={-1000}
                                            key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused, {color: "var(--gray-bg-color)"})}
                                    >
                                        <MultiMarkerEventPopup data={e}/>
                                    </Marker>
                                )
                            } else {
                                return (
                                    <Marker opacity={1}  key={e.coordinates[0] + "," + e.coordinates[1]}
                                            position={e.coordinates}
                                            icon={getPieIcon(e.focused)}
                                    >
                                        <MultiMarkerEventPopup data={e}/>
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
