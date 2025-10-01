from pydantic import BaseModel , Field 
from typing import Optional , List
from pymongo import MongoClient
from src.exception import CustomException
import sys

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

class PlantInfoDB:
    def __init__(self):
        self.__client = MongoClient("mongodb://localhost:27017")
        self.__db = self.__client['pantIdentification']
        self.__collection = self.__db['plantInfo']

    def get_info(self , plant_name):
        doc = self.__collection.find_one({"plantName":plant_name})
        
        try:
            if doc:
                plant = PlantData(**doc)
                return plant.model_dump_json(indent=2)
        except Exception as e:
            return CustomException(e , sys)

    def add_info(self , plant_data_json):
        doc = PlantData(**plant_data_json)
        try:
            self.__collection.insert_one(doc.model_dump(by_alias=True))
            return "Data inserted Successfully."
        
        except Exception as e:
            return CustomException(e , sys)