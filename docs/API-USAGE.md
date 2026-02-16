# API Usage Examples

This guide shows how to use the detection system programmatically.

## Basic Usage

### Initialize and Start Detection

```typescript
import { ScreenCapture } from './screenCapture';
import { DetectorClient } from './detectorClient';
import { OverlayRenderer } from './overlay';

// Setup
const videoElement = document.getElementById('video') as HTMLVideoElement;
const canvas = document.getElementById('canvas') as HTMLCanvasElement;

const screenCapture = new ScreenCapture(videoElement);
const detector = new DetectorClient();
const overlay = new OverlayRenderer(canvas, {
  showLabels: true,
  showConfidence: true,
  enableOCR: false,
  confidenceThreshold: 0.5,
});

// Initialize detector
await detector.initialize();

// Start screen capture
await screenCapture.start();

// Process single frame
const { width, height } = screenCapture.getStreamDimensions();
const tempCanvas = document.createElement('canvas');
tempCanvas.width = width;
tempCanvas.height = height;
const ctx = tempCanvas.getContext('2d')!;
ctx.drawImage(videoElement, 0, 0);
const imageData = ctx.getImageData(0, 0, width, height);

// Run detection
const result = await detector.detect(imageData, 0.5);
console.log('Detections:', result.detections);

// Draw overlay
overlay.drawDetections(result.detections, videoElement);

// Cleanup
screenCapture.stop();
detector.terminate();
```

## Advanced Examples

### Custom Detection Loop

```typescript
class CustomDetector {
  private isRunning = false;
  private frameId: number | null = null;

  async start() {
    this.isRunning = true;
    await this.screenCapture.start();
    await this.detector.initialize();
    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }
    this.screenCapture.stop();
  }

  private async loop() {
    if (!this.isRunning) return;

    try {
      // Extract frame
      const imageData = this.extractFrame();
      
      // Detect
      const result = await this.detector.detect(imageData);
      
      // Process results
      this.onDetections(result.detections);
      
    } catch (error) {
      console.error('Detection error:', error);
    }

    // Schedule next frame
    this.frameId = requestAnimationFrame(() => this.loop());
  }

  private onDetections(detections: Detection[]) {
    // Custom handling
    console.log(`Found ${detections.length} objects`);
  }
}
```

### Filter Specific Objects

```typescript
// Detect only specific classes
const result = await detector.detect(imageData, 0.5);

const laptops = result.detections.filter(d => d.label === 'laptop');
const phones = result.detections.filter(d => d.label === 'cell phone');
const people = result.detections.filter(d => d.label === 'person');

console.log(`Laptops: ${laptops.length}`);
console.log(`Phones: ${phones.length}`);
console.log(`People: ${people.length}`);
```

### Activity Monitoring

```typescript
class ActivityMonitor {
  private detectionHistory: Detection[][] = [];
  private readonly maxHistory = 30; // 30 frames

  addDetections(detections: Detection[]) {
    this.detectionHistory.push(detections);
    if (this.detectionHistory.length > this.maxHistory) {
      this.detectionHistory.shift();
    }
  }

  getActivityScore(): number {
    // Calculate based on detection patterns
    const avgDetections = this.detectionHistory.reduce(
      (sum, dets) => sum + dets.length, 0
    ) / this.detectionHistory.length;

    // Check for suspicious patterns
    const hasMultiplePhones = this.detectionHistory.some(
      dets => dets.filter(d => d.label === 'cell phone').length > 1
    );

    const hasMultipleLaptops = this.detectionHistory.some(
      dets => dets.filter(d => d.label === 'laptop').length > 2
    );

    let score = 0;
    if (avgDetections > 10) score += 20;
    if (hasMultiplePhones) score += 30;
    if (hasMultipleLaptops) score += 25;

    return Math.min(score, 100);
  }

  getRiskLevel(): 'low' | 'medium' | 'high' {
    const score = this.getActivityScore();
    if (score > 60) return 'high';
    if (score > 30) return 'medium';
    return 'low';
  }
}

// Usage
const monitor = new ActivityMonitor();

// In detection loop
const result = await detector.detect(imageData);
monitor.addDetections(result.detections);

console.log('Risk:', monitor.getRiskLevel());
console.log('Score:', monitor.getActivityScore());
```

### Region of Interest Detection

