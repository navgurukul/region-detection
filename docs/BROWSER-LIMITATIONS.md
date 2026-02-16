# Browser Limitations & Best Practices

## Critical Browser Requirements

### HTTPS Requirement

**Limitation:** `getDisplayMedia()` requires secure context

**Impact:**
- ❌ Won't work on `http://` in production
- ✅ Works on `http://localhost` for development
- ✅ Works on `https://` domains

**Solution:**
```bash
# Development: use localhost
npm run dev  # http://localhost:5173 ✅

# Production: must use HTTPS
# Use Netlify, Vercel, or configure SSL
```

### User Permission

**Limitation:** User must grant permission each session

**Impact:**
- Cannot auto-start on page load
- Permission prompt every time
- User can deny access

**Best Practice:**
```typescript
try {
  await screenCapture.start();
} catch (error) {
  // User denied or error occurred
  showFriendlyMessage('Please grant screen sharing permission');
}
```

### Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| getDisplayMedia | 72+ ✅ | 66+ ✅ | 13+ ⚠️ | 79+ ✅ |
| Web Workers | ✅ | ✅ | ✅ | ✅ |
| WebAssembly | 57+ ✅ | 52+ ✅ | 11+ ✅ | 16+ ✅ |
| WebGL | ✅ | ✅ | ⚠️ | ✅ |
| SharedArrayBuffer | 92+ ✅ | 79+ ✅ | 15.2+ ⚠️ | 92+ ✅ |

✅ Full support | ⚠️ Partial/quirky | ❌ Not supported

## Performance Limitations

### Memory Constraints

**Limitation:** Browser memory limits (typically 2-4GB)

**Impact:**
- Large models may fail to load
- High-resolution streams consume memory
- Multiple tabs compete for resources

**Mitigation:**
```typescript
// Use smallest viable model
MODEL_PATH: '/models/yolov8n.onnx'  // 6MB

// Reduce inference size
INFERENCE_SIZE: 640  // or 320 for low-end devices

// Limit detections
MAX_DETECTIONS: 50
```

### CPU/GPU Limitations

**Limitation:** JavaScript inference is slower than native

**Impact:**
- 5-10x slower than Python/C++
- CPU-bound on most devices
- Battery drain on laptops

**Mitigation:**
```typescript
// Lower FPS
DETECTION_FPS: 5  // instead of 15

// Use WebGL when available
USE_WEBGL: true

// Consider WASM SIMD
ort.env.wasm.simd = true
```

### Network Limitations

**Limitation:** Model must be downloaded first

**Impact:**
- 6-50MB initial download
- Slow on poor connections
- Blocks app startup

**Mitigation:**
```typescript
// Show loading indicator
showLoadingSpinner();

// Cache in IndexedDB (future enhancement)
await cacheModel(modelPath);

// Lazy load OCR
if (settings.enableOCR) {
  const tesseract = await import('tesseract.js');
}
```

## API Limitations

### getDisplayMedia Constraints

**Limitation:** Limited control over capture

**Issues:**
1. Cannot force specific monitor
2. Cannot capture without permission
3. Cannot capture system audio (in most browsers)
4. User can stop sharing anytime

**Workarounds:**
```typescript
// Detect when user stops sharing
stream.getVideoTracks()[0].addEventListener('ended', () => {
  handleStreamEnd();
});

// Request specific constraints (hint only)
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    displaySurface: 'monitor',  // Hint, not enforced
    cursor: 'always',
  }
});
```

### Canvas Limitations

**Limitation:** Canvas size limits

**Browser Limits:**
- Chrome: 32,767 x 32,767 pixels
- Firefox: 32,767 x 32,767 pixels
- Safari: 4,096 x 4,096 pixels (older versions)

**Impact:**
- 4K/5K displays may exceed limits
- Large canvases consume memory

**Mitigation:**
```typescript
// Resize before processing
const MAX_DIMENSION = 1920;
if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
  const scale = MAX_DIMENSION / Math.max(width, height);
  canvas.width = width * scale;
  canvas.height = height * scale;
}
```

### Web Worker Limitations

**Limitation:** No DOM access in workers

**Impact:**
- Cannot directly manipulate canvas
- Cannot access video element
- Must pass data via messages

**Pattern:**
```typescript
// Main thread: extract frame
const imageData = ctx.getImageData(0, 0, width, height);

// Send to worker
worker.postMessage({ type: 'detect', data: imageData });

// Worker: process and return
postMessage({ type: 'result', data: detections });
```

## Security Limitations

### Same-Origin Policy

**Limitation:** Model must be same-origin or CORS-enabled

**Impact:**
- Cannot load from arbitrary URLs
- CDN must have CORS headers
- File:// protocol won't work

**Solution:**
```nginx
# Server must send CORS headers
Access-Control-Allow-Origin: *
Cross-Origin-Resource-Policy: cross-origin
```

### Content Security Policy

**Limitation:** Strict CSP may block WebAssembly

**Impact:**
- `wasm-unsafe-eval` required
- May conflict with security policies

**Configuration:**
```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'">
```

### SharedArrayBuffer Requirements

