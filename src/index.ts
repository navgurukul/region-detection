// Core detectors
export { HybridDetector } from './hybridDetector';
export { TesseractLayoutDetector } from './tesseractLayoutDetector';
export { SmartLayoutDetector } from './smartLayoutDetector';
export { SimpleLayoutDetector } from './simpleLayoutDetector';

// Utilities
export { ScreenCapture } from './screenCapture';
export { OverlayRenderer } from './overlay';
export { OCRProcessor } from './ocrProcessor';

// Types
export type {
  Detection,
  Settings,
  Stats,
  LayoutRegion,
} from './types';

export type { HybridRegion } from './hybridDetector';
export type { TesseractRegion } from './tesseractLayoutDetector';

// Configuration
export { CONFIG } from './config';

// Note: detector.worker.ts and detectorClient.ts are not exported
// as they are for the old YOLO-based detection system
// Use HybridDetector for the current Tesseract-based system

