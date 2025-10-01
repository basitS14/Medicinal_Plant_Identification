import os
import shutil
import random

# Set random seed for reproducibility
random.seed(42)

# Paths
base_dir = r"Medicinal Plant Identification Dataset/Original Images (Version 02)"
output_dir = r"Medicinal Plant Identification Dataset/Validation Images"

# Create output directories
os.makedirs(output_dir, exist_ok=True)

# Get all class folders
classes = [d for d in os.listdir(base_dir) if os.path.isdir(os.path.join(base_dir, d))]

for cls in classes:
	cls_path = os.path.join(base_dir, cls)
	images = [f for f in os.listdir(cls_path) if f.lower().endswith('.jpg')]
	random.shuffle(images)
	split_idx = int(len(images) * 0.8)
	val_images = images[split_idx:]

	# Create class folders in train and val
	val_cls_dir = os.path.join(output_dir, cls)
	os.makedirs(val_cls_dir, exist_ok=True)

	# Copy images
	for img in val_images:
		src = os.path.join(cls_path, img)
		dst = os.path.join(val_cls_dir, img)
		shutil.copy2(src, dst)
