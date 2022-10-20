import {getCategoryName, getIntensityName} from "./WeatherCategories";
import {StyledPopup} from "../../../static/style/muiStyling";
import {getPieIcon} from "./WeatherIcons";

export const getDistance = (c1, c2) => {
    const R = 6371e3; // metres
    const phi1 = c1[0] * Math.PI / 180; // φ, λ in radians
    const phi2 = c2[0] * Math.PI / 180;
    const dPhi = (c2[0] - c1[0]) * Math.PI / 180;
    const dLambda = (c2[1] - c1[1]) * Math.PI / 180;

    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) *
        Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

export const pointInCircle = (point, circle) => {
    return getDistance([circle.center.lat, circle.center.lng], point) <= circle.radius
}

// taken from https://www.algorithms-and-technologies.com/point_in_polygon/javascript
export const pointInPolygon = (point, polygonObj) => {
    const polygon = polygonObj.coordinates
    let odd = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; i++) {
        if (((polygon[i][1] > point[1]) !== (polygon[j][1] > point[1]))
            && (point[0] < ((polygon[j][0] - polygon[i][0]) * (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1]) + polygon[i][0]))) {
            odd = !odd;
        }
        j = i;
    }
    return odd;
}

export const pointInRectangle = (point, rectangle) => {
    return point[0] <= rectangle.northEast.lat &&
        point[0] >= rectangle.southWest.lat &&
        point[1] <= rectangle.northEast.lng &&
        point[1] >= rectangle.southWest.lng
}

const arrangeMultiArea = (allPoints, focused) => {
    let newAll = [...allPoints]
    focused.forEach(e => {
        const index = newAll.findIndex(c => [0, 1].every(k => e.coordinates[k] === c.coordinates[k]))
        let changing = {...newAll[index]}
        changing.focused = changing.focused.concat(changing.unfocused)
        changing.unfocused = []
        newAll[index] = changing
    })
    return newAll
}

export const focusArea = (focused, areas, isSinglePoint = true) => {
    if (Object.keys(areas).length === 0) {
        return [focused, false]
    }
    let newFocused = Object.keys(areas).map(e => {
        switch (areas[e].type) {
            case "rectangle":
                return focused.filter(f =>
                    pointInRectangle(f.coordinates, areas[e]))
            case "circle":
                return focused.filter(f =>
                    pointInCircle(f.coordinates, areas[e]))
            case "polygon":
                return focused.filter(f =>
                    pointInPolygon(f.coordinates, areas[e]))
            case "point":
                return focused.filter(f =>
                    f.coordinates[0] === areas[e].latLng.lat && f.coordinates[1] === areas[e].latLng.lng)
            default:
                return []
        }
    }).flat()

    if (isSinglePoint) {
        newFocused = [...new Map(newFocused.map(item => [item.id, item])).values()]
    } else {
        newFocused = arrangeMultiArea(focused, newFocused)
    }

    return [newFocused, true]
}
export const focusPoints = (focused, allData, points, isSinglePoint=true) => {
    if (isSinglePoint) {
        return focusSinglePoints(focused, allData, points)
    } else {
        return focusMultiPoints(focused, allData, points)
    }
}

const focusSinglePoints = (focused, allData, points) => {
    if (points["add"].length === 0 && points["delete"].length === 0) {
        return [focused, false]
    }
    let newFocused = [...focused]
    points["delete"].forEach(c => {
        const index = newFocused.findIndex(e => e.coordinates[0] === c.lat && e.coordinates[1] === c.lng)
        if (index !== -1) {
            newFocused.splice(index, 1)
        }
    })
    const addedPoints = points["add"].map(c => {
        return allData.filter(f => f.coordinates[0] === c.lat && f.coordinates[1] === c.lng)
    })
    newFocused = newFocused.concat(addedPoints).flat()
    newFocused = [...new Map(newFocused.map(item => [item.id, item])).values()]
    return [newFocused, true]
}

