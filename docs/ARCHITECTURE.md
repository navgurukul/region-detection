# Architecture Documentation

## System Overview

The Screen Region Detector is a fully client-side application that performs real-time object detection on screen-sharing streams without any backend infrastructure.

## Core Components

### 1. Screen Capture Module (`screenCapture.ts`)

**Responsibility:** Capture and manage screen sharing stream

**Key Features:**
- Uses WebRTC `getDisplayMedia()` API
- Handles user permissions
- Manages stream lifecycle
- Detects when user stops sharing

**Flow:**
```
User clicks "Start" 
  → Request screen permission
  → Attach stream to video element
  → Monitor for stream end
```

### 2. Detector Worker (`detector.worker.ts`)

**Responsibility:** Run AI inference in background thread

**Why Web Worker:**
- Prevents UI blocking during inference
- Parallel processing
- Better performance on multi-core CPUs

**Key Features:**
- Loads ONNX Runtime Web
- Preprocesses frames (resize, normalize)
- Runs YOLOv8 inference
- Post-processes detections (NMS)

**Flow:**
```
Main Thread                    Worker Thread
    |                               |
    |------ init message ---------> |
    |                          Load model
    |<----- ready message --------- |
    |                               |
    |-- detect + imageData -------> |
    |                        Preprocess
    |                        Run inference
    |                        Post-process
    |<----- result message --------- |
```

### 3. Detector Client (`detectorClient.ts`)

**Responsibility:** Interface between main thread and worker

**Key Features:**
- Promise-based API
- Message queue management
- Error handling
- Worker lifecycle management

**API:**
```typescript
await detector.initialize();
const result = await detector.detect(imageData, threshold);
detector.terminate();
```

### 4. Overlay Renderer (`overlay.ts`)

**Responsibility:** Draw detections on canvas

**Key Features:**
- Draws bounding boxes
- Renders labels with confidence
- Applies visual effects (blur, highlights)
- Syncs with video stream

**Rendering Pipeline:**
```
Video frame → Canvas
  → Draw detections
  → Apply effects
  → Display to user
```

### 5. Main Application (`main.ts`)

**Responsibility:** Orchestrate all components

**Key Features:**
- UI event handling
- Detection loop management
- Stats tracking
- Settings management

**Main Loop:**
```
requestAnimationFrame
  → Check if time for next frame
  → Extract frame from video
  → Send to detector worker
  → Receive detections
  → Draw overlay
  → Update stats
  → Schedule next frame
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                      Browser Window                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐                                       │
│  │ Screen Share │ (WebRTC getDisplayMedia)              │
│  └──────┬───────┘                                       │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │ Video Element│ (hidden, receives stream)             │
│  └──────┬───────┘                                       │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │    Canvas    │ (extract frames)                      │
│  └──────┬───────┘                                       │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │  ImageData   │ (pixel data)                          │
│  └──────┬───────┘                                       │
│         │                                                │
│         ▼                                                │
│  ┌──────────────────────────────────────┐              │
│  │         Web Worker Thread             │              │
│  │  ┌────────────────────────────────┐  │              │
│  │  │    ONNX Runtime Web            │  │              │
│  │  │  ┌──────────────────────────┐ │  │              │
│  │  │  │   YOLOv8 Model (ONNX)    │ │  │              │
│  │  │  └──────────────────────────┘ │  │              │
│  │  └────────────────────────────────┘  │              │
│  └──────────────┬───────────────────────┘              │
│                 │                                        │
│                 ▼                                        │
│  ┌──────────────────────┐                              │
│  │ Detection Results     │                              │
│  │ [{label, x, y, ...}] │                              │
│  └──────────┬────────────┘                              │
│             │                                            │
│             ▼                                            │
│  ┌──────────────────────┐                              │
│  │  Overlay Renderer     │                              │
│  │  (draw boxes/labels)  │                              │
│  └──────────┬────────────┘                              │
│             │                                            │
│             ▼                                            │
│  ┌──────────────────────┐                              │
│  │   Display Canvas      │ (visible to user)            │
│  └───────────────────────┘                              │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Performance Optimizations

### 1. Frame Rate Control

```typescript
const targetInterval = 1000 / CONFIG.DETECTION_FPS;
if (elapsed >= targetInterval) {
  processFrame();
}
```

Only process frames at configured FPS (default 10), not every animation frame.

### 2. Web Worker

Inference runs in separate thread, preventing main thread blocking:
- UI remains responsive
- Smooth video playback
- Better multi-core utilization

### 3. Frame Preprocessing

Resize frames before inference:
```typescript
const scale = Math.min(640 / width, 640 / height);
```

Smaller input = faster inference.

### 4. Model Optimization

- Use ONNX format (optimized for inference)
- Static shapes (no dynamic batching)
- Simplified graph (remove training ops)
- WebGL backend when available

### 5. Non-Maximum Suppression

Efficient NMS implementation:
- Sort by confidence once
- Early termination
- IoU calculation optimization

## Memory Management

### Challenges

- Video frames are large (1920x1080x4 bytes = 8MB)
- Processing at 10 FPS = 80MB/s
- Model weights = 6-50MB
- Detection results accumulate

### Solutions

1. **Temporary Canvas Reuse**
```typescript
const tempCanvas = document.createElement('canvas');
// Reuse same canvas for frame extraction
```

2. **Worker Isolation**
```typescript
// Heavy processing in worker
// Automatic garbage collection
```

3. **Result Limiting**
```typescript
const MAX_DETECTIONS = 50;
detections.slice(0, MAX_DETECTIONS);
```

4. **Model Caching**
```typescript
// Load model once, reuse for all frames
session = await ort.InferenceSession.create(modelPath);
```

## Security Architecture

### Threat Model

**Threats:**
- Malicious model files
- XSS attacks
- Data exfiltration
- Privacy violations

**Mitigations:**

1. **No Network Requests During Inference**
```typescript
// All processing happens locally
// No frames sent to servers
```

2. **Content Security Policy**
```html
<meta http-equiv="Content-Security-Policy" 
  content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'">
