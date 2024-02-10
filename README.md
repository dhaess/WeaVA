# WeaVA

This project is described in the paper "WeaVA: Visual Analysis of Citizens’ Weather Reports.
It is written by Dominique Hässig<sup>1</sup>, Haiyan Wang<sup>2</sup>, Renato Pajarola<sup>2</sup> and Alexandra Diehl<sup>2</sup>.

<sup>2</sup>MeteoSwiss, <sup>2</sup>University of Zurich, Switzerland

## Abstract

Online user reports about weather events that include multimedia data are unique and novel resources to complement authoritative data sources such as remote sensing and radar images. They are helpful for early detection and tracking of collective responses to high-impact weather events.
We propose a first step towards gaining more knowledge about this collected crowd-sourced data by visually analyzing online citizens' reports gathered by MeteoSwiss, the Swiss Federal Office of Meteorology and Climatology. Our solution supports the visual exploration of the citizen' weather reports based on selected features like weather event categories and their intensities.
We have designed a novel clutter-free bubble map visualization that facilitates an easy exploration and quantification of weather reports through space and time. It allows the analysis at different zoom levels, supporting multiple interactive exploration features such as sync or a-sync event histogram comparisons, clutter-free pie-chart map visualizations, and animations.  
We illustrate our solution with a series of use cases and findings. We performed a user study with domain experts from the national weather services in Switzerland, Austria, and Argentina to evaluate our tool's expressiveness, effectiveness, and easiness of use.
The results of our evaluation show the value of our tool for weather forecasting and its benefits for domain experts. Participants assessed it as very to extremely effective, very expressive, and very easy to use.
We also present a list of the benefits of our design, future work, and limitations.

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
