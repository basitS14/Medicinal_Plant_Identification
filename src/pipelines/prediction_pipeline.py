import sys
from src.utils.utils import load_model , preprocess
from src.utils.helper import CNNetwork
import torch
from src import logger
from src.exception import CustomException
import torch.nn.functional as F

class PredictionPipeline():
    def __init__(self):
        pth = r"C:\Users\windows\OneDrive\Documents\data science projects\Medicinal_Plant_Identification\artifacts\models\torch_model.pth"
        self.__model = load_model(pth)
        self.__classnames = ['Arjun Leaf', 'Curry Leaf', 'Marsh Pennywort Leaf', 'Mint Leaf', 'Neem Leaf','Rubble Leaf']
    
    
    def predict(self , image):
        try:
            image_input = preprocess(image)
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")   
            image_input = image_input.to(device)

            self.__model.eval()
            with torch.no_grad():
                output = self.__model(image_input)

                probabilities  = F.softmax(output , dim=1)

                confidence , predicted_class = torch.max(probabilities , 1)
            return  self.__classnames[predicted_class.item()] , round(confidence.item()*100)
        
        except Exception as e:
            CustomException(e , sys)
            
