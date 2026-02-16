# Frequently Asked Questions

## General Questions

### What is this project?

A fully client-side screen region detection system that uses AI (YOLOv8) to detect applications and UI elements in real-time during screen sharing. Everything runs in your browser - no backend, no uploads, completely private.

### Why client-side only?

**Privacy:** Your screen data never leaves your browser
**Cost:** No server infrastructure needed
**Latency:** No network round-trips
**Offline:** Works without internet (after first load)

### What can it detect?

By default, it detects 80 common objects (COCO dataset). With custom training, you can detect:
- Specific applications (VS Code, ChatGPT, etc.)
- UI elements (buttons, windows, etc.)
- Phone screens
- Any visual pattern you train it on

## Technical Questions

### How does it work?

1. Captures screen using WebRTC
2. Extracts frames to canvas
3. Sends frames to Web Worker
4. Runs YOLOv8 inference via ONNX Runtime
5. Returns detections to main thread
6. Draws bounding boxes on overlay

See [ARCHITECTURE.md](ARCHITECTURE.md) for details.

### What browsers are supported?

**Best:** Chrome 90+, Edge 90+
**Good:** Firefox 88+
**Limited:** Safari 15.4+
**Not supported:** IE, older browsers, most mobile

See [BROWSER-LIMITATIONS.md](BROWSER-LIMITATIONS.md) for details.

### Why is HTTPS required?

The `getDisplayMedia()` API requires a secure context for privacy/security. Localhost is exempt for development.

### Can I use this on mobile?

Limited support. Screen sharing is restricted on iOS (iPad only, iOS 15.4+) and Android (10+). Performance may be poor.

### What's the performance like?

**Typical:** 10-15 FPS, 80-120ms latency
**Depends on:**
- Model size (yolov8n vs yolov8m)
- Device hardware
- Browser
- Screen resolution

