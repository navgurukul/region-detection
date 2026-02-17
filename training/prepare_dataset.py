#!/usr/bin/env python3
"""
Prepare dataset for training after labeling with LabelImg
Splits images into train/valid/test sets
"""

import os
import shutil
import random
from pathlib import Path

def prepare_dataset():
    """Split labeled images into train/valid/test sets"""
    
    # Paths
    images_dir = Path("dataset/images")
    labels_dir = Path("dataset/labels")
    
    # Check if directories exist
    if not images_dir.exists():
        print("❌ dataset/images/ not found!")
        print("Please create it and add your screenshots.")
        return
    
    if not labels_dir.exists():
        print("❌ dataset/labels/ not found!")
        print("Please label your images first using LabelImg.")
        return
    
    # Get all images
    image_files = list(images_dir.glob("*.png")) + list(images_dir.glob("*.jpg"))
    
    if len(image_files) == 0:
        print("❌ No images found in dataset/images/")
        return
    
    # Check for labels
    label_files = list(labels_dir.glob("*.txt"))
    
    if len(label_files) == 0:
        print("❌ No labels found in dataset/labels/")
        print("Please label your images first using LabelImg.")
        return
    
    print(f"✓ Found {len(image_files)} images")
    print(f"✓ Found {len(label_files)} labels")
    
    # Filter images that have labels
    labeled_images = []
    for img in image_files:
        label_file = labels_dir / f"{img.stem}.txt"
        if label_file.exists():
            labeled_images.append(img)
    
    print(f"✓ {len(labeled_images)} images have labels")
    
    if len(labeled_images) < 10:
        print("⚠️  Warning: Very few labeled images. Accuracy will be limited.")
        print("   Recommended: 50+ images for decent results")
    
    # Shuffle
    random.seed(42)
    random.shuffle(labeled_images)
    
    # Split ratios
    total = len(labeled_images)
    train_split = int(0.7 * total)
    valid_split = int(0.9 * total)
    
    train_images = labeled_images[:train_split]
    valid_images = labeled_images[train_split:valid_split]
    test_images = labeled_images[valid_split:]
    
    print(f"\nSplit:")
    print(f"  Train: {len(train_images)} images")
    print(f"  Valid: {len(valid_images)} images")
    print(f"  Test: {len(test_images)} images")
    
    # Create directories
    for split in ['train', 'valid', 'test']:
        (Path("dataset") / split / "images").mkdir(parents=True, exist_ok=True)
        (Path("dataset") / split / "labels").mkdir(parents=True, exist_ok=True)
    
    # Copy files
    def copy_split(images, split_name):
        for img in images:
            # Copy image
            shutil.copy(
                img,
                Path("dataset") / split_name / "images" / img.name
            )
            # Copy label
            label_file = labels_dir / f"{img.stem}.txt"
            if label_file.exists():
                shutil.copy(
                    label_file,
                    Path("dataset") / split_name / "labels" / f"{img.stem}.txt"
                )
    
    print("\nCopying files...")
    copy_split(train_images, "train")
    copy_split(valid_images, "valid")
    copy_split(test_images, "test")
    
    print("✓ Files copied!")
    
    # Create data.yaml
    # Get unique class names from labels
    classes = set()
    for label_file in label_files:
        with open(label_file, 'r') as f:
            for line in f:
                parts = line.strip().split()
                if parts:
                    class_id = int(parts[0])
                    classes.add(class_id)
    
    # Create class names (you'll need to map these)
    print("\n" + "="*50)
    print("IMPORTANT: Update class names in data.yaml")
    print("="*50)
    print("\nFound class IDs:", sorted(classes))
    print("\nYou need to map these to your actual labels.")
    print("Edit dataset/data.yaml and update the 'names' list.")
    print("\nExample:")
    print("  names:")
    print("    0: vscode")
    print("    1: chrome")
    print("    2: terminal")
    print("="*50)
    
    # Create data.yaml
    yaml_content = f"""# Dataset configuration for YOLOv8
path: {Path.cwd() / 'dataset'}
train: train/images
val: valid/images
test: test/images

# Number of classes
nc: {len(classes)}

# Class names (UPDATE THESE!)
names:
"""
    
    for i in sorted(classes):
        yaml_content += f"  {i}: class_{i}  # TODO: Replace with actual name (vscode, chrome, etc.)\n"
    
    with open("dataset/data.yaml", "w") as f:
        f.write(yaml_content)
    
    print(f"\n✓ Created dataset/data.yaml")
    print("\n" + "="*50)
    print("NEXT STEPS:")
    print("="*50)
    print("1. Edit dataset/data.yaml")
    print("2. Update class names (0: vscode, 1: chrome, etc.)")
    print("3. Run: python train_model.py")
    print("="*50)

if __name__ == "__main__":
    prepare_dataset()
