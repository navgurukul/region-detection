#!/usr/bin/env python3
"""
Train YOLOv8 model for screen region detection
This runs LOCALLY on your computer - no server needed!
"""

from ultralytics import YOLO
import os

def train_screen_detector():
    """
    Train a custom YOLOv8 model to detect screen regions
    """
    
    print("=" * 60)
    print("TRAINING SCREEN REGION DETECTOR")
    print("=" * 60)
    print()
    print("This will train a model to detect:")
    print("  - VS Code windows")
    print("  - Browser windows")
    print("  - Terminal windows")
    print("  - Code editor panels")
    print("  - Any other regions you labeled")
    print()
    print("=" * 60)
    print()
    
    # Check if dataset exists
    if not os.path.exists('dataset/data.yaml'):
        print("❌ ERROR: Dataset not found!")
        print()
        print("Please create your dataset first:")
        print("1. Take 200-500 screenshots of your screen")
        print("2. Upload to Roboflow.com (free)")
        print("3. Label the regions (draw boxes)")
        print("4. Export as 'YOLOv8' format")
        print("5. Download and extract to 'dataset/' folder")
        print()
        print("See TRAINING_GUIDE.md for detailed instructions")
        return
    
    # Load pretrained YOLOv8 model
    print("📦 Loading pretrained YOLOv8n model...")
    model = YOLO('yolov8n.pt')
    print("✓ Model loaded")
    print()
    
    # Train the model
    print("🚀 Starting training...")
    print("This will take 10-30 minutes depending on your hardware")
    print()
    
    results = model.train(
        data='dataset/data.yaml',
        epochs=100,              # Number of training iterations
        imgsz=640,               # Image size
        batch=16,                # Batch size (reduce if out of memory)
        name='screen-detector',  # Project name
        patience=20,             # Early stopping
        save=True,
        device=0,                # Use GPU 0 (or 'cpu' for CPU training)
        workers=4,
        plots=True,
    )
    
    print()
    print("=" * 60)
    print("✓ TRAINING COMPLETE!")
    print("=" * 60)
    print()
    print("Model saved to: runs/detect/screen-detector/weights/best.pt")
    print()
    print("Next step: Convert to ONNX format")
    print("Run: python convert_to_onnx.py")
    print()
    
    # Validate the model
    print("📊 Validating model...")
    metrics = model.val()
    print(f"✓ mAP50: {metrics.box.map50:.3f}")
    print(f"✓ mAP50-95: {metrics.box.map:.3f}")
    print()
    
    return model

if __name__ == "__main__":
    train_screen_detector()