```typescript
// Only detect in specific screen region
function detectInRegion(
  imageData: ImageData,
  roi: { x: number; y: number; width: number; height: number }
): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = roi.width;
  canvas.height = roi.height;
  const ctx = canvas.getContext('2d')!;
  
  // Extract ROI
  ctx.putImageData(
    imageData,
    -roi.x,
    -roi.y,
    roi.x,
    roi.y,
    roi.width,
    roi.height
  );
  
  return ctx.getImageData(0, 0, roi.width, roi.height);
}

// Usage
const fullFrame = extractFullFrame();
const topLeftQuadrant = detectInRegion(fullFrame, {
  x: 0,
  y: 0,
  width: fullFrame.width / 2,
  height: fullFrame.height / 2,
});

const result = await detector.detect(topLeftQuadrant);
```

### Confidence-Based Filtering

```typescript
// Get only high-confidence detections
function getHighConfidenceDetections(
  detections: Detection[],
  minConfidence: number = 0.8
): Detection[] {
  return detections.filter(d => d.confidence >= minConfidence);
}

// Get detections by confidence tier
function groupByConfidence(detections: Detection[]) {
  return {
    high: detections.filter(d => d.confidence >= 0.8),
    medium: detections.filter(d => d.confidence >= 0.5 && d.confidence < 0.8),
    low: detections.filter(d => d.confidence < 0.5),
  };
}

// Usage
const result = await detector.detect(imageData);
const grouped = groupByConfidence(result.detections);

console.log(`High confidence: ${grouped.high.length}`);
console.log(`Medium confidence: ${grouped.medium.length}`);
console.log(`Low confidence: ${grouped.low.length}`);
```

### Event-Based Detection

```typescript
class EventBasedDetector extends EventTarget {
  async processFrame(imageData: ImageData) {
    const result = await this.detector.detect(imageData);
    
    // Emit events for different scenarios
    if (result.detections.length === 0) {
      this.dispatchEvent(new CustomEvent('no-detections'));
    }
    
    const phones = result.detections.filter(d => d.label === 'cell phone');
    if (phones.length > 0) {
      this.dispatchEvent(new CustomEvent('phone-detected', {
        detail: { count: phones.length, detections: phones }
      }));
    }
    
    const laptops = result.detections.filter(d => d.label === 'laptop');
    if (laptops.length > 2) {
      this.dispatchEvent(new CustomEvent('multiple-laptops', {
        detail: { count: laptops.length }
      }));
    }
    
    this.dispatchEvent(new CustomEvent('detections', {
      detail: result
    }));
  }
}

// Usage
const detector = new EventBasedDetector();

detector.addEventListener('phone-detected', (e: CustomEvent) => {
  console.log(`Phone detected! Count: ${e.detail.count}`);
  alert('Phone detected in frame!');
});

detector.addEventListener('multiple-laptops', (e: CustomEvent) => {
  console.log(`Warning: ${e.detail.count} laptops detected`);
});

detector.addEventListener('detections', (e: CustomEvent) => {
  updateUI(e.detail.detections);
});
```

### Performance Monitoring

```typescript
class PerformanceMonitor {
  private metrics: {
    fps: number[];
    latency: number[];
    detectionCount: number[];
  } = {
    fps: [],
    latency: [],
    detectionCount: [],
  };

  recordMetrics(fps: number, latency: number, count: number) {
    this.metrics.fps.push(fps);
    this.metrics.latency.push(latency);
    this.metrics.detectionCount.push(count);

    // Keep last 100 samples
    if (this.metrics.fps.length > 100) {
      this.metrics.fps.shift();
      this.metrics.latency.shift();
      this.metrics.detectionCount.shift();
    }
  }

  getStats() {
    const avg = (arr: number[]) => 
      arr.reduce((a, b) => a + b, 0) / arr.length;
    
    const max = (arr: number[]) => Math.max(...arr);
    const min = (arr: number[]) => Math.min(...arr);

    return {
      fps: {
        avg: avg(this.metrics.fps),
        min: min(this.metrics.fps),
        max: max(this.metrics.fps),
      },
      latency: {
        avg: avg(this.metrics.latency),
        min: min(this.metrics.latency),
        max: max(this.metrics.latency),
      },
      detectionCount: {
        avg: avg(this.metrics.detectionCount),
        min: min(this.metrics.detectionCount),
        max: max(this.metrics.detectionCount),
      },
    };
  }

  shouldReduceQuality(): boolean {
    const stats = this.getStats();
    return stats.fps.avg < 5 || stats.latency.avg > 500;
  }
}

// Usage
const perfMonitor = new PerformanceMonitor();

// In detection loop
const startTime = performance.now();
const result = await detector.detect(imageData);
const latency = performance.now() - startTime;

perfMonitor.recordMetrics(currentFPS, latency, result.detections.length);

if (perfMonitor.shouldReduceQuality()) {
  console.log('Performance degraded, reducing quality...');
  CONFIG.DETECTION_FPS = 5;
  CONFIG.INFERENCE_SIZE = 320;
}

console.log('Performance stats:', perfMonitor.getStats());
```

