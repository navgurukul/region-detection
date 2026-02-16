export interface Detection {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  isCode?: boolean;
  ocrConfidence?: number;
}

export interface DetectionResult {
  detections: Detection[];
  inferenceTime: number;
  frameShape: [number, number];
}

export interface WorkerMessage {
  type: 'init' | 'detect' | 'result' | 'error' | 'ready';
  data?: any;
  error?: string;
}

export interface Stats {
  fps: number;
  latency: number;
  detectionCount: number;
  modelLoaded: boolean;
}

export interface Settings {
  showLabels: boolean;
  showConfidence: boolean;
  enableOCR: boolean;
  confidenceThreshold: number;
}
