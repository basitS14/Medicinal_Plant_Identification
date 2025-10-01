from PIL import Image
import torch
from torchvision import transforms
import pickle
import torch.nn as nn
import torch.nn.functional as F



def load_model(model_pth):
    return torch.load(model_pth , map_location='cpu')

def preprocess(image_pth):
    IMG_SIZE = (224, 224)

    transform = transforms.Compose([
        transforms.Resize(IMG_SIZE),
        transforms.ToTensor()
    ])

    image = Image.open(image_pth).convert("RGB")

    input_tensor = transform(image)

    input_batch = input_tensor.unsqueeze(0)    # add batch dimension

    return input_batch


def predict(input_batch , model):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")   
    input_batch = input_batch.to(device)

    model.eval()
    with torch.no_grad():
        output = model(input_batch)
    
    _ , predicted_class = torch.max(output , 1)
    return CLASS_NAMES[predicted_class.item()]