import {useDispatch} from "react-redux";
import {useMapEvents} from "react-leaflet";
import {setMarkerMode} from "../features/SettingsSlice";

const MapEvents = ({setZoomLevel}) => {
    const dispatch = useDispatch()

    const mapEvents = useMapEvents({
        zoomend: () => setZoomLevel(mapEvents.getZoom()),
        baselayerchange: e => dispatch(setMarkerMode(e.name))
    });
    return null
}

export default MapEvents;
