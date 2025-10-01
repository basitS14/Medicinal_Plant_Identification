from flask import Flask, jsonify , request
from streamlit import json
from src.pipelines.prediction_pipeline import PredictionPipeline
from src.utils.helper import CNNetwork
from flask_cors import CORS
from src.utils.database import PlantInfoDB


app = Flask(__name__)
CORS(app)

db = PlantInfoDB()

@app.route("/")
def home():
    return jsonify({"res":"hello"})

@app.route("/predict" ,methods=['POST'])
def predict():
    pipe = PredictionPipeline()
    if 'imageInput' not in request.files:
        return jsonify({"error":"no image part"}) , 400
    
    image = request.files['imageInput']

    try:
        prediction , confidence = pipe.predict(image)
        return jsonify({"result":prediction , "confidence":confidence})
    
    except Exception as e:
        return jsonify({"error":e})    

@app.route("/plantInfo" , methods=['POST'])
def get_plant_info():
    try:
        data = request.get_json()
        plant_name = data.get("plant_name")

        if not plant_name:
            return jsonify({"error": "plant name is required"}), 400

        plant_info = db.get_info(plant_name)  
        return plant_info
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True , host='0.0.0.0' )