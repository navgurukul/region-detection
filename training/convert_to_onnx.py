#!/usr/bin/env python3
"""
Convert trained YOLOv8 model to ONNX format for browser use
This runs LOCALLY - creates a file you can use in the browser!
"""

from ultralytics import YOLO
import os
import shutil

def convert_to_browser_format():
    """
    Convert the trained model to ONNX format for browser deployment
    """
    
    print("=" * 60)
    print("CONVERTING MODEL TO BROWSER FORMAT")
    print("=" * 60)
    print()
    
    # Find the trained model
    model_path = 'runs/detect/screen-detector/weights/best.pt'
    
    if not os.path.exists(model_path):
        print("❌ ERROR: Trained model not found!")
        print(f"Expected: {model_path}")
        print()
        print("Please train the model first:")
        print("Run: python train_model.py")
        return
    
    print(f"📦 Loading trained model from: {model_path}")
    model = YOLO(model_path)
    print("✓ Model loaded")
    print()
    
    # Export to ONNX format
    print("🔄 Converting to ONNX format...")
    print("This will take 1-2 minutes...")
    print()
    
    model.export(
        format='onnx',
        imgsz=640,
        simplify=True,  # Simplify for better browser performance
        opset=12,       # ONNX opset version
        dynamic=False,  # Static shape for browser
    )
    
    # Move to public/models folder
    onnx_file = model_path.replace('.pt', '.onnx')
    destination = '../public/models/screen-detector.onnx'
    
    os.makedirs(os.path.dirname(destination), exist_ok=True)
    shutil.copy(onnx_file, destination)
    
    # Get file size
    size_mb = os.path.getsize(destination) / (1024 * 1024)
    
    print()
    print("=" * 60)
    print("✓ CONVERSION COMPLETE!")
    print("=" * 60)
    print()
    print(f"✓ Model saved to: {destination}")
    print(f"✓ File size: {size_mb:.2f} MB")
    print()
    print("=" * 60)
    print("NEXT STEPS:")
    print("=" * 60)
    print()
    print("1. Update src/config.ts:")
    print("   MODEL_PATH: '/models/screen-detector.onnx'")
    print()
    print("2. Update class names in src/config.ts:")
    print("   export const CLASS_NAMES = [")
    print("     'vscode',")
    print("     'chrome',")
    print("     'terminal',")
    print("     // ... your labels")
    print("   ];")
    print()
    print("3. Refresh browser and test!")
    print()
    print("The model will now run 100% in the browser!")
    print("No backend needed! 🎉")
    print()

if __name__ == "__main__":
    convert_to_browser_format()
