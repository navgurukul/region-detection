/**
 * Tesseract-based Layout Detector
 * Uses Tesseract.js built-in layout analysis to detect text regions
 */

import Tesseract, { createWorker } from 'tesseract.js';

export interface TesseractRegion {
  type: 'text' | 'code' | 'ui';
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  text: string;
  isCode: boolean;
}

export class TesseractLayoutDetector {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[Tesseract] Initializing...');
    
    this.worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[Tesseract] Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Set page segmentation mode for better layout detection
    // PSM 11 = Sparse text. Find as much text as possible in no particular order.
    await this.worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
    });

    this.isInitialized = true;
    console.log('[Tesseract] Ready!');
  }

  async detectRegions(imageData: ImageData): Promise<TesseractRegion[]> {
    if (!this.worker || !this.isInitialized) {
      console.warn('[Tesseract] Not initialized');
      return [];
    }

    try {
      // Convert ImageData to canvas for Tesseract
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);

      // Run Tesseract OCR with layout analysis
      const result = await this.worker.recognize(canvas);

      // Extract blocks (text regions)
      const regions: TesseractRegion[] = [];

      // Process blocks (largest text regions)
      if (result.data.blocks) {
        for (const block of result.data.blocks) {
          const { x0, y0, x1, y1 } = block.bbox;
          const width = x1 - x0;
          const height = y1 - y0;

          // Filter out tiny regions
          if (width < 100 || height < 50) continue;

          const text = block.text.trim();
          const isCode = this.detectCode(text);

          regions.push({
            type: isCode ? 'code' : 'text',
            x: x0,
            y: y0,
            width,
            height,
            confidence: block.confidence / 100,
            text,
            isCode,
          });
        }
      }

      console.log(`[Tesseract] Found ${regions.length} text regions`);
      return regions;

    } catch (error) {
      console.error('[Tesseract] Detection error:', error);
      return [];
    }
  }

  private detectCode(text: string): boolean {
    // Code detection heuristics
    const codeIndicators = [
      /function\s+\w+\s*\(/,           // function declarations
      /const\s+\w+\s*=/,               // const declarations
      /let\s+\w+\s*=/,                 // let declarations
      /var\s+\w+\s*=/,                 // var declarations
      /class\s+\w+/,                   // class declarations
      /import\s+.*from/,               // imports
      /export\s+(default|const|class)/, // exports
      /if\s*\(/,                       // if statements
      /for\s*\(/,                      // for loops
      /while\s*\(/,                    // while loops
      /\{[\s\S]*\}/,                   // code blocks
      /=>/,                            // arrow functions
      /console\./,                     // console statements
      /\w+\.\w+\(/,                    // method calls
      /\/\//,                          // comments
      /\/\*/,                          // block comments
    ];

    // Check for code patterns
    for (const pattern of codeIndicators) {
      if (pattern.test(text)) return true;
    }

    // Check for high density of special characters (typical in code)
    const specialChars = text.match(/[{}()\[\];:=<>]/g);
    const specialCharRatio = specialChars ? specialChars.length / text.length : 0;
    
    return specialCharRatio > 0.15; // More than 15% special chars = likely code
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('[Tesseract] Terminated');
    }
  }
}
