from flask import Flask, request
from flask import send_from_directory
from pymongo import MongoClient
from flask_cors import CORS
import json
import os

from MSPhate import calculate_ms_phate

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

mongoClient = MongoClient('mongodb://localhost:27017')
db = mongoClient.get_database('weatherdb')
reports = db.get_collection('reports')


@app.route('/getData/', methods=["POST"], strict_slashes=False)
def get_data():
    filterData = request.json
    data = []
    for entry in reports.find(
            filterData,
            {"properties.meldungId": 1, "geometry.coordinates": 1, "properties.category": 1,
             "properties.auspraegung": 1, "properties.timestamp": 1, "properties.imageUrl": 1}):
        data.append({
            "id": entry["properties"]["meldungId"],
            "coordinates": entry["geometry"]["coordinates"],
            "category": entry["properties"]["category"],
            "auspraegung": entry["properties"]["auspraegung"],
            "timestamp": entry["properties"]["timestamp"],
            "imageName": None if entry["properties"]["imageUrl"] is None else entry["properties"]["imageUrl"][(entry["properties"]["imageUrl"].rfind("/") + 1):],
        })
    return json.dumps(data)


# @app.route('/getImage/', methods=["POST"], strict_slashes=False)
# def get_image():
#     imageName = request.json
#     print(imageName)
#     imageName = "icy.png"
#     path = "/Users/domi/Desktop/TestImages"
#     print(os.path.join(path, imageName))
#     return Flask.send_static_file(os.path.join(path, imageName))


test_data = [
    {'id': 84684,
     'coordinates': [47.08, 9.475],
     'category': 'WIND',
     'auspraegung': 'WIND_SCHWACH',
     'timestamp': 1641024926409},
    {'id': 84880,
     'coordinates': [46.82, 9.71],
     'category': 'WIND',
     'auspraegung':
         'WIND_SCHWACH',
     'timestamp': 1641029156740}
]


@app.route('/', methods=["GET"], strict_slashes=False)
def test():
    parameter = request.args.get('test')
    here = test_data

    data = calculate_ms_phate(test_data)

    return json.dumps(test_data)


@app.route('/getMSPhate/', methods=["POST"], strict_slashes=False)
def getMSPhate():
    data = request.json
    cluster = calculate_ms_phate(data)

    return json.dumps(data)


if __name__ == "__main__":
    app.run(debug=True)
