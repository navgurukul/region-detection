# 🎯 Screen Region Detector

<div align="center">

### 🌐 100% CLIENT-SIDE | 🔒 NO BACKEND | 🚀 NO UPLOADS

**Real-time text region detection during screen sharing using Tesseract.js OCR**

Everything runs in your browser. Zero server infrastructure. Complete privacy.

[![Client-Side](https://img.shields.io/badge/Architecture-Client--Side%20Only-brightgreen?style=for-the-badge)]()
[![No Backend](https://img.shields.io/badge/Backend-None-blue?style=for-the-badge)]()
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-orange?style=for-the-badge)]()

[Live Demo](https://navgurukul.github.io/region-detection/) | [Documentation](./docs/INDEX.md) | [Training Guide](./training/TRAINING_GUIDE.md)

</div>

---

## 🎉 What Makes This Special

This is **NOT** a typical screen detection system. There is:
- ❌ **NO backend server**
- ❌ **NO API endpoints**
- ❌ **NO frame uploads**
- ❌ **NO cloud processing**
- ❌ **NO database**
- ❌ **NO server costs**

Instead:
- ✅ **Everything runs in your browser**
- ✅ **OCR inference happens locally**
- ✅ **Your screen data never leaves your device**
- ✅ **Works offline after first load**
- ✅ **Deploy as static files anywhere**
- ✅ **Infinite scalability (no servers!)**

## ✨ Features

- ✅ **100% client-side processing** (no server required)
- ✅ **Real-time detection** at 10 FPS
- ✅ **Tesseract.js OCR** - automatic text region detection
- ✅ **Code detection** - identifies code vs regular text
- ✅ **Color-coded regions:**
  - 🔵 Blue boxes for text regions
  - 🟢 Green boxes for code regions
- ✅ **Toggle visibility** - show/hide detection bounds
- ✅ **Privacy-focused** - no data leaves browser
- ✅ **Offline-capable** after first load
- ✅ **Current accuracy: ~50%** (text region detection)
- ✅ **Upgradeable to 80-90%** (with custom YOLOv8 training)

## 🚀 Quick Start

### For Users (Demo)

```bash
# 1. Clone the repository
git clone https://github.com/navgurukul/region-detection.git
cd region-detection/screen-region-detector-client

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open http://localhost:5173 and click "Start Detection"

**That's it!** No backend to configure, no database to setup, no API keys needed.

### For Developers (Integration)

```bash
# Install as npm package (coming soon)
npm install @navgurukul/screen-region-detector
```

```typescript
import { HybridDetector } from '@navgurukul/screen-region-detector';

// Initialize detector
const detector = new HybridDetector();
await detector.initialize();

// Detect regions in an image
const imageData = canvas.getContext('2d').getImageData(0, 0, width, height);
const regions = await detector.detectRegions(imageData);

// Process results
regions.forEach(region => {
  console.log(`Found ${region.type} at (${region.x}, ${region.y})`);
  console.log(`Text: ${region.text}`);
  console.log(`Is code: ${region.isCode}`);
});
```

## 📦 Installation Options

### Option 1: Use the Demo App
Visit the [live demo](https://navgurukul.github.io/region-detection/) - no installation needed!

### Option 2: Clone and Run Locally
```bash
git clone https://github.com/navgurukul/region-detection.git
cd region-detection/screen-region-detector-client
npm install
npm run dev
```

### Option 3: Integrate into Your Project
```bash
npm install @navgurukul/screen-region-detector
```

## 🎓 Training Your Own Model (Optional - For 80-90% Accuracy)

The system works out of the box with ~50% accuracy using Tesseract OCR. For better accuracy, train a custom YOLOv8 model:

```bash
# 1. Collect screenshots of your workspace
cd training
bash take_screenshots.sh

# 2. Label on Roboflow.com (free)
#    - Upload screenshots
#    - Draw boxes around regions
#    - Export as YOLOv8 format

# 3. Train the model
pip install -r requirements.txt
python train_model.py

# 4. Convert to browser format
python convert_to_onnx.py

# 5. Done! Model is now in public/models/
```

**See detailed guides:**
- [training/TRAINING_GUIDE.md](training/TRAINING_GUIDE.md) - Complete step-by-step
- [training/SCREENSHOT-EXAMPLES.md](training/SCREENSHOT-EXAMPLES.md) - What screenshots to take
- [CLIENT-SIDE-SOLUTION.md](CLIENT-SIDE-SOLUTION.md) - How it stays client-side

**Training time:** 2-3 hours total (mostly screenshot collection)
**Result:** 80-90%+ accurate detection vs 50% with OCR only

## 🏗️ Architecture (Pure Client-Side)

```
┌─────────────────────────────────────────────────────────┐
│              YOUR BROWSER (Everything Here!)            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Screen Capture ──► Video Element ──► Canvas            │
│                                          │               │
│                                          ▼               │
│                                   Tesseract.js           │
│                                          │               │
│                                          ▼               │
│                                    Text Regions          │
│                                          │               │
│                                          ▼               │
│                                   Code Detection         │
│                                          │               │
│                                          ▼               │
│                                   Overlay Canvas         │
│                                                          │
└─────────────────────────────────────────────────────────┘

         NO NETWORK REQUESTS DURING DETECTION ✓
         NO SERVER COMMUNICATION ✓
         NO DATA LEAVES YOUR DEVICE ✓
```

## 📖 API Documentation

### HybridDetector

Main detector class combining Tesseract OCR with edge detection.

```typescript
class HybridDetector {
  // Initialize Tesseract (takes 10-20 seconds)
  async initialize(): Promise<void>
  
  // Detect regions in an image
  async detectRegions(imageData: ImageData): Promise<HybridRegion[]>
  
  // Clean up resources
  async terminate(): Promise<void>
}

interface HybridRegion {
  type: 'window' | 'text' | 'code' | 'ui';
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  text?: string;
  isCode?: boolean;
}
```

### ScreenCapture

Handles screen sharing via WebRTC.

```typescript
class ScreenCapture {
  async start(): Promise<void>
  stop(): void
  getStreamDimensions(): { width: number; height: number }
}
```

### OverlayRenderer

Draws detection boxes on canvas.

```typescript
class OverlayRenderer {
  drawDetections(detections: Detection[], video: HTMLVideoElement): void
  clear(): void
  updateSettings(settings: Settings): void
}
```

## 🔒 Security & Privacy

- ✅ All processing happens in browser
- ✅ No frames uploaded anywhere
- ✅ No external API calls for inference
- ✅ Tesseract runs locally in WebAssembly
- ✅ No telemetry or tracking
- ✅ Works completely offline

## 💡 Why Client-Side Matters

**For Users:**
- Your screen data is 100% private
- No risk of data breaches on servers
- Works without internet connection
- No subscription or API costs

**For Developers:**
- Zero server costs (no backend!)
- Infinite scalability (each user runs their own inference)
- No infrastructure to maintain
- Deploy anywhere static files are served
- No API rate limits or quotas

**For Companies:**
- No data compliance issues (GDPR, HIPAA, etc.)
- No server infrastructure costs
- No data storage requirements
- Reduced liability

## 🚢 Deployment (Static Files Only!)

Since there's no backend, deployment is trivial:

### Option 1: GitHub Pages (Free)
```bash
npm run build
npx gh-pages -d dist
```

### Option 2: Netlify (Drag & Drop)
```bash
npm run build
# Drag dist/ folder to netlify.com/drop
```

### Option 3: Vercel
```bash
npm run build
npx vercel --prod
```

### Option 4: Any Static Host
```bash
npm run build
# Upload dist/ to:
# - AWS S3
# - Cloudflare Pages
# - Firebase Hosting
# - Your own web server
```

**No server configuration needed!** Just serve the static files with HTTPS.

## 🌐 Browser Requirements

- Chrome 90+ or Edge 90+ (recommended)
- Firefox 88+ (may have performance differences)
- Safari 15.4+ (limited support)
- HTTPS required (except localhost)
- Minimum 4GB RAM recommended

## ⚙️ Configuration

```typescript
// src/config.ts
export const CONFIG = {
  DETECTION_FPS: 10,           // Frames per second (5-15)
  MIN_REGION_SIZE: 150,        // Minimum region size in pixels
  EDGE_THRESHOLD: 50,          // Edge detection sensitivity
  MERGE_THRESHOLD: 0.3,        // Region merging threshold
};
```

## 🐛 Troubleshooting

**Tesseract not initializing:**
- Wait 10-20 seconds for first load
- Check browser console for errors
- Ensure HTTPS (required for screen sharing)

**No regions detected:**
- Make sure there's text on screen
- Check "Show Bounds" checkbox is enabled
- Wait 3 seconds for first Tesseract scan

**Slow performance:**
- Reduce `DETECTION_FPS` in config
- Close other browser tabs
- Check if WebAssembly is enabled

**Screen capture fails:**
- Must use HTTPS in production
- Check browser permissions
- Try Chrome/Edge (best support)

## 📚 Documentation

- [docs/INDEX.md](docs/INDEX.md) - Documentation index
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - System architecture
- [docs/API-USAGE.md](docs/API-USAGE.md) - API reference
- [docs/TRAINING.md](docs/TRAINING.md) - Model training guide
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) - Deployment options
- [docs/FAQ.md](docs/FAQ.md) - Frequently asked questions

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

```bash
# Fork the repo
git clone https://github.com/YOUR_USERNAME/region-detection.git
cd region-detection/screen-region-detector-client

# Create a branch
git checkout -b feature/your-feature

# Make changes and test
npm run dev

# Commit and push
git commit -m "Add your feature"
git push origin feature/your-feature

# Open a Pull Request
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine
- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics) - Object detection
- [ONNX Runtime Web](https://onnxruntime.ai/) - Browser inference

## 📊 Project Status

- ✅ Core functionality complete
- ✅ Tesseract OCR integration working
- ✅ Code detection implemented
- ✅ Training infrastructure ready
- 🚧 NPM package (coming soon)
- 🚧 React/Vue components (planned)
- 🚧 Advanced layout analysis (planned)

## 🔗 Links

- **Live Demo:** https://navgurukul.github.io/region-detection/
- **GitHub:** https://github.com/navgurukul/region-detection
- **Issues:** https://github.com/navgurukul/region-detection/issues
- **NPM:** (coming soon)

---

<div align="center">

Made with ❤️ by [NavGurukul](https://github.com/navgurukul)

**Star ⭐ this repo if you find it useful!**

</div>