See [PROJECT-SUMMARY.md](PROJECT-SUMMARY.md#performance-metrics) for benchmarks.

## Setup Questions

### How do I install it?

```bash
npm install
mkdir -p public/models
curl -L <model-url> -o public/models/yolov8n.onnx
npm run dev
```

See [QUICKSTART.md](../QUICKSTART.md) for details.

### Where do I get the model file?

**Option 1:** Download pre-converted ONNX
```bash
curl -L https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8n.onnx \
  -o public/models/yolov8n.onnx
```

**Option 2:** Convert yourself
```bash
pip install ultralytics
python scripts/convert_model.py
```

### Why won't the model load?

**Common causes:**
1. File not in `public/models/`
2. Wrong file path in config
3. CORS issues (if hosted separately)
4. File corrupted during download

**Solutions:**
```bash
# Check file exists
ls -lh public/models/yolov8n.onnx

# Re-download
rm public/models/yolov8n.onnx
curl -L <url> -o public/models/yolov8n.onnx

# Check browser console for errors
```

### Why does screen capture fail?

**Common causes:**
1. Not using HTTPS (except localhost)
2. User denied permission
3. Browser doesn't support API
4. Privacy settings blocking

**Solutions:**
- Use Chrome/Edge
- Grant permission when prompted
- Use HTTPS in production
- Check browser console

## Performance Questions

### Why is it slow?

**Possible causes:**
1. Large model (yolov8m vs yolov8n)
2. High resolution screen
3. Too many FPS
4. Weak hardware
5. Other tabs consuming resources

**Solutions:**
```typescript
// Reduce FPS
DETECTION_FPS: 5

// Use smaller model
MODEL_PATH: '/models/yolov8n.onnx'

// Reduce inference size
INFERENCE_SIZE: 320

// Close other tabs
```

### How can I improve performance?

1. **Use smaller model:** yolov8n (6MB) instead of yolov8m (52MB)
2. **Lower FPS:** 5 instead of 15
3. **Reduce resolution:** 320 instead of 640
4. **Enable WebGL:** `USE_WEBGL: true`
5. **Close other tabs**
6. **Use Chrome/Edge** (better WebAssembly)

### Why is memory usage high?

**Normal:** 300-700MB depending on model
**High:** >1GB indicates possible leak

**Causes:**
- Large model loaded
- High-resolution stream
- Detections accumulating
- Memory leak

**Solutions:**
- Use smaller model
- Restart browser
- Check for leaks in DevTools

### Can I use GPU acceleration?

**WebGL:** Yes, enabled by default
```typescript
USE_WEBGL: true
```

**WebGPU:** Not yet (experimental)

**Native GPU:** No (browser limitation)

## Training Questions

### How do I train a custom model?

See [TRAINING.md](TRAINING.md) for complete guide.

**Quick steps:**
1. Collect 100-500 images per class
2. Label with LabelImg or Roboflow
3. Train with Ultralytics
4. Convert to ONNX
5. Deploy to browser

### What tools do I need for labeling?

**Desktop:** LabelImg (free, open-source)
**Web:** Roboflow (free tier available)
**Alternative:** CVAT, Label Studio

### How much data do I need?

**Minimum:** 50 images per class
**Recommended:** 200+ images per class
**Best:** 500+ images per class

More data = better accuracy

### How long does training take?

**Depends on:**
- Dataset size
- Model size
- Hardware (GPU vs CPU)
- Number of epochs

**Typical:**
- 100 images, yolov8n, GPU: 10-30 minutes
- 500 images, yolov8s, GPU: 1-2 hours
- 1000 images, yolov8m, GPU: 3-5 hours

### Can I use pre-trained models?

Yes! Start with COCO-pretrained YOLOv8, then fine-tune on your data. Much faster than training from scratch.

## Deployment Questions

### How do I deploy to production?

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete guide.

**Quick options:**
- Netlify: `netlify deploy --prod --dir=dist`
- Vercel: `vercel --prod`
- GitHub Pages: `npx gh-pages -d dist`

### Do I need a server?

No! It's fully static. Just host the files anywhere that serves HTTPS.

### What about CORS?

If model is same-origin: no issues
If model on CDN: need CORS headers

```nginx
Access-Control-Allow-Origin: *
Cross-Origin-Resource-Policy: cross-origin
```

### Can I use a CDN for the model?

Yes, but ensure CORS headers are set. Better to host same-origin for simplicity.

### What about scaling?

No backend = infinite scale! Each user runs inference locally. Your only cost is bandwidth for initial download.

## Privacy & Security Questions

### Is my screen data uploaded?

**No.** All processing happens in your browser. No frames are sent to any server.

### Can I verify this?

Yes! Check browser DevTools Network tab - you'll see no requests during detection (except initial model download).

### Is it safe to use?

Yes, as safe as any client-side JavaScript. The code is open-source and auditable.

### What data is stored?

**By default:** Nothing
**Optional:** Model cached in browser for faster reload

### Can I use this for sensitive data?

Yes, since everything is local. But consider:
- Enable sensitive region blurring
- Don't store frames
- Use in private browsing mode

### What about GDPR/privacy laws?

Since no data leaves the browser, most privacy concerns don't apply. But always inform users about screen capture.

## Customization Questions

### Can I change the detection threshold?

Yes:
```typescript
// In config.ts
CONFIDENCE_THRESHOLD: 0.5  // 0.1-0.9

// Or at runtime
const result = await detector.detect(imageData, 0.7);
```

### Can I change the overlay style?

Yes, edit `overlay.ts`:
```typescript
BOX_COLOR: '#00ff88'
BOX_THICKNESS: 2
FONT_SIZE: 14
```

Or extend the `OverlayRenderer` class.

### Can I add OCR?

Yes, enable in config:
```typescript
ENABLE_OCR: true
```

Uses Tesseract.js for text extraction.

### Can I detect multiple models?

Not currently, but you can:
1. Load multiple workers
2. Run different models
3. Combine results

See [API-USAGE.md](API-USAGE.md) for examples.

### Can I export detection results?

Yes:
```typescript
// Save to JSON
const data = JSON.stringify(detections);
const blob = new Blob([data], { type: 'application/json' });
// Download or save
```

## Troubleshooting Questions

### Model loads but no detections?

**Possible causes:**
1. Confidence threshold too high
2. Model not trained for your objects
3. Poor image quality
4. Wrong model format

**Solutions:**
- Lower threshold: `CONFIDENCE_THRESHOLD: 0.3`
- Check model is correct
- Verify model output format

### Detections are inaccurate?

**Causes:**
1. Using default COCO model for custom objects
2. Low confidence threshold
3. Poor training data
4. Model too small

**Solutions:**
- Train custom model
- Adjust threshold
- Use larger model (yolov8s/m)

### Browser crashes or freezes?

**Causes:**
1. Out of memory
2. Model too large
3. Too high FPS
4. Memory leak

**Solutions:**
- Use smaller model
- Reduce FPS
- Close other tabs
- Restart browser

### "SharedArrayBuffer is not defined"?

**Cause:** Missing COOP/COEP headers

**Solution:** Add to server config:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### TypeScript errors during build?

```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript version
npx tsc --version  # Should be 5.x
```

## Comparison Questions

### vs TensorFlow.js?

**ONNX Runtime Web:**
- ✅ Faster for YOLO models
- ✅ Smaller bundle size
- ✅ Better WebAssembly optimization

**TensorFlow.js:**
- ✅ More models available
- ✅ Better documentation
- ✅ Larger community

We chose ONNX for performance.

### vs Server-side detection?

**Client-side (this project):**
- ✅ Privacy (no uploads)
- ✅ No server costs
- ✅ Infinite scale
- ❌ Slower inference
- ❌ Browser limitations

**Server-side:**
- ✅ Faster inference
- ✅ More powerful hardware
- ❌ Privacy concerns
- ❌ Server costs
- ❌ Network latency

### vs Native apps?

**Browser:**
- ✅ Cross-platform
- ✅ No installation
- ✅ Easy updates
- ❌ Slower
- ❌ Limited APIs

**Native:**
- ✅ Faster
- ✅ More APIs
- ❌ Platform-specific
- ❌ Installation required

## Future Questions

### Will you add WebGPU support?

Yes, when WebGPU becomes stable. Expected 10-100x speedup.

### Will you support mobile better?

Depends on browser vendors improving mobile screen sharing APIs.

### Will you add more models?

Yes, planning:
- Text detection
- Face detection
- Pose estimation
- Custom model marketplace

### Can I contribute?

Yes! See main README for contribution guidelines.

## Getting Help

### Where can I get help?

1. **Read docs:** Most questions answered here
2. **Check issues:** Search GitHub issues
3. **Open issue:** Create new issue with details
4. **Discussions:** Join GitHub discussions

### What info should I include in bug reports?

- Browser version
- Operating system
- Console errors
- Steps to reproduce
- Expected vs actual behavior

### How do I request features?

Open a GitHub issue with:
- Use case description
- Why it's needed
- Proposed solution (optional)

---

**Still have questions?** Open a GitHub issue or discussion!
