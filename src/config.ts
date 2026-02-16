export const CONFIG = {
  // Detection settings
  DETECTION_FPS: 10,
  INFERENCE_SIZE: 640,
  CONFIDENCE_THRESHOLD: 0.5,
  IOU_THRESHOLD: 0.45,
  
  // Model settings
  MODEL_PATH: '/models/yolov8n.onnx',
  MODEL_INPUT_NAME: 'images',
  MODEL_OUTPUT_NAMES: ['output0'],
  
  // Performance
  MAX_DETECTIONS: 50,
  USE_WEBGL: true,
  
  // UI
  BOX_COLOR: '#00ff88',
  BOX_THICKNESS: 2,
  FONT_SIZE: 14,
  LABEL_PADDING: 4,
  
  // OCR
  ENABLE_OCR: false,
  OCR_CONFIDENCE_MIN: 0.6,
  
  // Privacy
  BLUR_SENSITIVE: false,
  SENSITIVE_KEYWORDS: ['password', 'credit card', 'ssn', 'secret'],
};

// COCO class names (YOLOv8 default)
export const CLASS_NAMES = [
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat',
  'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack',
  'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball',
  'kite', 'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket',
  'bottle', 'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple',
  'sandwich', 'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair',
  'couch', 'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
  'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
  'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

// Custom class names for UI detection (if using custom trained model)
export const CUSTOM_CLASS_NAMES = [
  'vscode', 'chrome', 'firefox', 'terminal', 'chatgpt', 'leetcode', 
  'phone-screen', 'browser-window', 'code-editor', 'video-call'
];
