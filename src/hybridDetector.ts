/**
 * Hybrid Detector - Combines edge detection + Tesseract layout analysis
 * Uses Tesseract's built-in block detection for better accuracy
 */

import Tesseract, { createWorker } from 'tesseract.js';

export interface HybridRegion {
  type: 'window' | 'text' | 'code' | 'ui';
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  text?: string;
  isCode?: boolean;
}

export class HybridDetector {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;
  private lastProcessTime = 0;
  private processingInterval = 2000; // Process with Tesseract every 2 seconds

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('[Hybrid] Initializing Tesseract...');
    
    this.worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`[Hybrid] OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Use automatic page segmentation with OSD
    await this.worker.setParameters({
      tessedit_pageseg_mode: Tesseract.PSM.AUTO_OSD,
    });

    this.isInitialized = true;
    console.log('[Hybrid] Ready!');
  }

  async detectRegions(imageData: ImageData): Promise<HybridRegion[]> {
    const now = Date.now();
    
    // Use Tesseract only every N seconds (it's slow)
    if (now - this.lastProcessTime < this.processingInterval) {
      return this.quickEdgeDetection(imageData);
    }

    this.lastProcessTime = now;
    return this.fullTesseractDetection(imageData);
  }

  /**
   * Quick edge-based detection for real-time performance
   */
  private quickEdgeDetection(imageData: ImageData): HybridRegion[] {
    const { width, height } = imageData;
    const regions: HybridRegion[] = [];

    // Simple grid-based sampling
    const gridSize = 300;
    
    for (let y = 0; y < height - gridSize; y += gridSize) {
      for (let x = 0; x < width - gridSize; x += gridSize) {
        regions.push({
          type: 'window',
          x,
          y,
          width: gridSize,
          height: gridSize,
          confidence: 0.5,
        });
      }
    }

    return regions;
  }

  /**
   * Full Tesseract-based detection with layout analysis
   */
  private async fullTesseractDetection(imageData: ImageData): Promise<HybridRegion[]> {
    if (!this.worker || !this.isInitialized) {
      return this.quickEdgeDetection(imageData);
    }

    try {
      console.log('[Hybrid] Running full Tesseract analysis...');
      
      // Convert ImageData to canvas
      const canvas = document.createElement('canvas');
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      const ctx = canvas.getContext('2d')!;
      ctx.putImageData(imageData, 0, 0);

      // Run Tesseract with layout analysis
      const result = await this.worker.recognize(canvas);
      const regions: HybridRegion[] = [];

      // Process blocks (main text regions)
      if (result.data.blocks) {
        console.log(`[Hybrid] Found ${result.data.blocks.length} blocks`);
        
        for (const block of result.data.blocks) {
          const { x0, y0, x1, y1 } = block.bbox;
          const width = x1 - x0;
          const height = y1 - y0;

          // Filter small regions
          if (width < 80 || height < 40) continue;

          const text = block.text.trim();
          const isCode = this.isCodeBlock(text);

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

      // Also check paragraphs for finer granularity
      if (result.data.paragraphs && regions.length < 3) {
        console.log(`[Hybrid] Adding ${result.data.paragraphs.length} paragraphs`);
        
        for (const para of result.data.paragraphs) {
          const { x0, y0, x1, y1 } = para.bbox;
          const width = x1 - x0;
          const height = y1 - y0;

          if (width < 80 || height < 40) continue;

          const text = para.text.trim();
          const isCode = this.isCodeBlock(text);

          regions.push({
            type: isCode ? 'code' : 'text',
            x: x0,
            y: y0,
            width,
            height,
            confidence: para.confidence / 100,
            text,
            isCode,
          });
        }
      }

      console.log(`[Hybrid] Returning ${regions.length} regions`);
      return regions.length > 0 ? regions : this.quickEdgeDetection(imageData);

    } catch (error) {
      console.error('[Hybrid] Tesseract error:', error);
      return this.quickEdgeDetection(imageData);
    }
  }

  /**
   * Detect if text block contains code
   */
  private isCodeBlock(text: string): boolean {
    if (!text || text.length < 10) return false;

    // Code patterns
    const codePatterns = [
      /function\s+\w+/,
      /const\s+\w+\s*=/,
      /let\s+\w+\s*=/,
      /var\s+\w+\s*=/,
      /class\s+\w+/,
      /import\s+.*from/,
      /export\s+(default|const)/,
      /if\s*\(/,
      /for\s*\(/,
      /while\s*\(/,
      /=>/,
      /console\./,
      /\w+\.\w+\(/,
    ];

    for (const pattern of codePatterns) {
      if (pattern.test(text)) return true;
    }

    // Check special character density
    const specialChars = text.match(/[{}()\[\];:=<>]/g);
    const ratio = specialChars ? specialChars.length / text.length : 0;
    
    return ratio > 0.12;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
    }
  }
}