### Custom Overlay Styles

```typescript
class CustomOverlay extends OverlayRenderer {
  drawDetections(detections: Detection[], videoElement: HTMLVideoElement) {
    super.drawDetections(detections, videoElement);
    
    // Add custom visualizations
    for (const detection of detections) {
      if (detection.label === 'cell phone') {
        this.drawWarningIcon(detection.x, detection.y);
      }
      
      if (detection.confidence > 0.9) {
        this.drawHighConfidenceBadge(detection);
      }
    }
  }

  private drawWarningIcon(x: number, y: number) {
    this.ctx.fillStyle = '#ff4444';
    this.ctx.font = '24px sans-serif';
    this.ctx.fillText('⚠️', x - 30, y - 10);
  }

  private drawHighConfidenceBadge(detection: Detection) {
    const { x, y, width } = detection;
    this.ctx.fillStyle = '#00ff88';
    this.ctx.font = 'bold 12px sans-serif';
    this.ctx.fillText('✓', x + width + 5, y + 15);
  }
}
```

### Batch Processing

```typescript
// Process multiple frames in batch
async function batchProcess(frames: ImageData[]): Promise<Detection[][]> {
  const results: Detection[][] = [];
  
  for (const frame of frames) {
    const result = await detector.detect(frame);
    results.push(result.detections);
  }
  
  return results;
}

// Parallel processing (if multiple workers)
async function parallelProcess(
  frames: ImageData[],
  workers: DetectorClient[]
): Promise<Detection[][]> {
  const promises = frames.map((frame, i) => 
    workers[i % workers.length].detect(frame)
  );
  
  const results = await Promise.all(promises);
  return results.map(r => r.detections);
}
```

### Save Detection Results

```typescript
// Export detections to JSON
function exportDetections(detections: Detection[][], filename: string) {
  const data = {
    timestamp: new Date().toISOString(),
    frameCount: detections.length,
    detections: detections,
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Usage
const allDetections: Detection[][] = [];

// In detection loop
allDetections.push(result.detections);

// Export when done
exportDetections(allDetections, 'detections.json');
```

### Integration with Other Libraries

```typescript
// With Chart.js for visualization
import Chart from 'chart.js/auto';

function visualizeDetectionTrends(history: Detection[][]) {
  const labels = history.map((_, i) => `Frame ${i}`);
  const counts = history.map(dets => dets.length);
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Detections per Frame',
        data: counts,
        borderColor: '#00ff88',
      }]
    }
  });
}

// With IndexedDB for caching
async function cacheModel(modelPath: string) {
  const db = await openDB('detector-cache', 1, {
    upgrade(db) {
      db.createObjectStore('models');
    },
  });
  
  const response = await fetch(modelPath);
  const blob = await response.blob();
  await db.put('models', blob, 'yolov8n');
}
```

## TypeScript Types

```typescript
// Custom types for your application
interface DetectionEvent {
  timestamp: number;
  detections: Detection[];
  frameNumber: number;
}

interface ActivityReport {
  startTime: Date;
  endTime: Date;
  totalFrames: number;
  totalDetections: number;
  uniqueLabels: string[];
  riskScore: number;
}

interface PerformanceMetrics {
  avgFPS: number;
  avgLatency: number;
  peakMemory: number;
  totalFramesProcessed: number;
}
```

## Error Handling

```typescript
try {
  await detector.initialize();
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('timeout')) {
      console.error('Model loading timeout');
      // Retry or use fallback
    } else if (error.message.includes('CORS')) {
      console.error('CORS error - check model hosting');
    } else {
      console.error('Unknown error:', error);
    }
  }
}
```

## Best Practices

1. **Always cleanup resources**
```typescript
window.addEventListener('beforeunload', () => {
  screenCapture.stop();
  detector.terminate();
});
```

2. **Handle errors gracefully**
```typescript
try {
  const result = await detector.detect(imageData);
} catch (error) {
  console.warn('Detection failed, skipping frame');
  // Continue with next frame
}
```

3. **Monitor performance**
```typescript
if (avgLatency > 500) {
  // Reduce quality automatically
  CONFIG.DETECTION_FPS = 5;
}
```

4. **Provide user feedback**
```typescript
if (!detector.getIsReady()) {
  showLoadingIndicator('Loading AI model...');
}
```
