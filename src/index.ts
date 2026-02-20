/**
 * @navgurukul/screen-region-detector
 * 100% client-side screen region detection with Tesseract OCR
 * 
 * @example
 * ```typescript
 * import { HybridDetector } from '@navgurukul/screen-region-detector';
 * 
 * const detector = new HybridDetector();
 * await detector.initialize();
 * 
 * const regions = await detector.detectRegions(imageData);
 * console.log(regions);
 * ```
 */

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
