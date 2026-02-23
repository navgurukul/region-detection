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

export interface LayoutRegion {
  type: 'window' | 'panel' | 'region';
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  area: number;
}

// Hierarchical OCR Detection Types
export type DetectionLevel = 'block' | 'paragraph' | 'line' | 'word' | 'symbol';

export interface BoundingBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface BaseOCRElement {
  bbox: BoundingBox;
  text: string;
  confidence: number;
  baseline?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    has_baseline: boolean;
  };
}

export interface OCRSymbol extends BaseOCRElement {
  level: 'symbol';
  choices?: Array<{ text: string; confidence: number }>;
}

export interface OCRWord extends BaseOCRElement {
  level: 'word';
  symbols?: OCRSymbol[];
  is_numeric?: boolean;
  is_bold?: boolean;
  is_italic?: boolean;
  is_underlined?: boolean;
  font_name?: string;
  font_size?: number;
}

export interface OCRLine extends BaseOCRElement {
  level: 'line';
  words?: OCRWord[];
}

export interface OCRParagraph extends BaseOCRElement {
  level: 'paragraph';
  lines?: OCRLine[];
  is_ltr?: boolean;
}

export interface OCRBlock extends BaseOCRElement {
  level: 'block';
  paragraphs?: OCRParagraph[];
  blocktype?: string;
  isCode?: boolean;
}

export interface HierarchicalOCRResult {
  blocks: OCRBlock[];
  paragraphs: OCRParagraph[];
  lines: OCRLine[];
  words: OCRWord[];
  symbols: OCRSymbol[];
  fullText: string;
  confidence: number;
  processingTime: number;
}

export interface DetectionOptions {
  levels?: DetectionLevel[];
  minConfidence?: number;
  includeSymbols?: boolean;
  includeWords?: boolean;
  includeLines?: boolean;
  includeParagraphs?: boolean;
  includeBlocks?: boolean;
  detectCode?: boolean;
}