const focusMultiPoints = (focused, allData, points) => {
    if (points["add"].length === 0 && points["delete"].length === 0) {
        return [focused, false]
    }
    let newFocused = [...focused]
    points["delete"].forEach(c => {
        const index = newFocused.findIndex(e => e.coordinates[0] === c.lat && e.coordinates[1] === c.lng)
        if (index !== -1) {
            const el = {...newFocused[index]}
            el.unfocused = el.focused.concat(el.unfocused)
            el.focused = []
            newFocused[index] = el
        }
    })
    points["add"].forEach(c => {
        const index = newFocused.findIndex(e => e.coordinates[0] === c.lat && e.coordinates[1] === c.lng)
        if (index !== -1) {
            const el = {...newFocused[index]}
            el.focused = el.focused.concat(el.unfocused)
            el.unfocused = []
            newFocused[index] = el
        }
    })
    return [newFocused, true]
}

export const focusProximity = (focused, allData, proximityPoints, isFocused, isSinglePoint = true) => {
    if (isSinglePoint) {
        return focusSingleProximity(focused, allData, proximityPoints, isFocused)
    } else {
        return focusMultiProximity(focused, proximityPoints)
    }
}

const focusSingleProximity = (focused, allData, proximityPoints, isFocused) => {
    if (proximityPoints.length === 0) {
        return [focused, false]
    }
    let newFocused = isFocused ? [...focused] : []
    proximityPoints.flat().forEach(c => {
        const index = allData.findIndex(v => [0, 1].every(k => v.coordinates[k]===c[k]))
        if (index!==-1) {
            newFocused.push(allData[index])
        }
    })

    newFocused = [...new Map(newFocused.map(item => [item.id, item])).values()]
    return [newFocused, true]
}

const focusMultiProximity = (data, proximityPoints) => {
    if (proximityPoints.length === 0) {
        return [data, false]
    }
    let newData = [...data]
    proximityPoints.flat().forEach(c => {
        const index = newData.findIndex(v => [0, 1].every(k => v.coordinates[k]===c[k]))
        if (index!==-1) {
            const el = newData[index]
            el.focused = el.focused.concat(el.unfocused)
            el.unfocused = []
            newData[index] = el
        }
    })
    return [newData, true]
}

export const getProximityPoints = (coords, coordsList, distance) => {
    let queue = []
    let visited = []
    let proximityList = []

    queue.push(coords)
    let index = coordsList.findIndex(c => [0, 1].every(k => c[k]===coords[k]))
    if (index !== -1) {
        visited[index] = true
    }

    while (queue.length > 0) {
        let node = queue.shift()
        coordsList.forEach((e, i) => {
            if (!visited[i] && getDistance(e, node) <= distance*1000) {
                queue.push(e)
                visited[i] = true
            }
        })
        proximityList.push(node)
    }
    return proximityList
}

const arrangeIntensityInfo = (array) => {
    const groupByCategory = array.reduce((group, el) => {
        const { category } = el
        group[category] = group[category] ?? []
        group[category].push(el)
        return group
    }, {})
    return Object.entries(groupByCategory).map(e => {
        const groupByIntensity = e[1].reduce((group, el) => {
            const {auspraegung} = el
            group[auspraegung] = group[auspraegung] ?? []
            group[auspraegung].push(el)
            return group
        }, {})
        const intensities = Object.entries(groupByIntensity).map(i => {
            return {intensity: i[0], count: i[1].length}
        })
        return {category: e[0], intensities: intensities}
    })
}

