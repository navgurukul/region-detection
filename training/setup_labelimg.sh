#!/bin/bash

echo "=================================="
echo "LABELIMG SETUP (Local Labeling)"
echo "=================================="
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found. Please install Python first."
    exit 1
fi

echo "Installing LabelImg..."
pip3 install labelImg

echo ""
echo "✓ LabelImg installed!"
echo ""
echo "=================================="
echo "HOW TO USE:"
echo "=================================="
echo ""
echo "1. Put your screenshots in: training/dataset/images/"
echo ""
echo "2. Run LabelImg:"
echo "   labelImg training/dataset/images/ training/dataset/labels/"
echo ""
echo "3. In LabelImg:"
echo "   - Click 'Change Save Dir' → select training/dataset/labels/"
echo "   - Click 'YOLO' button (bottom left) to switch to YOLO format"
echo "   - Press 'W' to draw a box around each window"
echo "   - Type label: vscode, chrome, terminal, etc."
echo "   - Press 'D' to go to next image"
echo "   - Repeat for all images"
echo ""
echo "4. After labeling, run:"
echo "   python train_model.py"
echo ""
echo "=================================="
echo ""
echo "Ready to start labeling? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Creating folders..."
    mkdir -p dataset/images
    mkdir -p dataset/labels
    
    echo ""
    echo "✓ Folders created!"
    echo ""
    echo "Now:"
    echo "1. Copy your 28 screenshots to: training/dataset/images/"
    echo "2. Run: labelImg dataset/images/ dataset/labels/"
    echo ""
fi
