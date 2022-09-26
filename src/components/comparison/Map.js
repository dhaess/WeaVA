import {MapContainer, Marker, TileLayer, useMap, LayersControl, ZoomControl} from "react-leaflet";
import {useDispatch, useSelector} from "react-redux";
import {getMapIcon} from "../shared/functions/WeatherIcons";
import {setMapTile} from "../shared/features/SettingsSlice";

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

    const events = useSelector(state => state.comparison.events)
    const mapTile = useSelector(state => state.settings.mapTile)

    let mapData = events.filter(event => !event.hidden)
        .map(event => {
        return event.data.map(e => {
            const e2 = {...e}
            e2.color = event.info.color
            return e2
        })
    }).flat()
    mapData = mapData.filter((v, i, a) => {
        return a.findIndex(v2 => [0, 1].every(k => v2.coordinates[k] === v.coordinates[k])) === i
    })

    return (
        <MapContainer style={{width: "100vw", height: "100vh", zIndex: "0"}} center={[46.3985, 8.2318]} zoom={8} zoomControl={false}>
            <MapResizer/>
            <ZoomControl position="bottomright" />
            {mapTile === "CH" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://tile.osm.ch/switzerland/{z}/{x}/{y}.png" />}
            {mapTile === "OSM" && <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />}
            {mapTile === "NationalMapColor" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-farbe/default/current/3857/{z}/{x}/{y}.jpeg" />}
            {mapTile === "NationalMapGrey" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.pixelkarte-grau/default/current/3857/{z}/{x}/{y}.jpeg" />}
            {mapTile === "SWISSIMAGE" && <TileLayer attribution='&copy; <a href="https://www.swisstopo.admin.ch/">swisstopo</a>' url="https://wmts.geo.admin.ch/1.0.0/ch.swisstopo.swissimage/default/current/3857/{z}/{x}/{y}.jpeg" />}
            {mapData.map(e => (
                <Marker
                    key={e.coordinates[0] + "," + e.coordinates[1]}
                    position={e.coordinates}
                    icon={getMapIcon(e.category, e.color)}
                />
            ))}
        </MapContainer>
    )
}

export default Map;