export const MultiMarkerPopup = ({data, isCluster, position}) => {
    let focusedIntensityInfo
    let unfocusedIntensityInfo
    if (isCluster === undefined) {
        focusedIntensityInfo = arrangeIntensityInfo(data.focused)
        unfocusedIntensityInfo = arrangeIntensityInfo(data.unfocused)
    } else {
        focusedIntensityInfo = arrangeIntensityInfo(data)
    }

    return <StyledPopup position={position}>
        {focusedIntensityInfo.map(c => {
            return (
                <div className={"multiPopup"} key={c.category}>
                    <p>{getCategoryName(c.category)}: </p>
                    <div>
                        {c.intensities.map(i => <p key={i.intensity}>{getIntensityName(c.category, i.intensity)}:</p>)}
                    </div>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
                        {c.intensities.map(i => <p key={i.intensity}>{i.count}</p>)}
                    </div>
                </div>
            )
        })}
        {isCluster === undefined && unfocusedIntensityInfo.map(c => {
            return (
                <div className={"multiPopup"} style={{opacity: "0.5"}} key={c.category}>
                    <p>{getCategoryName(c.category)}: </p>
                    <div>
                        {c.intensities.map(i => <p key={i.intensity}>{getIntensityName(c.category, i.intensity)}:</p>)}
                    </div>
                    <div style={{display: "flex", flexDirection: "column", alignItems: "flex-end"}}>
                        {c.intensities.map(i => <p key={i.intensity}>{i.count}</p>)}
                    </div>
                </div>
            )
        })}
    </StyledPopup>
}

export const createClusterCustomIcon = (cluster, size) => {
    const color = cluster.getAllChildMarkers()[0].options.color
    const pieSize = size===undefined ? 26 : size
    const markerList = cluster.getAllChildMarkers().map(e => e.options.data)
    const dataList = markerList.map(e => {
        if (e.count === undefined) {
            return e
        } else {
            return e.focused
        }
    }).flat()
    if (color !== undefined) {
        return getPieIcon(dataList, {color: color, size: pieSize})
    } else {
        return getPieIcon(dataList, {size: pieSize})
    }
}

export const getGridData = (allData, zoomLevel) => {
    // console.log(allData)
    const gridData = []

    if (allData.length===1) {
        return [{focused: allData, unfocused: [], count: 1, coordinates: allData[0].coordinates}]
    }
    else if (allData.length>1) {
        const latList = allData.map(e => e.coordinates[0])
        const minLat = Math.min(...latList)
        const maxLat = Math.max(...latList)
        const lngList = allData.map(e => e.coordinates[1])
        const minLng = Math.min(...lngList)
        const maxLng = Math.max(...lngList)

        const latDist = getDistance([minLat, minLng], [maxLat, minLng])
        const lngDist = getDistance([minLat, minLng], [minLat, maxLng])

        const maxGridSize = 10240 * 1000 / (Math.pow(2, zoomLevel))
        const latGrid = Math.ceil(latDist/maxGridSize)
        const lngGrid = Math.ceil(lngDist/maxGridSize)
        const latGridSize = (maxLat-minLat+0.005) / Math.ceil(latDist/maxGridSize)
        const lngGridSize = (maxLng-minLng+0.005) / Math.ceil(lngDist/maxGridSize)

        const grid = new Array(latGrid)
        for (let i=0; i<latGrid; i++) {
            grid[i] = new Array(lngGrid)
        }

        allData.forEach(e => {
            const x = Math.floor((e.coordinates[0]-minLat) / latGridSize)
            const y = Math.floor((e.coordinates[1]-minLng) / lngGridSize)
            if (grid[x][y] === undefined) {
                grid[x][y] = []
            }
            grid[x][y].push(e)
        })

        for (let i=0; i<latGrid; i++) {
            for (let j=0; j<lngGrid; j++) {
                const gridContent = grid[i][j]
                if (gridContent !== undefined) {
                    const avgLat =  gridContent.map(e => e.coordinates[0]).reduce((a, b) => a + b, 0) / gridContent.length
                    const avgLng =  gridContent.map(e => e.coordinates[1]).reduce((a, b) => a + b, 0) / gridContent.length
                    gridData.push({focused: gridContent, unfocused: [], count: gridContent.length, coordinates: [avgLat, avgLng]})
                }
            }
        }
    }
    return gridData
}
