from flask import Flask, request
from flask import send_from_directory
from pymongo import MongoClient
from flask_cors import CORS
import json
import os

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
             "properties.auspraegung": 1, "properties.timestamp": 1}):
        data.append({
            "id": entry["properties"]["meldungId"],
            "coordinates": entry["geometry"]["coordinates"],
            "category": entry["properties"]["category"],
            "auspraegung": entry["properties"]["auspraegung"],
            "timestamp": entry["properties"]["timestamp"],

        })
    return json.dumps(data)

# @app.route('/getImage/', methods="POST", strict_slashes=False)
# def get_image():
#     imageName = request.json
#     print(imageName)
#     imageName = "icy.png"
#     path = "/Users/domi/Desktop/TestImages"
#     print(os.path.join(path, imageName))
#     return Flask.send_static_file(os.path.join(path, imageName))



if __name__ == "__main__":
    app.run(debug=True)
