# WeaVA

This project was created in the master thesis "Visual Analysis of Weather Events observations based on Crowd-sourced data by MeteoSwiss" from Dominique Hässig.

## Scripts

Start the front end with:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

Start the back end with:

### `yarn start-api`

Runs the back end  in the development mode on [http://localhost:5000](http://localhost:5000).

Add new libraries with:

### `yarn add library_name`

Remove libraries with:

### `yarn remove library_name`

## Further installations

You also need to install the MongoDB database. Download and install it from [https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community).

Start mongoDB with (on Mac):
### `brew services start mongodb-community@5.0`

Use respective version number of mongoDB

Stop mongoDB:
### `brew services stop mongodb-community@5.0`

Run the instance with (from a new terminal):
### `mongosh`

Create database with:

### `use weatherdb`

The data (in json format) has to be given by an authorized party. If you get it in the raw format, remove at the beginning:

#### {"type:"FeatureCollection", "features":

and the curly bracket (}) at the end of the file. If not, the file can't be divided in chunks and imported.

Import with:

### `mongoimport ...place_of_file.../dwd_crowd_meldungen_20220602.json -d weatherdb -c weather_reports --drop`
(See [https://www.mongodbtutorial.org/mongodb-tools/mongoimport/](https://www.mongodbtutorial.org/mongodb-tools/mongoimport/))

## Commented code

There are 2 functionalities, that where commented out, so that it doesn't appear at the moment, but it is possible to retrieve the functions fast again.

### Marker clusters
One ommited functionality is the marker clusters provided from leaflet which uses the hierarchical greedy clustering algorithm. 
In both selection/map/Map.js and comparison/Map.js the corresponding parts are:
- the imports from shared/functions/WeatherIcons, shared/functions/MapFunctions and shared/components/MarkerClusterGroup, where there are replacements for WeatherIcons and MapFunctions
- the states: markerPos, clusterPopup, and clusterData
- the functions showClusterPopup
- the commented part of the return from
`<LayersControl.BaseLayer name={MarkerMode["Cluster"]} checked={markerMode===MarkerMode["Cluster"]}>*/}`

In other files:
- createClusterCustomIcon in shared/functions/WeatherIcons.js
- getClusterList in shared/functions/Mapfunctions.js
- in return from `{markerMode===MarkerMode["Cluster"]` in selection/map/MiniMap.js

Not commented out, but not used otherwise:
- shared/components/MarkerClusterGroup

### Convex hull
The presentation of the convex hull in the map was remove from presented code.
The commented code is:
- in shared/functions/Mapfunctions.js `gridData.push({focused: gridContent, unfocused: [], coordinates: [avgLat, avgLng], convexHull: convexHull})`, the next line is the replacement

In both selection/map/Map.js and comparison/Map.js:
- `mouseover: e => setHoverPoint(selectionButton===null ? e.target.options.data: null)` and `mouseout: () => setHoverPoint(null)` in selection/map/Map.js and comparison/Map.js (in comparison additionally the wrapper eventHandler)
- the commented part from `{hoverPoint && !isPlaying &&` respectively in comparison only `{hoverPoint &&`
- the state hoverPoint
- the import Polygon from react-leaflet
- in selection only: the selector isPlaying
