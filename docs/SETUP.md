# Complete Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd screen-region-detector-client
npm install
```

### 2. Download Model

**Option A: Pre-converted ONNX (Recommended)**

```bash
# Create models directory
mkdir -p public/models

# Download YOLOv8n ONNX
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx \
  -o public/models/yolov8n.onnx
```

**Option B: Convert Yourself**

```bash
# Install Python dependencies
pip install ultralytics

# Convert model
cd scripts
python convert_model.py
```

### 3. Run Development Server

```bash
npm run dev
```

Open http://localhost:5173

### 4. Test

1. Click "Start Detection"
2. Select screen/window to share
3. See real-time detections!

## Detailed Setup

### System Requirements

**Minimum:**
- Node.js 18+
- 4GB RAM
- Modern browser (Chrome 90+)
- Internet connection (first load only)

**Recommended:**
- Node.js 20+
- 8GB RAM
- Chrome/Edge latest
- GPU for training (optional)

### Installation Steps

#### 1. Clone/Download Project

```bash
git clone <repository-url>
cd screen-region-detector-client
```

#### 2. Install Node Dependencies

```bash
npm install
```

This installs:
- Vite (build tool)
- TypeScript
- ONNX Runtime Web
- Tesseract.js (OCR)

#### 3. Setup Model

**Using Pre-trained COCO Model:**

```bash
# Download YOLOv8n (6MB, detects 80 common objects)
mkdir -p public/models
cd public/models
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx
cd ../..
```

**Using Custom Trained Model:**

See [TRAINING.md](TRAINING.md) for training your own model.

Once trained:
```bash
cd scripts
python convert_model.py \
  --model /path/to/your/model.pt \
  --output ../public/models/custom.onnx
```

Update `src/config.ts`:
```typescript
export const CONFIG = {
  MODEL_PATH: '/models/custom.onnx',
  // ...
};
```

#### 4. Configure Settings (Optional)

Edit `src/config.ts`:

```typescript
export const CONFIG = {
  // Detection FPS (5-15)
  DETECTION_FPS: 10,
  
  // Model input size (320, 640, 1280)
  INFERENCE_SIZE: 640,
  
  // Confidence threshold (0.1-0.9)
  CONFIDENCE_THRESHOLD: 0.5,
  
  // Enable WebGL acceleration
  USE_WEBGL: true,
  
  // Enable OCR
  ENABLE_OCR: false,
};
```

### Development

#### Start Dev Server

```bash
npm run dev
```

Features:
- Hot module replacement
- TypeScript type checking
- Source maps
- Fast refresh

#### Build for Production

```bash
npm run build
```

Output in `dist/` directory.

#### Preview Production Build

```bash
npm run preview
```

### Troubleshooting

#### Model Won't Load

**Error:** `Failed to load model`

**Solutions:**
1. Check model file exists:
   ```bash
   ls -lh public/models/yolov8n.onnx
   ```

2. Verify file size (should be ~6MB for yolov8n):
   ```bash
   du -h public/models/yolov8n.onnx
   ```

3. Check browser console for CORS errors

4. Try re-downloading:
   ```bash
   rm public/models/yolov8n.onnx
   wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx \
     -O public/models/yolov8n.onnx
   ```

#### Screen Capture Fails

**Error:** `Failed to capture screen`

**Solutions:**
1. Use HTTPS (required in production)
2. Grant browser permission
3. Try Chrome/Edge (best support)
4. Check browser console

#### Slow Performance

**Symptoms:** Low FPS, high latency

**Solutions:**
1. Reduce detection FPS:
   ```typescript
   DETECTION_FPS: 5
   ```

2. Use smaller model:
   ```bash
   # Use yolov8n instead of yolov8s/m
   ```

3. Reduce inference size:
   ```typescript
   INFERENCE_SIZE: 320
   ```

4. Disable OCR:
   ```typescript
   ENABLE_OCR: false
   ```

5. Close other tabs/applications

#### Out of Memory

**Error:** Browser crashes or freezes

**Solutions:**
1. Use smaller model (yolov8n)
2. Reduce inference size
3. Lower detection FPS
4. Close other tabs
5. Restart browser

#### TypeScript Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version
```

#### Build Fails

```bash
# Clear build cache
rm -rf dist node_modules/.vite

# Rebuild
npm run build
```

### Browser-Specific Issues

#### Chrome/Edge

Usually works best. If issues:
1. Update to latest version
2. Enable hardware acceleration
3. Check `chrome://flags` for WebAssembly

#### Firefox

May be slower. Optimizations:
1. Enable WebAssembly SIMD in `about:config`
2. Increase `dom.workers.maxPerDomain`
3. Use smaller model

#### Safari

Limited support. Known issues:
1. SharedArrayBuffer restrictions
2. WebGL limitations
3. getDisplayMedia quirks

Workarounds:
1. Use Chrome/Edge instead
2. Disable WebGL backend
3. Reduce inference size

### Environment Variables

Create `.env` file:

```bash
# Development
VITE_MODEL_PATH=/models/yolov8n.onnx
VITE_DEBUG=true

# Production
VITE_MODEL_PATH=https://cdn.example.com/models/yolov8n.onnx
VITE_DEBUG=false
```

Access in code:
```typescript
const modelPath = import.meta.env.VITE_MODEL_PATH;
```

### Testing

#### Manual Testing

1. Start dev server
2. Open browser DevTools
3. Click "Start Detection"
4. Check console for errors
5. Monitor Performance tab

#### Automated Testing (Future)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

### Performance Benchmarks

Expected performance on modern hardware:

| Model | Size | FPS | Latency | Accuracy |
|-------|------|-----|---------|----------|
| yolov8n | 6MB | 10-15 | 80-120ms | Good |
| yolov8s | 22MB | 5-10 | 150-250ms | Better |
| yolov8m | 52MB | 2-5 | 300-500ms | Best |

*Tested on: Chrome 120, M1 Mac, 1080p screen*

### Next Steps

1. ✅ Basic setup complete
2. 📖 Read [ARCHITECTURE.md](ARCHITECTURE.md) to understand system
3. 🎯 Read [TRAINING.md](TRAINING.md) to train custom model
4. 🚀 Read [DEPLOYMENT.md](DEPLOYMENT.md) to deploy

### Getting Help

**Common Issues:**
- Check browser console
- Review error messages
- Search GitHub issues

**Resources:**
- [ONNX Runtime Web Docs](https://onnxruntime.ai/docs/tutorials/web/)
- [Ultralytics YOLOv8 Docs](https://docs.ultralytics.com)
- [Vite Documentation](https://vitejs.dev)

**Still stuck?**
- Open GitHub issue
- Include browser version
- Include console errors
- Include steps to reproduce
