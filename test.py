# from src.utils.helper import predict , preprocess  , load_model
# from src.utils.helper import CNNetwork

# model = load_model('./artifacts/models/torch_model.pth')

# img_pth = './Medicinal Plant Identification Dataset/Validation Images/Curry leaf/Curry Leaf (6).jpg'
# input_batch = preprocess(img_pth)
# print(predict(model=model , input_batch=input_batch))

from src.utils.database import PlantInfoDB
import json

db = PlantInfoDB()


plants = [
  {
    "plantName": "Rubble Leaf",
    "scientificName": "Ficus religiosa var. rubra", 
    "family": "Moraceae",
    "origin": "South Asia",
    "benefits": [
        "Traditionally used in folk remedies",
        "Potential antioxidant properties"
    ],
    "recipes": [
        {
            "title": "Rubble Leaf Herbal Infusion",
            "description": "Steep dried rubble leaves in hot water for 5-7 minutes. Consume in moderation."
        }
    ],
    "toxicity": "Limited research available. Safe in small amounts, avoid excess until further studies.",
    "isToxic": False
}

]


for plant in plants:
    res =    db.add_info(plant)
    print(res)
