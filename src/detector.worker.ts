import * as ort from 'onnxruntime-web';
import { CONFIG, CLASS_NAMES } from './config';
import type { Detection, WorkerMessage } from './types';

let session: ort.InferenceSession | null = null;

// Initialize ONNX Runtime
async function initModel(modelPath: string): Promise<void> {
  try {
    // Configure ONNX Runtime for browser
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.simd = true;
    
    // Use WebGL backend if available, fallback to WASM
    const providers: ort.InferenceSession.ExecutionProviderConfig[] = CONFIG.USE_WEBGL 
      ? ['webgl', 'wasm']
      : ['wasm'];

    // Load model
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: providers,
    });

    console.log('✓ ONNX model loaded successfully');
    postMessage({ type: 'ready' } as WorkerMessage);
  } catch (error) {
    console.error('Model loading failed:', error);
    postMessage({ 
      type: 'error', 
      error: `Failed to load model: ${error}` 
    } as WorkerMessage);
  }
}

// Preprocess image data for YOLO
function preprocessImage(imageData: ImageData): ort.Tensor {
  const { width, height, data } = imageData;
  
  // Resize to model input size
  const inputSize = CONFIG.INFERENCE_SIZE;
  const scale = Math.min(inputSize / width, inputSize / height);
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);
  
  // Create float32 array for model input [1, 3, 640, 640]
  const input = new Float32Array(1 * 3 * inputSize * inputSize);
  
  // Normalize and transpose (BHWC -> BCHW)
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcIdx = (y * newWidth + x) * 4;
      const dstIdx = y * inputSize + x;
      
      // Normalize to [0, 1] and arrange in CHW format
      input[dstIdx] = data[srcIdx] / 255.0; // R
      input[inputSize * inputSize + dstIdx] = data[srcIdx + 1] / 255.0; // G
      input[inputSize * inputSize * 2 + dstIdx] = data[srcIdx + 2] / 255.0; // B
    }
  }
  
  return new ort.Tensor('float32', input, [1, 3, inputSize, inputSize]);
}

// Non-Maximum Suppression
function nms(boxes: Detection[], iouThreshold: number): Detection[] {
  // Sort by confidence
  boxes.sort((a, b) => b.confidence - a.confidence);
  
  const selected: Detection[] = [];
  
  for (const box of boxes) {
    let shouldSelect = true;
    
    for (const selectedBox of selected) {
      const iou = calculateIoU(box, selectedBox);
      if (iou > iouThreshold) {
        shouldSelect = false;
        break;
      }
    }
    
    if (shouldSelect) {
      selected.push(box);
    }
  }
  
  return selected;
}

// Calculate Intersection over Union
function calculateIoU(box1: Detection, box2: Detection): number {
  const x1 = Math.max(box1.x, box2.x);
  const y1 = Math.max(box1.y, box2.y);
  const x2 = Math.min(box1.x + box1.width, box2.x + box2.width);
  const y2 = Math.min(box1.y + box1.height, box2.y + box2.height);
  
  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const area1 = box1.width * box1.height;
  const area2 = box2.width * box2.height;
  const union = area1 + area2 - intersection;
  
  return intersection / union;
}

// Post-process YOLO output
function postprocess(
  output: ort.Tensor,
  originalWidth: number,
  originalHeight: number,
  confidenceThreshold: number
): Detection[] {
  const detections: Detection[] = [];
  const data = output.data as Float32Array;
  
  // YOLOv8 output format: [1, 84, 8400]
  // 84 = 4 (bbox) + 80 (classes)
  const numDetections = 8400;
  const numClasses = 80;
  
  const inputSize = CONFIG.INFERENCE_SIZE;
  const scaleX = originalWidth / inputSize;
  const scaleY = originalHeight / inputSize;
  
  for (let i = 0; i < numDetections; i++) {
    // Get class scores
    let maxScore = 0;
    let maxClassId = 0;
    
    for (let j = 0; j < numClasses; j++) {
      const score = data[i + (4 + j) * numDetections];
      if (score > maxScore) {
        maxScore = score;
        maxClassId = j;
      }
    }
    
    if (maxScore < confidenceThreshold) continue;
    
    // Get bbox coordinates (center format)
    const cx = data[i] * scaleX;
    const cy = data[i + numDetections] * scaleY;
    const w = data[i + numDetections * 2] * scaleX;
    const h = data[i + numDetections * 3] * scaleY;
    
    // Convert to corner format
    const x = cx - w / 2;
    const y = cy - h / 2;
    
    detections.push({
      label: CLASS_NAMES[maxClassId] || `class_${maxClassId}`,
      confidence: maxScore,
      x: Math.max(0, Math.round(x)),
      y: Math.max(0, Math.round(y)),
      width: Math.round(w),
      height: Math.round(h),
    });
  }
  
  // Apply NMS
  return nms(detections, CONFIG.IOU_THRESHOLD);
}

// Run inference
async function detect(imageData: ImageData, confidenceThreshold: number): Promise<void> {
  if (!session) {
    postMessage({ 
      type: 'error', 
      error: 'Model not loaded' 
    } as WorkerMessage);
    return;
  }
  
  try {
    const startTime = performance.now();
    
    // Preprocess
    const inputTensor = preprocessImage(imageData);
    
    // Run inference
    const feeds: Record<string, ort.Tensor> = {};
    feeds[CONFIG.MODEL_INPUT_NAME] = inputTensor;
    
    const results = await session.run(feeds);
    const output = results[CONFIG.MODEL_OUTPUT_NAMES[0]];
    
    // Post-process
    const detections = postprocess(
      output,
      imageData.width,
      imageData.height,
      confidenceThreshold
    );
    
    const inferenceTime = performance.now() - startTime;
    
    // Send results back
    postMessage({
      type: 'result',
      data: {
        detections,
        inferenceTime,
        frameShape: [imageData.width, imageData.height],
      },
    } as WorkerMessage);
    
  } catch (error) {
    console.error('Detection failed:', error);
    postMessage({ 
      type: 'error', 
      error: `Detection failed: ${error}` 
    } as WorkerMessage);
  }
}

// Handle messages from main thread
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, data } = e.data;
  
  switch (type) {
    case 'init':
      await initModel(data.modelPath);
      break;
      
    case 'detect':
      await detect(data.imageData, data.confidenceThreshold);
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
};
