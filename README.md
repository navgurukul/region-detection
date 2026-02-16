# 🎯 Screen Region Detector

<div align="center">

### 🌐 100% CLIENT-SIDE | 🔒 NO BACKEND | 🚀 NO UPLOADS

**Real-time AI detection of applications and UI regions during screen sharing**

Everything runs in your browser. Zero server infrastructure. Complete privacy.

[![Client-Side](https://img.shields.io/badge/Architecture-Client--Side%20Only-brightgreen?style=for-the-badge)]()
[![No Backend](https://img.shields.io/badge/Backend-None-blue?style=for-the-badge)]()
[![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local-orange?style=for-the-badge)]()

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
- ✅ **AI inference happens locally**
- ✅ **Your screen data never leaves your device**
- ✅ **Works offline after first load**
- ✅ **Deploy as static files anywhere**
- ✅ **Infinite scalability (no servers!)**

## Features

- ✅ **100% client-side processing** (no server required)
- ✅ **Real-time detection** at 5-15 FPS
- ✅ **Multiple detection modes:**
  - Layout detection (edge-based, grid-based, smart algorithms)
  - Custom AI model (train your own YOLOv8)
- ✅ **OCR text extraction** with Tesseract.js
- ✅ **Code detection** - automatically identifies code regions
- ✅ **Color-coded regions:**
  - 🔵 Blue boxes for text regions
  - 🟢 Green boxes for code regions
- ✅ **Toggle visibility** - show/hide detection bounds
- ✅ **Web Worker** for non-blocking inference
- ✅ **Privacy-focused** - no data leaves browser
- ✅ **Offline-capable** after first load

## 🚀 Quick Start (No Server Setup!)

```bash
# 1. Install dependencies
npm install

# 2. Start development (just a static file server)
npm run dev
```

Open http://localhost:5173 and click "Start Detection"

**That's it!** No backend to configure, no database to setup, no API keys needed.

### Current Detection Mode

The system currently uses **layout detection** (edge-based algorithms) which works out of the box but has limited accuracy (~30-40%). For accurate detection (80-90%+), see the training section below.

## 🎓 Training Your Own Model (Recommended for Accuracy)

For accurate detection (80-90%+), train a custom model on your specific applications:

### Quick Training Guide

```bash
# 1. Collect screenshots of your workspace
cd training
bash take_screenshots.sh

# 2. Take 200-500 screenshots showing:
#    - VS Code, Chrome, Terminal, etc.
#    - Different window sizes and positions
#    - Multiple windows at once
#    - Your actual working scenarios

# 3. Upload to Roboflow.com (free)
#    - Label each window/region
#    - Export as YOLOv8 format

# 4. Train the model
pip install -r requirements.txt
python train_model.py

# 5. Convert to browser format
python convert_to_onnx.py

# 6. Done! Model is now in public/models/
```

**See detailed guides:**
- [training/TRAINING_GUIDE.md](training/TRAINING_GUIDE.md) - Complete step-by-step
- [training/SCREENSHOT-EXAMPLES.md](training/SCREENSHOT-EXAMPLES.md) - What screenshots to take
- [CLIENT-SIDE-SOLUTION.md](CLIENT-SIDE-SOLUTION.md) - How it stays client-side

**Training time:** 2-3 hours total (mostly screenshot collection)
**Result:** 80-90%+ accurate detection vs 30-40% with edge detection

## Browser Requirements

- Chrome 90+ or Edge 90+ (recommended)
- Firefox 88+ (may have performance differences)
- Safari 15.4+ (limited support)
- HTTPS required (except localhost)
- Minimum 4GB RAM recommended

## Performance Tuning

**Frame Rate:**
```typescript
// src/config.ts
export const DETECTION_FPS = 10; // Adjust 5-15
```

**Model Size:**
- yolov8n.onnx: ~6MB, fastest
- yolov8s.onnx: ~22MB, more accurate
- yolov8m.onnx: ~52MB, best accuracy (slower)

**Inference Resolution:**
```typescript
export const INFERENCE_SIZE = 640; // Lower = faster
```

## 🏗️ Architecture (Pure Client-Side)

```
┌─────────────────────────────────────────────────────────┐
│              YOUR BROWSER (Everything Here!)            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Screen Capture ──► Video Element ──► Canvas            │
│                                          │               │
│                                          ▼               │
│                                    Web Worker           │
│                                          │               │
│                                          ▼               │
│                                   ONNX Runtime           │
│                                          │               │
│                                          ▼               │
│                                    YOLOv8 Model          │
│                                          │               │
│                                          ▼               │
│                                    Detections            │
│                                          │               │
│                                          ▼               │
│                                   Overlay Canvas         │
│                                                          │
└─────────────────────────────────────────────────────────┘

         NO NETWORK REQUESTS DURING DETECTION ✓
         NO SERVER COMMUNICATION ✓
         NO DATA LEAVES YOUR DEVICE ✓
```

## 🔒 Security & Privacy

- ✅ All processing happens in browser
- ✅ No frames uploaded anywhere
- ✅ No external API calls for inference
- ✅ Model cached in IndexedDB
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

### Option 1: Netlify (Drag & Drop)
```bash
npm run build
# Drag dist/ folder to netlify.com/drop
```

### Option 2: Vercel
```bash
npm run build
npx vercel --prod
```

### Option 3: GitHub Pages
```bash
npm run build
npx gh-pages -d dist
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

## Browser Limitations

- **HTTPS Required:** Screen sharing requires secure context (except localhost)
- **User Permission:** Must grant screen sharing permission each session
- **Memory:** Large models may cause issues on low-end devices
- **Mobile:** Limited support on mobile browsers
- **Cross-Origin:** Model files must be same-origin or CORS-enabled

## Troubleshooting

**Model won't load:**
- Check browser console for CORS errors
- Ensure model file is in `public/models/`
- Verify ONNX format compatibility

**Slow inference:**
- Reduce `INFERENCE_SIZE` in config
- Use smaller model (yolov8n)
- Lower `DETECTION_FPS`
- Check if WebAssembly is enabled

**Screen capture fails:**
- Must use HTTPS in production
- Check browser permissions
- Try Chrome/Edge (best support)

## License

MIT
