from pydantic import BaseModel , Field 
from typing import Optional , List
from pymongo import MongoClient
from src.exception import CustomException
import sys
import bcrypt

class Recipe(BaseModel):
    title : str
    description : str

class PlantData(BaseModel):
    plantName : str
    scientificName : str
    family : str
    origin : str
    benefits : List[str] 
    recipes : List[Recipe]
    toxicity : str
    isToxic : bool

class UserData(BaseModel):
    name : str
    email: str
    password : str
    

class ManageDB:
    def __init__(self):
        self.__client = MongoClient("mongodb://localhost:27017")
        self.__db = self.__client['pantIdentification']
        self.__plantCollection = self.__db['plantInfo']
        self.__userCollection = self.__db['Users']

    def get_plant_info(self , plant_name):
        doc = self.__plantCollection.find_one({"plantName":plant_name})
        
        try:
            if doc:
                plant = PlantData(**doc)
                return plant.model_dump_json(indent=2)
        except Exception as e:
            return CustomException(e , sys)

    def add_plant_info(self , plant_data_json):
        doc = PlantData(**plant_data_json)
        try:
            self.__plantCollection.insert_one(doc.model_dump(by_alias=True))
            return "Data inserted Successfully."
        
        except Exception as e:
            return CustomException(e , sys)
    
    def add_user(self , user_data):
        password =  user_data['password'].encode('utf-8')   # converted into bytes
        hashed = bcrypt.hashpw(password , bcrypt.gensalt(14))
        user_data['password'] = hashed.decode('utf-8')

        user_doc = UserData(**user_data)
        try:
            user = self.__userCollection.find_one({"email":user_data["email"]})
            if not user:
                self.__userCollection.insert_one(user_doc.model_dump(by_alias=True))
                return "OK"
            return "email already exists"
                
        except Exception as e:
            return CustomException(e , sys)
    
    def validate_login(self , email , password):
        encoded_password = password.encode('utf-8')

        user = self.__userCollection.find_one({"email":email})
        user_password = user['password']

        if user and bcrypt.checkpw(encoded_password , user_password.encode('utf-8')):
            return {"email":user["email"] , "name":user["name"]}
        return 0
    
    def get_user_info(self , email):
        try:
            user_data = self.__userCollection.find_one({"email":email})
            return {"email":user_data["email"] , "name":user_data["name"]}
        except Exception as e:
            return CustomException(e , sys)

    

   

    
            



        

        


        
        