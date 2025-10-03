from flask import Flask, jsonify , request
from src.pipelines.prediction_pipeline import PredictionPipeline
from src.utils.helper import CNNetwork
from flask_cors import CORS
from src.utils.database import ManageDB
from flask_jwt_extended import create_access_token , JWTManager
from dotenv import load_dotenv
import os

load_dotenv()


app = Flask(__name__)
app.config["JWT_SECRET"] = os.getenv("JWT_SECRET")
CORS(app) 

db = ManageDB()
jwt = JWTManager(app)

@app.route("/")
def home():
    return jsonify({"res":"welome"}) , 200

@app.route("/signup" , methods=['POST'])
def signup():
    if request.method == 'POST':
        user_data = request.get_json()
        msg = db.add_user(user_data)
    
    try:
        if msg == "OK":
            return jsonify({"email":user_data["email"] , "msg":msg}) , 200
        return jsonify({"email":user_data["email"] , "msg":msg}) , 409
    except Exception as e:
        return jsonify({"error":e}) , 500

@app.route("/login" , methods=["POST"])
def login():
    if request.method == 'POST':
        login_data = request.get_json()
        email = login_data['email']
        password = login_data['password']
    
    try:
        user = db.validate_login(email , password)
        
        if user:
            access_token = create_access_token(identity=email)
            return jsonify({"user":user ,"token":access_token }) , 200
        return jsonify({"msg":"Invalid email or password"}) , 401
    except Exception as e:
        return jsonify({"error":e}) , 500

               
@app.route("/predict" ,methods=['POST'])
def predict():
    pipe = PredictionPipeline()
    if 'imageInput' not in request.files:
        return jsonify({"error":"no image part"}) , 400
    
    image = request.files['imageInput']

    try:
        prediction , confidence = pipe.predict(image)
        return jsonify({"result":prediction , "confidence":confidence}) , 200
    
    except Exception as e:
        return jsonify({"error":e})    

@app.route("/plantInfo" , methods=['POST'])
def get_plant_info():
    try:
        data = request.get_json()
        plant_name = data.get("plant_name")

        if not plant_name:
            return jsonify({"error": "plant name is required"}), 400

        plant_info = db.get_plant_info(plant_name)  
        return plant_info
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

if __name__ == '__main__':
    app.run(debug=True , host='0.0.0.0' )