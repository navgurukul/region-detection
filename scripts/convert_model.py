#!/usr/bin/env python3
"""
Convert YOLOv8 model to ONNX format for browser deployment
"""

from ultralytics import YOLO
import argparse
import os


def convert_to_onnx(
    model_path: str = "yolov8n.pt",
    output_path: str = "../public/models/yolov8n.onnx",
    imgsz: int = 640,
    simplify: bool = True
):
    """
    Convert YOLOv8 PyTorch model to ONNX format
    
    Args:
        model_path: Path to YOLOv8 .pt model
        output_path: Where to save ONNX model
        imgsz: Input image size
        simplify: Whether to simplify ONNX model
    """
    print(f"Loading model from {model_path}...")
    model = YOLO(model_path)
    
    print(f"Converting to ONNX (size={imgsz})...")
    model.export(
        format="onnx",
        imgsz=imgsz,
        simplify=simplify,
        opset=12,  # ONNX opset version
        dynamic=False,  # Static shape for better browser performance
    )
    
    # Move to output location
    onnx_file = model_path.replace('.pt', '.onnx')
    if os.path.exists(onnx_file):
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        os.rename(onnx_file, output_path)
        print(f"✓ Model saved to {output_path}")
        
        # Print file size
        size_mb = os.path.getsize(output_path) / (1024 * 1024)
        print(f"✓ Model size: {size_mb:.2f} MB")
    else:
        print(f"✗ Conversion failed - {onnx_file} not found")


def main():
    parser = argparse.ArgumentParser(description="Convert YOLOv8 to ONNX")
    parser.add_argument(
        "--model",
        type=str,
        default="yolov8n.pt",
        help="Path to YOLOv8 model (default: yolov8n.pt)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="../public/models/yolov8n.onnx",
        help="Output path for ONNX model"
    )
    parser.add_argument(
        "--size",
        type=int,
        default=640,
        help="Input image size (default: 640)"
    )
    parser.add_argument(
        "--no-simplify",
        action="store_true",
        help="Don't simplify ONNX model"
    )
    
    args = parser.parse_args()
    
    convert_to_onnx(
        model_path=args.model,
        output_path=args.output,
        imgsz=args.size,
        simplify=not args.no_simplify
    )


if __name__ == "__main__":
    main()
