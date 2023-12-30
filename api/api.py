from flask import Flask, request
from pymongo import MongoClient
from flask_cors import CORS
import json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

mongoClient = MongoClient('mongodb://localhost:27017')
db = mongoClient.get_database('weatherdb')
reports = db.get_collection('reports_v2')


@app.route('/getData/', methods=["POST"], strict_slashes=False)
def get_data():
    filterData = request.json
    data = []
    for entry in reports.find(
            filterData,
            {"properties.meldungId": 1, "geometry.coordinates": 1, "properties.category": 1,
             "properties.auspraegung": 1, "properties.timestamp": 1, "properties.imageLabels": 1, "properties.timesReportedForImage": 1}):
        data.append({
            "id": entry["properties"]["meldungId"],
            "coordinates": entry["geometry"]["coordinates"],
            "category": entry["properties"]["category"],
            "auspraegung": entry["properties"]["auspraegung"],
            "timestamp": entry["properties"]["timestamp"],
            "imageExists": False if entry["properties"]["imageLabels"] is None or entry["properties"]["timesReportedForImage"] > 0 else True,
        })
    return json.dumps(data)

if __name__ == "__main__":
    app.run(debug=True)
