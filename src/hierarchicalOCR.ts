/**
 * Hierarchical OCR Detector
 * Exposes all Tesseract detection levels: blocks, paragraphs, lines, words, symbols
 */

import Tesseract, { createWorker, RecognizeResult } from 'tesseract.js';
import { EnhancedCodeDetector } from './enhancedCodeDetector';
import type {
  HierarchicalOCRResult,
  OCRBlock,
  OCRParagraph,
  OCRLine,
  OCRWord,
  OCRSymbol,
  DetectionOptions,
  BoundingBox,
} from './types';

export class HierarchicalOCRDetector {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;
  private cachedResult: HierarchicalOCRResult | null = null;
  private lastProcessTime = 0;
  private processingInterval = 3000; // Process every 3 seconds
  private isProcessing = false;
  private codeDetector: EnhancedCodeDetector;

  constructor() {
    this.codeDetector = new EnhancedCodeDetector();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[HierarchicalOCR] Already initialized');
      return;
    }

    console.log('[HierarchicalOCR] Starting Tesseract initialization...');
    
    try {
      this.worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`[HierarchicalOCR] ${m.status}: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      console.log('[HierarchicalOCR] Setting parameters...');
      
      // Use automatic page segmentation with OSD for best results
      await this.worker.setParameters({
        tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD,
      });

      this.isInitialized = true;
      console.log('[HierarchicalOCR] ✓ Ready!');
    } catch (error) {
      console.error('[HierarchicalOCR] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Detect all hierarchical levels from an image
   */
  async detect(
    imageData: ImageData,
    options: DetectionOptions = {}
  ): Promise<HierarchicalOCRResult> {
    if (!this.isInitialized || !this.worker) {
      console.warn('[HierarchicalOCR] Not initialized');
      return this.getEmptyResult();
    }

    const now = Date.now();
    
    // If we're currently processing, return cached results
    if (this.isProcessing) {
      console.log('[HierarchicalOCR] Still processing, returning cached results');
      return this.cachedResult || this.getEmptyResult();
    }
    
    // Use cache if recent
    if (this.cachedResult && now - this.lastProcessTime < this.processingInterval) {
      const timeLeft = Math.round((this.processingInterval - (now - this.lastProcessTime)) / 1000);
      console.log(`[HierarchicalOCR] Using cache (${timeLeft}s until next scan)`);
      return this.cachedResult;
    }

    // Start new processing
    console.log('[HierarchicalOCR] Starting new scan...');
    this.lastProcessTime = now;
    this.isProcessing = true;
    
    try {
      const result = await this.processImage(imageData, options);
      this.cachedResult = result;
      console.log(`[HierarchicalOCR] Cached result with ${result.blocks.length} blocks`);
      return result;
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process image and extract all hierarchical levels
   */
  private async processImage(
    imageData: ImageData,
    options: DetectionOptions
  ): Promise<HierarchicalOCRResult> {
    if (!this.worker) {
      return this.getEmptyResult();
    }

    const startTime = Date.now();

    try {
      // Resize for performance
      const canvas = this.prepareCanvas(imageData);
      
      // Run Tesseract
      console.log('[HierarchicalOCR] Running Tesseract...');
      const result = await this.worker.recognize(canvas);
      const processingTime = Date.now() - startTime;
      console.log(`[HierarchicalOCR] Completed in ${processingTime}ms`);

      // Extract all levels
      const hierarchicalResult = this.extractHierarchy(result, options);
      hierarchicalResult.processingTime = processingTime;

      return hierarchicalResult;

    } catch (error) {
      console.error('[HierarchicalOCR] Processing error:', error);
      return this.getEmptyResult();
    }
  }

  /**
   * Extract all hierarchical levels from Tesseract result
   */
  private extractHierarchy(
    result: RecognizeResult,
    options: DetectionOptions
  ): HierarchicalOCRResult {
    const {
      includeBlocks = true,
      includeParagraphs = true,
      includeLines = true,
      includeWords = true,
      includeSymbols = true,
      minConfidence = 0,
      detectCode = true,
    } = options;

    const hierarchicalResult: HierarchicalOCRResult = {
      blocks: [],
      paragraphs: [],
      lines: [],
      words: [],
      symbols: [],
      fullText: result.data.text,
      confidence: result.data.confidence,
      processingTime: 0,
    };

    // Extract blocks
    if (includeBlocks && result.data.blocks) {
      console.log(`[HierarchicalOCR] Processing ${result.data.blocks.length} blocks`);
      for (const block of result.data.blocks) {
        if (block.confidence < minConfidence) continue;

        const ocrBlock: OCRBlock = {
          level: 'block',
          bbox: block.bbox,
          text: block.text,
          confidence: block.confidence,
          paragraphs: [],
          blocktype: block.blocktype,
          isCode: detectCode ? this.isCodeBlock(block.text) : false,
        };

        hierarchicalResult.blocks.push(ocrBlock);
      }
    }

    // Extract paragraphs
    if (includeParagraphs && result.data.paragraphs) {
      console.log(`[HierarchicalOCR] Processing ${result.data.paragraphs.length} paragraphs`);
      for (const para of result.data.paragraphs) {
        if (para.confidence < minConfidence) continue;

        const ocrPara: OCRParagraph = {
          level: 'paragraph',
          bbox: para.bbox,
          text: para.text,
          confidence: para.confidence,
          lines: [],
          is_ltr: para.is_ltr,
        };

        hierarchicalResult.paragraphs.push(ocrPara);
      }
    }

    // Extract lines
    if (includeLines && result.data.lines) {
      console.log(`[HierarchicalOCR] Processing ${result.data.lines.length} lines`);
      for (const line of result.data.lines) {
        if (line.confidence < minConfidence) continue;

        const ocrLine: OCRLine = {
          level: 'line',
          bbox: line.bbox,
          text: line.text,
          confidence: line.confidence,
          baseline: line.baseline,
          words: [],
        };

        hierarchicalResult.lines.push(ocrLine);
      }
    }

    // Extract words
    if (includeWords && result.data.words) {
      console.log(`[HierarchicalOCR] Processing ${result.data.words.length} words`);
      for (const word of result.data.words) {
        if (word.confidence < minConfidence) continue;

        const ocrWord: OCRWord = {
          level: 'word',
          bbox: word.bbox,
          text: word.text,
          confidence: word.confidence,
          baseline: word.baseline,
          symbols: [],
          is_numeric: word.is_numeric,
          is_bold: word.is_bold,
          is_italic: word.is_italic,
          is_underlined: word.is_underlined,
          font_name: word.font_name,
          font_size: word.font_size,
        };

        hierarchicalResult.words.push(ocrWord);
      }
    }

    // Extract symbols
    if (includeSymbols && result.data.symbols) {
      console.log(`[HierarchicalOCR] Processing ${result.data.symbols.length} symbols`);
      for (const symbol of result.data.symbols) {
        if (symbol.confidence < minConfidence) continue;

        const ocrSymbol: OCRSymbol = {
          level: 'symbol',
          bbox: symbol.bbox,
          text: symbol.text,
          confidence: symbol.confidence,
          baseline: symbol.baseline,
          choices: symbol.choices,
        };

        hierarchicalResult.symbols.push(ocrSymbol);
      }
    }

    console.log('[HierarchicalOCR] Extraction summary:', {
      blocks: hierarchicalResult.blocks.length,
      paragraphs: hierarchicalResult.paragraphs.length,
      lines: hierarchicalResult.lines.length,
      words: hierarchicalResult.words.length,
      symbols: hierarchicalResult.symbols.length,
    });

    return hierarchicalResult;
  }

  /**
   * Prepare canvas with optimal size for Tesseract
   */
  private prepareCanvas(imageData: ImageData): HTMLCanvasElement {
    const maxWidth = 1280;
    const maxHeight = 720;
    let { width, height } = imageData;
    
    let scaledWidth = width;
    let scaledHeight = height;
    
    if (width > maxWidth || height > maxHeight) {
      const scale = Math.min(maxWidth / width, maxHeight / height);
      scaledWidth = Math.floor(width * scale);
      scaledHeight = Math.floor(height * scale);
      console.log(`[HierarchicalOCR] Scaling from ${width}x${height} to ${scaledWidth}x${scaledHeight}`);
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    const ctx = canvas.getContext('2d')!;
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.putImageData(imageData, 0, 0);
    ctx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight);

    return canvas;
  }

  /**
   * Detect if text block contains code using enhanced detector
   */
  private async isCodeBlock(text: string): Promise<boolean> {
    if (!text || text.length < 10) return false;
    const result = await this.codeDetector.detect(text);
    return result.isCode;
  }

  /**
   * Get specific level of detection
   */
  async detectLevel(
    imageData: ImageData,
    level: 'block' | 'paragraph' | 'line' | 'word' | 'symbol',
    options: DetectionOptions = {}
  ): Promise<Array<OCRBlock | OCRParagraph | OCRLine | OCRWord | OCRSymbol>> {
    const result = await this.detect(imageData, options);
    
    switch (level) {
      case 'block':
        return result.blocks;
      case 'paragraph':
        return result.paragraphs;
      case 'line':
        return result.lines;
      case 'word':
        return result.words;
      case 'symbol':
        return result.symbols;
      default:
        return [];
    }
  }

  /**
   * Get bounding box dimensions
   */
  getBBoxDimensions(bbox: BoundingBox): { x: number; y: number; width: number; height: number } {
    return {
      x: bbox.x0,
      y: bbox.y0,
      width: bbox.x1 - bbox.x0,
      height: bbox.y1 - bbox.y0,
    };
  }

  private getEmptyResult(): HierarchicalOCRResult {
    return {
      blocks: [],
      paragraphs: [],
      lines: [],
      words: [],
      symbols: [],
      fullText: '',
      confidence: 0,
      processingTime: 0,
    };
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      this.cachedResult = null;
      console.log('[HierarchicalOCR] Terminated');
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  clearCache(): void {
    this.cachedResult = null;
    this.lastProcessTime = 0;
    console.log('[HierarchicalOCR] Cache cleared');
  }
}
