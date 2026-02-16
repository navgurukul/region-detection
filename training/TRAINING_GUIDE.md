# Complete Training Guide - 100% Client-Side Solution

## Overview

This guide shows you how to train a custom model that runs **100% in the browser**. You train it once on your computer, then it works forever in the browser with no backend!

## Step-by-Step Guide

### Step 1: Collect Screenshots (30 minutes)

Take 200-500 screenshots of your screen with different applications open.

**What to capture:**
- VS Code with different projects
- Browser windows (Chrome, Firefox)
- Terminal windows
- Code editors
- Any other apps you want to detect

**How to take screenshots:**
```bash
# Mac: Cmd + Shift + 4
# Windows: Windows + Shift + S
# Linux: Screenshot tool

# Save all to a folder: screenshots/
```

**Tips:**
- Vary window sizes
- Different positions on screen
- Multiple windows open
- Different themes (light/dark)
- Overlapping windows

### Step 2: Label Your Data (1-2 hours)

Use **Roboflow** (free, web-based, no installation):

1. **Go to** https://roboflow.com
2. **Create account** (free)
3. **Create new project:**
   - Name: "Screen Region Detector"
   - Type: "Object Detection"
   
4. **Upload screenshots:**
   - Drag and drop all your screenshots
   - Wait for upload to complete

5. **Label regions:**
   - Click on an image
   - Draw boxes around each window/region
   - Label each box:
     - "vscode" for VS Code windows
     - "chrome" for Chrome browser
     - "terminal" for terminal windows
     - "firefox" for Firefox
     - "code-editor" for any code editor
     - etc.

6. **Generate dataset:**
   - Click "Generate"
   - Split: 70% train, 20% valid, 10% test
   - Augmentation: None (or light)
   - Click "Generate"

7. **Export:**
   - Format: "YOLOv8"
   - Click "Download"
   - Extract the zip file

### Step 3: Prepare Dataset

```bash
cd screen-region-detector-client/training

# Extract your downloaded dataset here
unzip ~/Downloads/Screen-Region-Detector-1.zip

# Rename to 'dataset'
mv Screen-Region-Detector-1 dataset

# Your structure should be:
# training/
#   dataset/
#     train/
#       images/
#       labels/
#     valid/
#       images/
#       labels/
#     data.yaml
```

### Step 4: Install Training Tools (5 minutes)

```bash
# Install Python packages (one-time)
pip install ultralytics torch torchvision

# This downloads YOLOv8 (one-time, ~6MB)
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

### Step 5: Train Model (10-30 minutes)

```bash
cd training
python train_model.py
```

**What happens:**
- Loads pretrained YOLOv8n model
- Trains on your screenshots
- Saves best model to `runs/detect/screen-detector/weights/best.pt`
- Shows training progress

**Training time:**
- GPU: 10-15 minutes
- CPU: 20-30 minutes

**Expected results:**
- mAP50: >0.80 (80% accuracy)
- mAP50-95: >0.60

### Step 6: Convert to Browser Format (2 minutes)

```bash
python convert_to_onnx.py
```

**What happens:**
- Converts `.pt` model to `.onnx` format
- Optimizes for browser
- Copies to `public/models/screen-detector.onnx`
- File size: 6-12MB

### Step 7: Update Browser App (2 minutes)

Edit `src/config.ts`:

```typescript
export const CONFIG = {
  DETECTION_MODE: 'objects', // Change from 'layout' to 'objects'
  MODEL_PATH: '/models/screen-detector.onnx', // Your custom model
  // ... rest stays same
};

// Update class names to match your labels
export const CLASS_NAMES = [
  'vscode',
  'chrome',
  'firefox',
  'terminal',
  'code-editor',
  // Add all your labels here
];
```

### Step 8: Test in Browser

```bash
npm run dev
```

Open http://localhost:5173

1. Click "Start Detection"
2. Share your screen
3. See accurate detection of your windows! 🎉

## How It Works (100% Client-Side)

```
┌─────────────────────────────────────────────────────────┐
│              ONE-TIME TRAINING (Your Computer)           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Screenshots → Label → Train YOLOv8 → Convert to ONNX   │
│                                              │           │
│                                              ▼           │
│                                    screen-detector.onnx  │
│                                         (6-12MB file)    │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Copy to public/models/
                          ▼
┌─────────────────────────────────────────────────────────┐
│              FOREVER AFTER (Browser Only!)               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Browser downloads .onnx file (once)                     │
│         ↓                                                │
│  Loads into ONNX Runtime Web                             │
│         ↓                                                │
│  Runs inference locally                                  │
│         ↓                                                │
│  Detects your windows accurately!                        │
│                                                          │
│  NO BACKEND NEEDED! ✓                                    │
│  NO UPLOADS! ✓                                           │
│  100% PRIVATE! ✓                                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Troubleshooting

### "Dataset not found"
- Make sure `training/dataset/data.yaml` exists
- Check folder structure matches Step 3

### "Out of memory during training"
- Reduce batch size in `train_model.py`: `batch=8`
- Or use CPU: `device='cpu'`

### "Model not accurate enough"
- Collect more screenshots (500+)
- Label more carefully
- Train longer: `epochs=200`

### "Model file too large"
- Use yolov8n (smallest): Already default
- Reduce image size: `imgsz=320`

## Advanced: Improve Accuracy

### Collect More Data
- 500+ screenshots = better accuracy
- Vary conditions (time of day, themes, etc.)

### Better Labeling
- Draw tight boxes around windows
- Label consistently
- Include partial windows

### Longer Training
```python
# In train_model.py
epochs=200  # Instead of 100
```

### Larger Model
```python
# In train_model.py
model = YOLO('yolov8s.pt')  # Instead of yolov8n
# Result: More accurate but larger file (22MB)
```

## Summary

✅ **Train once** on your computer (30 min - 2 hours total)
✅ **Use forever** in browser (100% client-side)
✅ **No backend** needed
✅ **No uploads** - complete privacy
✅ **Accurate** - 80-90%+ detection rate

The model file is just a static asset like an image - download once, use forever!

## Need Help?

- Check console for errors
- Verify dataset structure
- Try with fewer images first (50) to test
- Check training logs in `runs/detect/screen-detector/`

Happy training! 🚀
