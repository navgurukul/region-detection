/**
 * OCR Processor - Extracts text from regions using Tesseract.js
 */

import { createWorker, Worker } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  isCode: boolean;
}

export class OCRProcessor {
  private worker: Worker | null = null;
  private isReady = false;

  async initialize(): Promise<void> {
    try {
      console.log('[OCR] Initializing Tesseract...');
      this.worker = await createWorker('eng');
      this.isReady = true;
      console.log('[OCR] Tesseract ready');
    } catch (error) {
      console.error('[OCR] Failed to initialize:', error);
      throw error;
    }
  }

  async extractText(imageData: ImageData, x: number, y: number, width: number, height: number): Promise<OCRResult> {
    if (!this.isReady || !this.worker) {
      return { text: '', confidence: 0, isCode: false };
    }

    try {
      // Create canvas with region
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      
      // Extract region from full image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = imageData.width;
      tempCanvas.height = imageData.height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(imageData, 0, 0);
      
      // Copy region
      ctx.drawImage(tempCanvas, x, y, width, height, 0, 0, width, height);
      
      // Run OCR
      const { data } = await this.worker.recognize(canvas);
      const text = data.text.trim();
      const confidence = data.confidence / 100;
      
      // Detect if it's code
      const isCode = this.detectCode(text);
      
      return { text, confidence, isCode };
    } catch (error) {
      console.error('[OCR] Extraction failed:', error);
      return { text: '', confidence: 0, isCode: false };
    }
  }

  private detectCode(text: string): boolean {
    if (!text || text.length < 10) return false;

    // Code indicators
    const codePatterns = [
      /function\s+\w+\s*\(/,           // function declarations
      /const\s+\w+\s*=/,               // const declarations
      /let\s+\w+\s*=/,                 // let declarations
      /var\s+\w+\s*=/,                 // var declarations
      /class\s+\w+/,                   // class declarations
      /import\s+.*from/,               // imports
      /export\s+(default|const|class)/, // exports
      /if\s*\(.*\)\s*\{/,              // if statements
      /for\s*\(.*\)\s*\{/,             // for loops
      /while\s*\(.*\)\s*\{/,           // while loops
      /=>\s*\{/,                       // arrow functions
      /\w+\.\w+\(/,                    // method calls
      /console\.(log|error|warn)/,     // console statements
      /return\s+/,                     // return statements
      /<\w+.*>/,                       // HTML/JSX tags
      /def\s+\w+\s*\(/,                // Python functions
      /public\s+class/,                // Java classes
      /\#include\s*</,                 // C/C++ includes
    ];

    // Check for code patterns
    const hasCodePattern = codePatterns.some(pattern => pattern.test(text));
    
    // Check for code-like characteristics
    const hasBraces = (text.match(/[{}]/g) || []).length > 2;
    const hasSemicolons = (text.match(/;/g) || []).length > 2;
    const hasParentheses = (text.match(/[()]/g) || []).length > 3;
    const hasIndentation = /^\s{2,}/m.test(text);
    
    return hasCodePattern || (hasBraces && (hasSemicolons || hasParentheses || hasIndentation));
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isReady = false;
    }
  }

  getIsReady(): boolean {
    return this.isReady;
  }
}
