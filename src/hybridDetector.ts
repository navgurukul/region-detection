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
  private cachedRegions: HybridRegion[] = [];
  private lastProcessTime = 0;
  private processingInterval = 3000; // Process with Tesseract every 3 seconds
  private isProcessing = false;

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
    if (!this.isInitialized || !this.worker) {
      console.warn('[Hybrid] Tesseract not ready');
      return [];
    }

    const now = Date.now();
    
    // If we're currently processing, return cached results
    if (this.isProcessing) {
      return this.cachedRegions;
    }
    
    // Use Tesseract only every N seconds (it's slow)
    if (now - this.lastProcessTime < this.processingInterval) {
      return this.cachedRegions;
    }

    // Start new Tesseract processing
    this.lastProcessTime = now;
    this.isProcessing = true;
    
    try {
      const regions = await this.fullTesseractDetection(imageData);
      this.cachedRegions = regions;
      return regions;
    } finally {
      this.isProcessing = false;
    }
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
      return [];
    }

    try {
      console.log('[Hybrid] Running Tesseract analysis...');
      
      // Resize image for faster processing (Tesseract is slow on large images)
      const maxWidth = 1280;
      const maxHeight = 720;
      let { width, height } = imageData;
      
      let scaledWidth = width;
      let scaledHeight = height;
      
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        scaledWidth = Math.floor(width * scale);
        scaledHeight = Math.floor(height * scale);
        console.log(`[Hybrid] Scaling from ${width}x${height} to ${scaledWidth}x${scaledHeight}`);
      }
      
      // Convert ImageData to canvas
      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d')!;
      
      // Draw scaled image
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.putImageData(imageData, 0, 0);
      ctx.drawImage(tempCanvas, 0, 0, scaledWidth, scaledHeight);

      // Run Tesseract with layout analysis
      const startTime = Date.now();
      const result = await this.worker.recognize(canvas);
      const elapsed = Date.now() - startTime;
      console.log(`[Hybrid] Tesseract completed in ${elapsed}ms`);
      
      const regions: HybridRegion[] = [];
      const scaleX = width / scaledWidth;
      const scaleY = height / scaledHeight;

      // Process blocks (main text regions)
      if (result.data.blocks) {
        console.log(`[Hybrid] Found ${result.data.blocks.length} blocks`);
        
        for (const block of result.data.blocks) {
          const { x0, y0, x1, y1 } = block.bbox;
          const blockWidth = (x1 - x0) * scaleX;
          const blockHeight = (y1 - y0) * scaleY;

          // Filter small regions
          if (blockWidth < 80 || blockHeight < 40) continue;

          const text = block.text.trim();
          if (!text) continue;
          
          const isCode = this.isCodeBlock(text);

          regions.push({
            type: isCode ? 'code' : 'text',
            x: x0 * scaleX,
            y: y0 * scaleY,
            width: blockWidth,
            height: blockHeight,
            confidence: block.confidence / 100,
            text,
            isCode,
          });
        }
      }

      console.log(`[Hybrid] Returning ${regions.length} regions`);
      return regions;

    } catch (error) {
      console.error('[Hybrid] Tesseract error:', error);
      return [];
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
