# System Diagrams

Visual representations of the Screen Region Detector architecture.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser Window                           │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Main Thread                            │ │
│  │                                                             │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐ │ │
│  │  │   Screen     │───▶│    Video     │───▶│   Canvas    │ │ │
│  │  │   Capture    │    │   Element    │    │  Extractor  │ │ │
│  │  └──────────────┘    └──────────────┘    └──────┬──────┘ │ │
│  │                                                   │         │ │
│  │                                                   ▼         │ │
│  │                                          ┌────────────────┐ │ │
│  │                                          │   ImageData    │ │ │
│  │                                          └────────┬───────┘ │ │
│  │                                                   │         │ │
│  │                                                   │ postMessage
│  │                                                   ▼         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                     Web Worker Thread                       │ │
│  │                                                             │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐ │ │
│  │  │ Preprocess   │───▶│ ONNX Runtime │───▶│ Postprocess │ │ │
│  │  │  (resize,    │    │   YOLOv8     │    │    (NMS)    │ │ │
│  │  │  normalize)  │    │   Inference  │    │             │ │ │
│  │  └──────────────┘    └──────────────┘    └──────┬──────┘ │ │
│  │                                                   │         │ │
│  │                                                   │ postMessage
│  │                                                   ▼         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                      Main Thread                            │ │
│  │                                                             │ │
│  │  ┌──────────────┐    ┌──────────────┐    ┌─────────────┐ │ │
│  │  │  Detections  │───▶│   Overlay    │───▶│   Display   │ │ │
│  │  │   Results    │    │   Renderer   │    │   Canvas    │ │ │
│  │  └──────────────┘    └──────────────┘    └─────────────┘ │ │
│  │                                                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
User Action                Main Thread              Worker Thread
    │                          │                         │
    │  Click "Start"           │                         │
    ├─────────────────────────▶│                         │
    │                          │                         │
    │                          │  Initialize Model       │
    │                          ├────────────────────────▶│
    │                          │                         │
    │                          │                    Load ONNX
    │                          │                    Load Weights
    │                          │                         │
    │                          │◀────────────────────────┤
    │                          │      Model Ready        │
    │                          │                         │
    │  Grant Permission        │                         │
    ├─────────────────────────▶│                         │
    │                          │                         │
    │                     Start Stream                   │
    │                     Attach to Video                │
    │                          │                         │
    │                    ┌─────▼─────┐                  │
    │                    │ Detection │                  │
    │                    │   Loop    │                  │
    │                    └─────┬─────┘                  │
    │                          │                         │
    │                    Extract Frame                   │
    │                    Get ImageData                   │
    │                          │                         │
    │                          │  Send Frame             │
    │                          ├────────────────────────▶│
    │                          │                         │
    │                          │                   Preprocess
    │                          │                   Run Inference
    │                          │                   Postprocess
    │                          │                         │
    │                          │◀────────────────────────┤
    │                          │    Return Detections    │
    │                          │                         │
    │                    Draw Overlay                    │
    │                    Update Stats                    │
    │                          │                         │
    │                    ┌─────┴─────┐                  │
    │                    │   Repeat  │                  │
    │                    └───────────┘                  │
    │                          │                         │
    │  Click "Stop"            │                         │
    ├─────────────────────────▶│                         │
    │                          │                         │
    │                     Stop Stream                    │
    │                     Clear Canvas                   │
    │                          │                         │
```

## Data Flow Diagram

```
┌──────────────┐
│ Screen Share │
│   (WebRTC)   │
└──────┬───────┘
       │
       │ MediaStream
       ▼
┌──────────────┐
│    Video     │
│   Element    │
└──────┬───────┘
       │
       │ drawImage()
       ▼
┌──────────────┐
│    Canvas    │
│  (temporary) │
└──────┬───────┘
       │
       │ getImageData()
       ▼
┌──────────────┐
│  ImageData   │
│ (RGBA array) │
└──────┬───────┘
       │
       │ postMessage()
       ▼
┌──────────────────────────┐
│     Web Worker           │
│  ┌────────────────────┐  │
│  │   Preprocess       │  │
│  │  - Resize to 640   │  │
│  │  - Normalize [0,1] │  │
│  │  - BHWC → BCHW     │  │
│  └─────────┬──────────┘  │
│            │              │
│            ▼              │
│  ┌────────────────────┐  │
│  │  ONNX Runtime      │  │
│  │  - Load model      │  │
│  │  - Run inference   │  │
│  │  - Get output      │  │
│  └─────────┬──────────┘  │
│            │              │
│            ▼              │
│  ┌────────────────────┐  │
│  │   Postprocess      │  │
│  │  - Parse output    │  │
│  │  - Apply NMS       │  │
│  │  - Filter by conf  │  │
│  └─────────┬──────────┘  │
└────────────┼──────────────┘
             │
             │ postMessage()
             ▼
