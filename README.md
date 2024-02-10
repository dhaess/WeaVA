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

### `mongoimport ...place_of_file.../...file_name....json -d weatherdb -c weather_reports --jsonArray`
(See [https://www.mongodbtutorial.org/mongodb-tools/mongoimport/](https://www.mongodbtutorial.org/mongodb-tools/mongoimport/))
If you want to overwrite existing database, add `--drop`.
