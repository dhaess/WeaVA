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

export const focusArea = (focused, areas) => {
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
    newFocused = [...new Map(newFocused.map(item => [item.id, item])).values()]
    return [newFocused, true]
}

export const focusPoints = (focused, allData, points) => {
    if (points["add"].length === 0 && points["delete"].length === 0) {
        return [focused, false]
    }
    let newFocused = [...focused]
    points["delete"].forEach(c => {
        for (let i = 0; i < newFocused.length; i++)
            if (newFocused[i].coordinates[0] === c.lat && newFocused[i].coordinates[1] === c.lng)
                newFocused.splice(i, 1)
    })
    const addedPoints = points["add"].map(c => {
        return allData.filter(f => f.coordinates[0] === c.lat && f.coordinates[1] === c.lng)
    })
    newFocused = newFocused.concat(addedPoints).flat()
    newFocused = [...new Map(newFocused.map(item => [item.id, item])).values()]
    return [newFocused, true]
}

export const focusProximity = (focused, proximityPoints, isFocused) => {
    if (proximityPoints.length === 0) {
        return [focused, false]
    }

    let newFocused = isFocused ? [...focused] : []
    newFocused = newFocused.concat(proximityPoints).flat()
    newFocused = [...new Map(newFocused.map(item => [item.id, item])).values()]
    return [newFocused, true]
}
export const getProximityPoints = (coords, allData, distance) => {
    let queue = []
    let visited = []
    let proximityList = []

    let startPoints = allData.filter(f => f.coordinates[0] === coords[0] && f.coordinates[1] === coords[1])
    startPoints.forEach(p => {
        queue.push(p)
        visited[p.id] = true
    })

    while (queue.length > 0) {
        let node = queue.shift()
        allData.forEach(e => {
            if (!visited[e.id] && getDistance(e.coordinates, node.coordinates) <= distance*1000) {
                queue.push(e)
                visited[e.id] = true
            }
        })
        proximityList.push(node)
    }
    return proximityList
}