**Limitation:** Requires cross-origin isolation

**Impact:**
- Must set specific headers
- May break embedded content

**Required Headers:**
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

## Mobile Limitations

### iOS Safari

**Major Issues:**
1. ❌ getDisplayMedia not supported on iOS < 15.4
2. ⚠️ Limited WebGL support
3. ⚠️ Aggressive memory management
4. ❌ No screen sharing on iPhone (iPad only)

**Recommendation:** Desktop only for now

### Android Chrome

**Issues:**
1. ⚠️ Screen sharing requires Android 10+
2. ⚠️ Performance varies widely
3. ⚠️ Battery drain concerns

**Mitigation:**
```typescript
// Detect mobile
const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
if (isMobile) {
  showWarning('Best experience on desktop');
}
```

## Browser-Specific Quirks

### Chrome/Edge

**Quirks:**
- ✅ Best performance
- ✅ Full WebGL support
- ⚠️ High memory usage

**Optimization:**
```typescript
// Enable hardware acceleration
// chrome://settings/system
```

### Firefox

**Quirks:**
- ⚠️ Slower WebAssembly
- ⚠️ Different getDisplayMedia UI
- ✅ Better privacy controls

**Optimization:**
```javascript
// about:config
javascript.options.wasm_simd = true
dom.workers.maxPerDomain = 20
```

### Safari

**Quirks:**
- ⚠️ Limited WebGL
- ⚠️ SharedArrayBuffer restrictions
- ⚠️ Different permission model

**Workarounds:**
```typescript
// Disable WebGL on Safari
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
if (isSafari) {
  CONFIG.USE_WEBGL = false;
}
```

## Best Practices

### 1. Progressive Enhancement

```typescript
// Check feature support
if (!navigator.mediaDevices?.getDisplayMedia) {
  showError('Screen sharing not supported');
  return;
}

// Fallback for WebGL
const providers = CONFIG.USE_WEBGL && hasWebGL()
  ? ['webgl', 'wasm']
  : ['wasm'];
```

### 2. Graceful Degradation

```typescript
// Try optimal, fallback to basic
try {
  await loadLargeModel();
} catch {
  await loadSmallModel();
}
```

### 3. User Communication

```typescript
// Clear error messages
if (error.name === 'NotAllowedError') {
  showMessage('Please grant screen sharing permission');
} else if (error.name === 'NotFoundError') {
  showMessage('No screen available to share');
} else {
  showMessage('Screen sharing failed. Please try again.');
}
```

### 4. Performance Monitoring

```typescript
// Track and adapt
if (averageLatency > 500) {
  // Automatically reduce quality
  CONFIG.DETECTION_FPS = Math.max(5, CONFIG.DETECTION_FPS - 2);
  showNotification('Reduced FPS for better performance');
}
```

### 5. Resource Cleanup

```typescript
// Always cleanup
window.addEventListener('beforeunload', () => {
  screenCapture.stop();
  detector.terminate();
});
```

## Testing Across Browsers

### Recommended Test Matrix

1. **Chrome Latest** (primary target)
2. **Edge Latest** (Chromium-based)
3. **Firefox Latest** (different engine)
4. **Safari Latest** (WebKit quirks)

### Test Checklist

- [ ] Model loads successfully
- [ ] Screen capture works
- [ ] Detections appear
- [ ] Performance acceptable (>5 FPS)
- [ ] Memory stable (no leaks)
- [ ] Errors handled gracefully
- [ ] UI responsive
- [ ] Works on HTTPS

### Automated Testing

```typescript
// Feature detection tests
describe('Browser Support', () => {
  it('should support getDisplayMedia', () => {
    expect(navigator.mediaDevices.getDisplayMedia).toBeDefined();
  });
  
  it('should support Web Workers', () => {
    expect(typeof Worker).toBe('function');
  });
  
  it('should support WebAssembly', () => {
    expect(typeof WebAssembly).toBe('object');
  });
});
```

## Future Improvements

### WebGPU (Coming Soon)

```typescript
// When WebGPU becomes stable
if ('gpu' in navigator) {
  const adapter = await navigator.gpu.requestAdapter();
  // 10-100x faster inference
}
```

### WebCodecs API

```typescript
// Efficient video frame processing
const decoder = new VideoDecoder({
  output: (frame) => processFrame(frame),
  error: (e) => console.error(e),
});
```

### File System Access API

```typescript
// Save/load models locally
const handle = await window.showSaveFilePicker();
const writable = await handle.createWritable();
await writable.write(modelData);
```

## Summary

**Key Takeaways:**

1. ✅ Chrome/Edge provide best experience
2. ⚠️ Firefox works but may be slower
3. ⚠️ Safari has significant limitations
4. ❌ Mobile support is limited
5. 🔒 HTTPS is mandatory in production
6. 💾 Memory management is critical
7. 🎯 Performance tuning is essential
8. 🧪 Cross-browser testing required

**Recommended Approach:**

- Target Chrome/Edge primarily
- Test on Firefox regularly
- Warn Safari users of limitations
- Disable on mobile (or show warning)
- Provide clear error messages
- Monitor performance metrics
- Optimize aggressively
