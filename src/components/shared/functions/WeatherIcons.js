import {renderToStaticMarkup} from "react-dom/server";
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

const MapIcon = (props) => {
    const [category, size, color] = [props.category, props.size, props.color]
    const imgSize = 0.7*size
    return (
        <span
            className="circle"
            style={{
                width: size.toString() + "px",
                height: size.toString() + "px",
                backgroundColor: color
            }}>
            <img src={getIcon(category)} height={imgSize} alt={category}/>
        </span>
    )
}

export const getMapIcon = (category, color, size= 26, className = '') => {
    let icon = <MapIcon
        category = {category}
        size = {size}
        color = {color}
    />
    const htmlIcon = renderToStaticMarkup(icon)
    return L.divIcon({
        html: htmlIcon,
        className: className,
        iconSize: [size, size],
    })
}

const PieIcon = (props) => {
    let [size, data, sum] = [props.size, props.data, props.sum]
    let pies = ""
    let percent1 = 0
    let percent2 = 0
    data.forEach(e => {
        percent2 = percent1 + 100*e.value/sum
        pies = pies + e.color + " " + percent1.toString() + "% " + percent2.toString() + "%,"
        percent1 = percent2
    })
    pies = pies.slice(0, -1)
    return (
        <div
            style={{height: size.toString() + "px", width: size.toString() + "px", background: "conic-gradient(" + pies + ")"}}
            className={"pieChart"}>
            <p style={{fontSize: (size/3).toString() + "px"}}>{sum}</p>
        </div>
    )
}

export const getPieIcon = (data, props = {}) => {
    let pieData
    if (props.color !== undefined) {
        pieData = [{color: props.color, value: data.length}]
    } else {
        const groupById = data.reduce((group, el) => {
            const { eventId } = el
            group[eventId] = group[eventId] ?? []
            group[eventId].push(el)
            return group
        }, {})
        pieData = Object.entries(groupById).map(e => {
            return {color: e[1][0].color, value: e[1].length}
        })
    }

    const sum = pieData.map(e => e.value).reduce((a, b) => a + b, 0)
    const sizeBasic = props.size === undefined ? 26 : props.size
    const size = sum === 0 ? sizeBasic : sizeBasic*(1+0.3*Math.log(sum))
    const className = props.className === undefined ? "" : props.className

    let icon = <PieIcon
        size = {size}
        data = {pieData}
        sum = {sum}
    />
    const htmlIcon = renderToStaticMarkup(icon)

    return L.divIcon({
        html: htmlIcon,
        className: className,
        iconSize: [size, size],
    })
}

// export const createClusterCustomIcon = (cluster, size) => {
//     const color = cluster.getAllChildMarkers()[0].options.color
//     const pieSize = size === undefined ? 26 : size
//     const markerList = cluster.getAllChildMarkers().map(e => e.options.data)
//     const dataList = markerList.map(e => e.focused === undefined ? e : e.focused).flat()
//     return getPieIcon(dataList, color === undefined ? {size: pieSize} : {color: color, size: pieSize})
// }
