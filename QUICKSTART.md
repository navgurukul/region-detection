# Quick Start Guide

Get up and running in 5 minutes! **No backend setup required.**

## What You Need

- Node.js 18+ installed
- Modern browser (Chrome/Edge recommended)
- Internet connection (first time only, to download model)

**That's it!** No database, no API keys, no server configuration.

## Installation

```bash
# 1. Install dependencies (just build tools, no backend!)
npm install

# 2. Download AI model (6MB, one-time download)
mkdir -p public/models
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx \
  -o public/models/yolov8n.onnx

# 3. Start dev server (just serves static files)
npm run dev
```

**Note:** `npm run dev` starts a simple static file server. There's no backend application running!

## Usage

1. Open http://localhost:5173
2. Click **"Start Detection"**
3. Select screen/window to share
4. See real-time detections! 🎯

## Configuration

Edit `src/config.ts` to adjust:

```typescript
export const CONFIG = {
  DETECTION_FPS: 10,           // 5-15 FPS
  INFERENCE_SIZE: 640,         // 320, 640, or 1280
  CONFIDENCE_THRESHOLD: 0.5,   // 0.1-0.9
  USE_WEBGL: true,             // GPU acceleration
};
```

## Troubleshooting

### Model won't load
```bash
# Re-download model
rm public/models/yolov8n.onnx
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx \
  -o public/models/yolov8n.onnx
```

### Screen capture fails
- Use Chrome/Edge browser
- Grant permission when prompted
- Use HTTPS in production (localhost is OK for dev)

### Slow performance
- Reduce `DETECTION_FPS` to 5
- Use smaller `INFERENCE_SIZE` (320)
- Close other browser tabs

## Next Steps

- 📖 Read [docs/SETUP.md](docs/SETUP.md) for detailed setup
- 🎯 Read [docs/TRAINING.md](docs/TRAINING.md) to train custom model
- 🏗️ Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) to understand system
- 🚀 Read [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) to deploy

## Key Features

✅ 100% client-side (no backend needed)
✅ Real-time detection (5-15 FPS)
✅ Privacy-focused (no data uploaded)
✅ Offline-capable (after first load)
✅ Production-ready code

## Support

- Check [docs/BROWSER-LIMITATIONS.md](docs/BROWSER-LIMITATIONS.md) for browser issues
- Open GitHub issue for bugs
- Read documentation for detailed guides

Happy detecting! 🚀
