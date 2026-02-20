# 🎯 Screen Region Detector

<div align="center">

**100% Client-Side Screen Region Detection Library**

Real-time text region detection using Tesseract.js OCR - runs entirely in the browser

[![NPM Version](https://img.shields.io/npm/v/@navgurukul/screen-region-detector?style=flat-square)](https://www.npmjs.com/package/@navgurukul/screen-region-detector)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](./LICENSE)
[![No Backend](https://img.shields.io/badge/Backend-None-brightgreen?style=flat-square)]()

[Live Demo](https://navgurukul.github.io/region-detection/) | [Documentation](./docs/INDEX.md) | [GitHub](https://github.com/navgurukul/region-detection)

</div>

---

## 📦 Installation

```bash
npm install @navgurukul/screen-region-detector
```

## 🚀 Quick Start

```typescript
import { HybridDetector } from '@navgurukul/screen-region-detector';

// Initialize the detector (takes 10-20 seconds for Tesseract to load)
const detector = new HybridDetector();
await detector.initialize();

// Get screen capture
const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
const video = document.createElement('video');
video.srcObject = stream;
await video.play();

// Capture frame
const canvas = document.createElement('canvas');
canvas.width = video.videoWidth;
canvas.height = video.videoHeight;
const ctx = canvas.getContext('2d');
ctx.drawImage(video, 0, 0);
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Detect regions
const regions = await detector.detectRegions(imageData);

// Process results
regions.forEach(region => {
  console.log(`Found ${region.type} at (${region.x}, ${region.y})`);
  console.log(`Size: ${region.width}x${region.height}`);
  console.log(`Text: ${region.text}`);
  console.log(`Is code: ${region.isCode}`);
  console.log(`Confidence: ${region.confidence}`);
});

// Clean up
await detector.terminate();
```

## ✨ Features

- ✅ **100% client-side** - No backend server required
- ✅ **Privacy-focused** - All processing happens in browser
- ✅ **Tesseract.js OCR** - Automatic text region detection
- ✅ **Code detection** - Distinguishes code from regular text
- ✅ **Real-time processing** - Optimized for 10 FPS
- ✅ **TypeScript support** - Full type definitions included
- ✅ **Zero dependencies** - Only Tesseract.js and ONNX Runtime
- ✅ **Offline-capable** - Works without internet after first load

## 📖 API Reference

### HybridDetector

Main detector class combining Tesseract OCR with layout analysis.

```typescript
class HybridDetector {
  // Initialize Tesseract (takes 10-20 seconds)
  async initialize(): Promise<void>
  
  // Detect regions in an image
  async detectRegions(imageData: ImageData): Promise<HybridRegion[]>
  
  // Clean up resources
  async terminate(): Promise<void>
}
```

### HybridRegion

```typescript
interface HybridRegion {
  type: 'window' | 'text' | 'code' | 'ui';
  x: number;              // X coordinate
  y: number;              // Y coordinate
  width: number;          // Region width
  height: number;         // Region height
  confidence: number;     // Detection confidence (0-1)
  text?: string;          // Extracted text (if any)
  isCode?: boolean;       // True if region contains code
}
```

### ScreenCapture

Utility class for screen sharing.

```typescript
class ScreenCapture {
  constructor(videoElement: HTMLVideoElement)
  
  async start(): Promise<void>
  stop(): void
  getStreamDimensions(): { width: number; height: number }
}
```

### OverlayRenderer

Utility class for drawing detection boxes.

```typescript
class OverlayRenderer {
  constructor(canvas: HTMLCanvasElement, settings: Settings)
  
  drawDetections(detections: Detection[], video: HTMLVideoElement): void
  clear(): void
  updateSettings(settings: Settings): void
}
```

## 🎨 Complete Example

```typescript
import {
  HybridDetector,
  ScreenCapture,
  OverlayRenderer,
  type HybridRegion
} from '@navgurukul/screen-region-detector';

// Setup
const video = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const detector = new HybridDetector();
const screenCapture = new ScreenCapture(video);
const overlay = new OverlayRenderer(canvas, {
  showLabels: true,
  showConfidence: true,
  enableOCR: true,
  confidenceThreshold: 0.5
});

// Initialize
await detector.initialize();
await screenCapture.start();

// Detection loop
setInterval(async () => {
  // Get frame
  const { width, height } = screenCapture.getStreamDimensions();
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const ctx = tempCanvas.getContext('2d')!;
  ctx.drawImage(video, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);
  
  // Detect
  const regions = await detector.detectRegions(imageData);
  
  // Draw
  const detections = regions.map(r => ({
    label: r.type + (r.isCode ? ' (code)' : ''),
    confidence: r.confidence,
    x: r.x,
    y: r.y,
    width: r.width,
    height: r.height,
    text: r.text,
    isCode: r.isCode
  }));
  
  overlay.drawDetections(detections, video);
}, 3000); // Every 3 seconds
```

## ⚙️ Configuration

```typescript
import { CONFIG } from '@navgurukul/screen-region-detector';

// Adjust detection settings
CONFIG.DETECTION_FPS = 10;           // Frames per second
CONFIG.MIN_REGION_SIZE = 150;        // Minimum region size (pixels)
CONFIG.EDGE_THRESHOLD = 50;          // Edge detection sensitivity
CONFIG.MERGE_THRESHOLD = 0.3;        // Region merging threshold
```

## 🎯 Use Cases

- **Screen recording analysis** - Detect UI regions in recordings
- **Accessibility tools** - Identify text regions for screen readers
- **Code detection** - Find code snippets in screenshots
- **Layout analysis** - Understand screen composition
- **Privacy tools** - Detect sensitive regions before sharing
- **Testing automation** - Verify UI layout in tests

## 🔒 Privacy & Security

- ✅ All processing happens in browser (no server)
- ✅ No data uploaded or stored anywhere
- ✅ No external API calls during detection
- ✅ Tesseract runs locally via WebAssembly
- ✅ Works completely offline after first load
- ✅ No telemetry or tracking

## 📊 Performance

- **Initialization:** 10-20 seconds (one-time, loads Tesseract)
- **Detection:** ~300-500ms per frame (1280x720)
- **Accuracy:** ~50% (text region detection)
- **Memory:** ~100-200MB (Tesseract + ONNX Runtime)
- **FPS:** 10 FPS recommended (adjustable)

## 🎓 Advanced: Train Custom Model

For 80-90% accuracy, train a custom YOLOv8 model:

```bash
# 1. Collect screenshots
cd node_modules/@navgurukul/screen-region-detector/training
bash take_screenshots.sh

# 2. Label on Roboflow.com (free)
# 3. Train model
pip install -r requirements.txt
python train_model.py

# 4. Convert to browser format
python convert_to_onnx.py
```

See [training/TRAINING_GUIDE.md](./training/TRAINING_GUIDE.md) for details.

## 🌐 Browser Support

- Chrome 90+ ✅
- Edge 90+ ✅
- Firefox 88+ ✅
- Safari 15.4+ ⚠️ (limited)

**Requirements:**
- HTTPS (required for screen sharing)
- WebAssembly support
- 4GB+ RAM recommended

## 🐛 Troubleshooting

### Tesseract not initializing
```typescript
// Wait for initialization
await detector.initialize();
console.log('Tesseract ready!');
```

### No regions detected
```typescript
// Check if image has text
const regions = await detector.detectRegions(imageData);
console.log(`Found ${regions.length} regions`);
```

### Slow performance
```typescript
// Reduce image size before detection
const scale = 0.5;
const smallCanvas = document.createElement('canvas');
smallCanvas.width = canvas.width * scale;
smallCanvas.height = canvas.height * scale;
const smallCtx = smallCanvas.getContext('2d')!;
smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
const imageData = smallCtx.getImageData(0, 0, smallCanvas.width, smallCanvas.height);
```

## 📚 Documentation

- [API Documentation](./docs/API-USAGE.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Training Guide](./training/TRAINING_GUIDE.md)
- [Deployment](./docs/DEPLOYMENT.md)
- [FAQ](./docs/FAQ.md)

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

```bash
git clone https://github.com/navgurukul/region-detection.git
cd region-detection/screen-region-detector-client
npm install
npm run dev
```

## 📝 License

MIT License - see [LICENSE](./LICENSE) file

## 🙏 Credits

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [ONNX Runtime Web](https://onnxruntime.ai/) - Browser inference
- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) - Object detection

## 🔗 Links

- **NPM:** https://www.npmjs.com/package/@navgurukul/screen-region-detector
- **GitHub:** https://github.com/navgurukul/region-detection
- **Live Demo:** https://navgurukul.github.io/region-detection/
- **Issues:** https://github.com/navgurukul/region-detection/issues

---

<div align="center">

Made with ❤️ by [NavGurukul](https://github.com/navgurukul)

**Star ⭐ this repo if you find it useful!**

</div>


# Deployment trigger
