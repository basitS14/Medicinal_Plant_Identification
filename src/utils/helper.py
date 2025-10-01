from PIL import Image
import torch
from torchvision import transforms
import pickle
import torch.nn as nn
import torch.nn.functional as F


class CNNetwork(nn.Module):

    def __init__(self , in_channels , num_classes):
        # in_channels : number of channels in RGB 3 in gryscale 1
        # num_classes : number of output classes
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels=in_channels , out_channels=32 , kernel_size=(3,3) , padding=1)
        self.conv2 = nn.Conv2d(in_channels=32 , out_channels=64 , kernel_size=(3,3) , padding=1)
        self.conv3 = nn.Conv2d(in_channels=64 , out_channels=128 , kernel_size=(3,3) , padding=1)

        self.maxPool = nn.MaxPool2d(kernel_size=2 , stride=2 , padding=0)

        # calcualte flattened zise dynamically
        with torch.no_grad():
            dummy_input = torch.zeros(1, in_channels, 224, 224) 
            x = self.maxPool(F.relu(self.conv1(dummy_input)))
            x = self.maxPool(F.relu(self.conv2(x)))
            x = self.maxPool(F.relu(self.conv3(x)))
            self.flattened_size = x.numel() # Get the number of elements in the tensor

        self.fc1 = nn.Linear(self.flattened_size , 128)
        self.fc2 = nn.Linear(128 , 64)
        self.fc3 = nn.Linear(64 , num_classes)


    def forward(self , x):
        x  = F.relu(self.conv1(x))
        x  = self.maxPool(x)

        x  = F.relu(self.conv2(x))
        x  = self.maxPool(x)

        x  = F.relu(self.conv3(x))
        x  = self.maxPool(x)

        x = torch.flatten(x  , 1)

        x = F.relu(self.fc1(x))
        x = F.relu(self.fc2(x))
        x = self.fc3(x)

        return x