┌──────────────────────────┐
│   Detection Results      │
│  [{label, x, y, w, h}]   │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Overlay Renderer       │
│  - Draw boxes            │
│  - Draw labels           │
│  - Apply effects         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│   Display Canvas         │
│   (visible to user)      │
└──────────────────────────┘
```

## Memory Layout

```
Browser Memory Space
├── Main Thread (~100-200 MB)
│   ├── Video Element (stream buffer)
│   ├── Display Canvas (frame buffer)
│   ├── Temporary Canvas (extraction)
│   ├── Application State
│   └── UI Components
│
└── Worker Thread (~200-500 MB)
    ├── ONNX Runtime (~50 MB)
    ├── Model Weights (6-50 MB)
    ├── Input Tensor (640x640x3x4 = ~5 MB)
    ├── Output Tensor (~1 MB)
    └── Processing Buffers (~10 MB)

Total: ~300-700 MB depending on model size
```

## Performance Timeline

```
Frame Processing Timeline (target: <200ms)

0ms     ┌─────────────────────────────────────────────────┐
        │ Extract Frame from Video                        │
20ms    ├─────────────────────────────────────────────────┤
        │ Get ImageData from Canvas                       │
30ms    ├─────────────────────────────────────────────────┤
        │ Send to Worker (postMessage)                    │
35ms    ├─────────────────────────────────────────────────┤
        │ Preprocess (resize, normalize)                  │
50ms    ├─────────────────────────────────────────────────┤
        │ ONNX Inference (YOLOv8)                         │
150ms   ├─────────────────────────────────────────────────┤
        │ Postprocess (NMS, filtering)                    │
170ms   ├─────────────────────────────────────────────────┤
        │ Send Results (postMessage)                      │
175ms   ├─────────────────────────────────────────────────┤
        │ Draw Overlay                                    │
195ms   ├─────────────────────────────────────────────────┤
        │ Update UI                                       │
200ms   └─────────────────────────────────────────────────┘

Bottleneck: ONNX Inference (75% of time)
```

## State Machine

```
┌─────────┐
│  IDLE   │
└────┬────┘
     │ initialize()
     ▼
┌─────────┐
│ LOADING │
└────┬────┘
     │ model loaded
     ▼
┌─────────┐
│  READY  │◀──────────┐
└────┬────┘           │
     │ start()        │
     ▼                │
┌─────────┐           │
│CAPTURING│           │
└────┬────┘           │
     │ processFrame() │
     ▼                │
┌─────────┐           │
│DETECTING│           │
└────┬────┘           │
     │ results ready  │
     ▼                │
┌─────────┐           │
│RENDERING│           │
└────┬────┘           │
     │ next frame     │
     └────────────────┘
     │ stop()
     ▼
┌─────────┐
│ STOPPED │
└─────────┘
```

## Browser API Dependencies

```
Screen Region Detector
├── MediaDevices API
│   └── getDisplayMedia()
│       ├── Requires: HTTPS (except localhost)
│       ├── Requires: User permission
│       └── Returns: MediaStream
│
├── Canvas API
│   ├── drawImage()
│   ├── getImageData()
│   └── putImageData()
│
├── Web Workers API
│   ├── postMessage()
│   ├── onmessage
│   └── terminate()
│
├── WebAssembly
│   ├── ONNX Runtime WASM
│   └── Optional: SIMD support
│
└── Optional APIs
    ├── WebGL (acceleration)
    ├── OffscreenCanvas (performance)
    └── SharedArrayBuffer (advanced)
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CDN / Static Host                     │
│                  (Netlify, Vercel, etc.)                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────┐ │
│  │   index.html   │  │   main.js      │  │ style.css│ │
│  └────────────────┘  └────────────────┘  └──────────┘ │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐               │
│  │ detector.worker│  │   config.js    │               │
│  └────────────────┘  └────────────────┘               │
│                                                          │
│  ┌────────────────────────────────────────────────┐   │
│  │         models/yolov8n.onnx (6 MB)             │   │
│  └────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
                          │
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  All processing happens here (client-side)         │ │
│  │  - Screen capture                                  │ │
│  │  - AI inference                                    │ │
│  │  - Visualization                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  No data sent back to server ✓                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: Browser Permissions                           │
│  ┌────────────────────────────────────────────────┐    │
│  │ - User must grant screen sharing permission    │    │
│  │ - HTTPS required (except localhost)            │    │
│  │ - Same-origin policy enforced                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Layer 2: Content Security Policy                       │
│  ┌────────────────────────────────────────────────┐    │
│  │ - Restrict script sources                      │    │
│  │ - Allow wasm-unsafe-eval for WASM              │    │
│  │ - Prevent XSS attacks                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Layer 3: Worker Sandboxing                             │
│  ┌────────────────────────────────────────────────┐    │
│  │ - No DOM access                                │    │
│  │ - No network access                            │    │
│  │ - Isolated execution context                   │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Layer 4: Data Privacy                                  │
│  ┌────────────────────────────────────────────────┐    │
│  │ - No frames uploaded                           │    │
│  │ - No external API calls                        │    │
│  │ - Optional local storage only                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────┐
│  User Action    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Try Operation  │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
    Success            Error
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌──────────────────┐
│  Continue Flow  │  │  Catch Exception │
└─────────────────┘  └────────┬─────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │  Identify Error  │
                     └────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Permission      │  │ Network         │  │ Runtime         │
│ Denied          │  │ Error           │  │ Error           │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Show friendly   │  │ Retry with      │  │ Log error       │
│ message         │  │ fallback        │  │ Continue        │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

These diagrams provide visual understanding of the system architecture, data flow, and key processes.
