import {MapContainer, Marker, TileLayer} from "react-leaflet";
import {getMapIcon} from "../../shared/functions/WeatherIcons";
import {useSelector} from "react-redux";
import {useState} from "react";
import {Button} from "@mui/material";
import Arrow from "../../../static/images/left-arrow.png"

const MiniMap = ({markerData, color, id}) => {

    const events = useSelector(state => state.comparison.events)
    const mapTile = useSelector(state => state.settings.mapTile)

    const [showMap, setMap] = useState(true)

    const handleCloseClick = () => {
        setMap(false)
    }

    const handleOpenClick = () => {
        setMap(true)
    }

    let mapData = markerData.map(d => {
        let e = {...d}
        e.color = color
        return e
    }).concat(
        events.filter(event => event.info.id !== id)
            .map(event => {
            return event.data.map(e => {
                const e2 = {...e}
                e2.color = event.info.color
                return e2
            })
        })
    ).flat()
    mapData = mapData.filter((v, i, a) => {
        return a.findIndex(v2 => [0, 1].every(k => v2.coordinates[k] === v.coordinates[k])) === i
    })

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
                    {mapData.map(e => (
                        <Marker key={e.coordinates[0] + "," + e.coordinates[1]}
                                position={e.coordinates}
                                icon={getMapIcon(e.category, e.color, 7, "minimapMarkers")}
                        >
                        </Marker>
                    ))}
                    {mapTile === "CH" && <TileLayer url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png" />}
                    {mapTile === "OSM" && <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
                    {mapTile === "NationalMapColor" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg" />}
                    {mapTile === "NationalMapGrey" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg" />}
                    {mapTile === "SWISSIMAGE" && <TileLayer url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg" />}
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
