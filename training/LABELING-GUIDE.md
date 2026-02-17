# Local Labeling Guide (No Roboflow)

## Option 1: LabelImg (Recommended - GUI Tool)

### Install

```bash
pip3 install labelImg
```

### Setup

```bash
cd screen-region-detector-client/training

# Create folders
mkdir -p dataset/images
mkdir -p dataset/labels

# Copy your 28 screenshots to dataset/images/
cp ~/Desktop/*.png dataset/images/
```

### Label Your Images

```bash
# Start LabelImg
labelImg dataset/images/ dataset/labels/
```

**In LabelImg:**

1. **Switch to YOLO format:**
   - Click "YOLO" button (bottom left)
   - This is important!

2. **Set save directory:**
   - Click "Change Save Dir"
   - Select `training/dataset/labels/`

3. **Start labeling:**
   - Press `W` to draw a box
   - Drag around each window/application
   - Type label name:
     - `vscode` for VS Code
     - `chrome` for Chrome
     - `terminal` for Terminal
     - `firefox` for Firefox
   - Press `Ctrl+S` to save
   - Press `D` to go to next image

4. **Repeat for all 28 images**

**Tips:**
- Draw tight boxes around each window
- Include the title bar
- Label ALL windows in each screenshot
- Use consistent lowercase names
- Even partial windows should be labeled

### Prepare Dataset

After labeling all images:

```bash
python prepare_dataset.py
```

This will:
- Split images into train/valid/test
- Create proper folder structure
- Generate `data.yaml` file

### Update Class Names

Edit `dataset/data.yaml` and replace class names:

```yaml
names:
  0: vscode      # Replace class_0 with your actual label
  1: chrome      # Replace class_1 with your actual label
  2: terminal    # Replace class_2 with your actual label
```

### Train

```bash
python train_model.py
```

---

## Option 2: Manual YOLO Format (Advanced)

If you can't install LabelImg, you can create labels manually.

### YOLO Label Format

Each image needs a `.txt` file with the same name:

```
image1.png  →  image1.txt
image2.png  →  image2.txt
```

Each line in the `.txt` file represents one bounding box:

```
<class_id> <x_center> <y_center> <width> <height>
```

All values are normalized (0.0 to 1.0):
- `class_id`: 0, 1, 2, etc. (your class index)
- `x_center`: center X / image_width
- `y_center`: center Y / image_height
- `width`: box_width / image_width
- `height`: box_height / image_height

### Example

Image: `screenshot1.png` (1920x1080 pixels)

VS Code window:
- Top-left: (100, 200)
- Bottom-right: (1000, 900)

Calculate:
- Center X: (100 + 1000) / 2 = 550
- Center Y: (200 + 900) / 2 = 550
- Width: 1000 - 100 = 900
- Height: 900 - 200 = 700

Normalize:
- x_center: 550 / 1920 = 0.286
- y_center: 550 / 1080 = 0.509
- width: 900 / 1920 = 0.469
- height: 700 / 1080 = 0.648

Label file `screenshot1.txt`:
```
0 0.286 0.509 0.469 0.648
```

If you have multiple windows, add more lines:
```
0 0.286 0.509 0.469 0.648
1 0.750 0.500 0.400 0.600
```

### Class Mapping

Create `classes.txt`:
```
vscode
chrome
terminal
firefox
```

Line 0 = class 0 (vscode)
Line 1 = class 1 (chrome)
etc.

---

## Option 3: Use CVAT (Web-based, Self-hosted)

If you want a web interface but don't want Roboflow:

```bash
# Install Docker first, then:
docker run -d -p 8080:8080 openvino/cvat

# Open http://localhost:8080
# Upload images and label
# Export as YOLO format
```

---

## Recommended: Use LabelImg

It's the easiest and most reliable option. Takes about 30-60 minutes to label 28 images.

**Quick start:**
```bash
pip3 install labelImg
cd training
mkdir -p dataset/images dataset/labels
# Copy your screenshots to dataset/images/
labelImg dataset/images/ dataset/labels/
```

Then follow the steps above!
