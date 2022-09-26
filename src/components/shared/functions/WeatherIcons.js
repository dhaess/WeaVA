import L from "leaflet";
import Cloud from "../../../static/images/cloud.png";
import Fog from "../../../static/images/fog.png";
import Hail from "../../../static/images/hail.png";
import Icy from "../../../static/images/icy.png";
import Lightning from "../../../static/images/lightning.png";
import Rain from "../../../static/images/rain.png";
import Snowfall from "../../../static/images/snowfall.png";
import SnowLayer from "../../../static/images/snowLayer.png";
import Wind from "../../../static/images/wind.png";
import Tornado from "../../../static/images/tornado.png";
import {useRef} from "react";
import * as d3 from "d3";
import PieMarker from "./PieMarker";
import {renderToString} from "react-dom/server";

const iconData = [
    {idName: "BEWOELKUNG", url: "../../static/images/cloud.png", icon: Cloud, names: ["BEWOELKUNG"]},
    {idName: "NEBEL", url: "../../static/images/fog.png", icon: Fog, names: ["NEBEL"]},
    {idName: "HAGEL", url: "../../static/images/hail.png", icon: Hail, names: ["HAGEL"]},
    {idName: "GLAETTE", url: "../../static/images/icy.png", icon: Icy, names: ["GLAETTE"]},
    {idName: "BLITZE", url: "../../static/images/lightning.png", icon: Lightning, names: ["BLITZE"]},
    {idName: "REGEN", url: "../../static/images/rain.png", icon: Rain, names: ["REGEN"]},
    {idName: "SCHNEEFALL", url: "../../static/images/snowfall.png", icon: Snowfall, names: ["SCHNEEFALL"]},
    {idName: "SCHNEEDECKE", url: "../../static/images/snowLayer.png", icon: SnowLayer, names: ["SCHNEEDECKE"]},
    {idName: "WIND", url: "../../static/images/wind.png", icon: Wind, names: ["WIND"]},
    {idName: "TORNADO", url: "../../static/images/tornado.png", icon: Tornado, names: ["TORNADO"]},
]

export const getIcon = (category) => {
    return iconData.find(e => e.names.includes(category)).icon
}

export const getMapIcon = (category, color, size= 26, className = '') => {
    let imgSize = 0.7*size
    let halfSize = 0.5*size
    return L.divIcon({
        html: `<span class="circle" style="width: ` + size + `px; height: ` + size + `px; margin-left: -` + halfSize + `px; margin-right: -` + halfSize + `px; background-color: ` + color + `"><img src="${getIcon(category)}" height="` + imgSize + `"/></span>`,
        className: className,
        iconSize: [size, size],
    })
}

export const getNames = (idName) => {
    return iconData.find(e => e.idName === idName).names
}

export const getPieIcon = (data, size= 26, className = '') => {
    let icon = <
        PieMarker
        size={size}
    />
    // console.log(icon)
    let htmlIcon = renderToString(icon)
    // console.log(htmlIcon)
    return L.divIcon({
        html: htmlIcon,
        className: className,
        iconSize: [size, size],
    })
}
