# Training Custom YOLOv8 Model for UI Detection

This guide explains how to train a custom YOLOv8 model to detect specific applications and UI regions.

## Overview

To detect custom UI elements (VS Code, ChatGPT, LeetCode, etc.), you need to:
1. Collect and label training data
2. Train YOLOv8 on your dataset
3. Convert to ONNX format
4. Deploy to browser

## Step 1: Dataset Preparation

### Collect Screenshots

Capture screenshots of the applications you want to detect:

```bash
# Example applications to capture:
- VS Code (different themes, layouts)
- Chrome/Firefox browser windows
- ChatGPT interface
- LeetCode problems
- Terminal windows
- Phone screens
- Video call windows
```

Aim for:
- 100-500 images per class
- Various screen resolutions
- Different lighting/themes
- Multiple window sizes

### Labeling Tools

#### Option A: LabelImg (Desktop)

```bash
pip install labelImg
labelImg
```

1. Open image directory
2. Create bounding boxes
3. Assign class labels
4. Save in YOLO format

#### Option B: Roboflow (Web-based, Recommended)

1. Create account at https://roboflow.com
2. Create new project (Object Detection)
3. Upload images
4. Label using web interface
5. Export in YOLOv8 format

### Dataset Structure

```
dataset/
├── images/
│   ├── train/
│   │   ├── img001.jpg
│   │   ├── img002.jpg
│   │   └── ...
│   └── val/
│       ├── img101.jpg
│       └── ...
└── labels/
    ├── train/
    │   ├── img001.txt
    │   ├── img002.txt
    │   └── ...
    └── val/
        ├── img101.txt
        └── ...
```

### Label Format (YOLO)

Each `.txt` file contains one line per object:

```
<class_id> <x_center> <y_center> <width> <height>
```

All values normalized to [0, 1]:

```
0 0.5 0.5 0.3 0.4
1 0.2 0.3 0.15 0.2
```

## Step 2: Create Dataset Config

Create `dataset.yaml`:

```yaml
# dataset.yaml
path: /path/to/dataset
train: images/train
val: images/val

# Classes
names:
  0: vscode
  1: chrome
  2: firefox
  3: terminal
  4: chatgpt
  5: leetcode
  6: phone-screen
  7: browser-window
  8: code-editor
  9: video-call
```

## Step 3: Train Model

### Install Dependencies

```bash
pip install ultralytics
```

### Training Script

Create `train.py`:

```python
from ultralytics import YOLO

# Load pretrained model
model = YOLO('yolov8n.pt')  # or yolov8s.pt, yolov8m.pt

# Train
results = model.train(
    data='dataset.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    name='ui-detector',
    patience=20,
    save=True,
    device=0,  # GPU 0, or 'cpu'
)

# Validate
metrics = model.val()

# Export to ONNX
model.export(format='onnx', simplify=True)
```

### Run Training

```bash
python train.py
```

### Training Parameters

- `epochs`: 50-200 (more for complex datasets)
- `batch`: 8-32 (depends on GPU memory)
- `imgsz`: 640 (standard), 320 (faster), 1280 (more accurate)
- `patience`: Early stopping patience

### Monitor Training

```bash
# View results
tensorboard --logdir runs/detect/ui-detector
```

## Step 4: Evaluate Model

```python
from ultralytics import YOLO

model = YOLO('runs/detect/ui-detector/weights/best.pt')

# Validate
metrics = model.val()
print(f"mAP50: {metrics.box.map50}")
print(f"mAP50-95: {metrics.box.map}")

# Test on single image
results = model.predict('test_image.jpg', save=True)
```

## Step 5: Convert to ONNX

```bash
cd scripts
python convert_model.py \
  --model ../runs/detect/ui-detector/weights/best.pt \
  --output ../public/models/custom-ui-detector.onnx \
  --size 640
```

## Step 6: Update Frontend Config

Edit `src/config.ts`:

```typescript
export const CONFIG = {
  MODEL_PATH: '/models/custom-ui-detector.onnx',
  // ... other settings
};

export const CUSTOM_CLASS_NAMES = [
  'vscode', 'chrome', 'firefox', 'terminal',
  'chatgpt', 'leetcode', 'phone-screen',
  'browser-window', 'code-editor', 'video-call'
];
```

Update `src/detector.worker.ts` to use `CUSTOM_CLASS_NAMES` instead of `CLASS_NAMES`.

## Tips for Better Results

### Data Collection

- Capture at different times of day
- Include partial windows
- Vary window positions
- Include overlapping windows
- Mix light/dark themes

### Data Augmentation

Roboflow/Ultralytics automatically apply:
- Random crops
- Brightness/contrast adjustments
- Flips and rotations
- Mosaic augmentation

### Improve Accuracy

1. **More data**: 200+ images per class
2. **Balanced dataset**: Equal samples per class
3. **Larger model**: Use yolov8s or yolov8m
4. **Longer training**: 100-200 epochs
5. **Fine-tune**: Start from pretrained weights

### Reduce Model Size

1. Use yolov8n (smallest)
2. Reduce input size (320x320)
3. Prune model after training
4. Quantize to INT8 (advanced)

## Troubleshooting

### Low mAP

- Add more training data
- Check label quality
- Increase epochs
- Try larger model

### Slow Inference

- Use smaller model (yolov8n)
- Reduce input size
- Optimize ONNX model
- Enable WebGL backend

### Out of Memory

- Reduce batch size
- Use smaller model
- Reduce image size
- Close other applications

## Advanced: Active Learning

1. Deploy initial model
2. Collect misclassified examples
3. Label and add to dataset
4. Retrain model
5. Repeat

## Resources

- [Ultralytics Docs](https://docs.ultralytics.com)
- [Roboflow Universe](https://universe.roboflow.com)
- [LabelImg GitHub](https://github.com/heartexlabs/labelImg)
- [YOLO Format Guide](https://docs.ultralytics.com/datasets/detect/)