```

3. **Model Integrity**
```typescript
// Verify model hash before loading
const hash = await crypto.subtle.digest('SHA-256', modelData);
```

4. **Sandboxed Worker**
```typescript
// Worker has limited API access
// Cannot access DOM or make network requests
```

## Browser Compatibility

### Required APIs

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| getDisplayMedia | 72+ | 66+ | 13+ | 79+ |
| Web Workers | ✅ | ✅ | ✅ | ✅ |
| WebAssembly | 57+ | 52+ | 11+ | 16+ |
| OffscreenCanvas | 69+ | 105+ | 16.4+ | 79+ |
| SharedArrayBuffer | 92+ | 79+ | 15.2+ | 92+ |

### Fallbacks

```typescript
// WebGL not available → fallback to WASM
const providers = CONFIG.USE_WEBGL 
  ? ['webgl', 'wasm']
  : ['wasm'];

// OffscreenCanvas not available → use regular canvas
const canvas = 'OffscreenCanvas' in window
  ? new OffscreenCanvas(width, height)
  : document.createElement('canvas');
```

## Error Handling

### Levels

1. **User-Facing Errors**
```typescript
try {
  await screenCapture.start();
} catch (error) {
  alert('Please grant screen sharing permission');
}
```

2. **Recoverable Errors**
```typescript
try {
  await detector.detect(imageData);
} catch (error) {
  console.warn('Detection failed, skipping frame');
  // Continue with next frame
}
```

3. **Fatal Errors**
```typescript
try {
  await detector.initialize();
} catch (error) {
  alert('Failed to load model. Please refresh.');
  // Stop application
}
```

## Testing Strategy

### Unit Tests
- Frame preprocessing
- NMS algorithm
- IoU calculation
- Detection filtering

### Integration Tests
- Worker communication
- Model loading
- Frame processing pipeline

### Performance Tests
- Inference latency
- Memory usage
- FPS stability
- CPU utilization

### Browser Tests
- Cross-browser compatibility
- Permission handling
- Error scenarios

## Future Enhancements

### Planned Features

1. **Multi-Model Support**
```typescript
const models = {
  'ui-detection': 'yolov8-ui.onnx',
  'text-detection': 'yolov8-text.onnx',
};
```

2. **Model Quantization**
```python
# INT8 quantization for 4x smaller models
model.export(format='onnx', int8=True)
```

3. **Streaming Optimization**
```typescript
// Only process changed regions
const diff = computeFrameDiff(prevFrame, currentFrame);
```

4. **WebGPU Support**
```typescript
// When WebGPU becomes stable
const providers = ['webgpu', 'webgl', 'wasm'];
```

## Debugging

### Enable Verbose Logging

```typescript
// config.ts
export const DEBUG = true;

// detector.worker.ts
if (DEBUG) {
  console.log('Inference time:', inferenceTime);
  console.log('Detections:', detections.length);
}
```

### Performance Profiling

```typescript
performance.mark('inference-start');
await session.run(feeds);
performance.mark('inference-end');
performance.measure('inference', 'inference-start', 'inference-end');
```

### Memory Profiling

Chrome DevTools → Memory → Take Heap Snapshot

Look for:
- Detached DOM nodes
- Large arrays not being GC'd
- Worker memory leaks
