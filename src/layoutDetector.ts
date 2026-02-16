/**
 * Layout Detector - Detects UI regions, windows, and panels
 * Uses computer vision techniques to find rectangular regions
 */

export interface LayoutRegion {
  type: 'window' | 'panel' | 'sidebar' | 'header' | 'footer' | 'unknown';
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  area: number;
}

export class LayoutDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  /**
   * Detect UI regions in a frame using edge detection and contour finding
   */
  detectRegions(imageData: ImageData): LayoutRegion[] {
    const { width, height } = imageData;
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx.putImageData(imageData, 0, 0);

    console.log(`[Layout] Processing frame: ${width}x${height}`);

    // Convert to grayscale
    const gray = this.toGrayscale(imageData);
    
    // Apply edge detection
    const edges = this.detectEdges(gray, width, height);
    
    // Find rectangular regions
    const regions = this.findRectangularRegions(edges, width, height);
    
    console.log(`[Layout] Found ${regions.length} regions`);
    
    // Classify regions by size and position
    const classified = this.classifyRegions(regions, width, height);
    
    console.log(`[Layout] Classified regions:`, classified);
    
    return classified;
  }

  /**
   * Convert image to grayscale
   */
  private toGrayscale(imageData: ImageData): Uint8ClampedArray {
    const { data, width, height } = imageData;
    const gray = new Uint8ClampedArray(width * height);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    return gray;
  }

  /**
   * Simple edge detection using Sobel operator
   */
  private detectEdges(gray: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
    const edges = new Uint8ClampedArray(width * height);
    
    // Sobel kernels
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0;
        let gy = 0;
        
        // Apply Sobel kernels
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = (y + ky) * width + (x + kx);
            const kernelIdx = (ky + 1) * 3 + (kx + 1);
            gx += gray[idx] * sobelX[kernelIdx];
            gy += gray[idx] * sobelY[kernelIdx];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * width + x] = magnitude > 50 ? 255 : 0;
      }
    }
    
    return edges;
  }

  /**
   * Find rectangular regions using a grid-based approach
   */
  private findRectangularRegions(edges: Uint8ClampedArray, width: number, height: number): LayoutRegion[] {
    const regions: LayoutRegion[] = [];
    const minSize = 100; // Minimum region size
    const gridSize = 50; // Grid cell size for sampling
    
    // Sample grid points to find potential regions
    for (let y = 0; y < height - minSize; y += gridSize) {
      for (let x = 0; x < width - minSize; x += gridSize) {
        // Check if this could be a window corner
        const hasEdges = this.hasStrongEdges(edges, x, y, width, height);
        
        if (hasEdges) {
          // Try to expand to find full region
          const region = this.expandRegion(edges, x, y, width, height);
          
          if (region && region.width >= minSize && region.height >= minSize) {
            regions.push({
              ...region,
              type: 'unknown',
              confidence: 0.8,
              area: region.width * region.height,
            });
          }
        }
      }
    }
    
    // Merge overlapping regions
    return this.mergeOverlappingRegions(regions);
  }

  /**
   * Check if area has strong edges (potential window border)
   */
  private hasStrongEdges(edges: Uint8ClampedArray, x: number, y: number, width: number, height: number): boolean {
    const checkSize = 20;
    let edgeCount = 0;
    
    for (let dy = 0; dy < checkSize && y + dy < height; dy++) {
      for (let dx = 0; dx < checkSize && x + dx < width; dx++) {
        if (edges[(y + dy) * width + (x + dx)] > 0) {
          edgeCount++;
        }
      }
    }
    
    return edgeCount > checkSize * 2; // At least 2 edges per dimension
  }

  /**
   * Expand region from seed point
   */
  private expandRegion(
    edges: Uint8ClampedArray,
    startX: number,
    startY: number,
    width: number,
    height: number
  ): { x: number; y: number; width: number; height: number } | null {
    // Simple expansion: look for edge boundaries
    let minX = startX;
    let maxX = startX + 100;
    let minY = startY;
    let maxY = startY + 100;
    
    // Expand right
    for (let x = startX; x < width; x += 10) {
      if (this.hasVerticalEdge(edges, x, startY, width, height)) {
        maxX = x;
        break;
      }
    }
    
    // Expand down
    for (let y = startY; y < height; y += 10) {
      if (this.hasHorizontalEdge(edges, startX, y, width, height)) {
        maxY = y;
        break;
      }
    }
    
    const regionWidth = maxX - minX;
    const regionHeight = maxY - minY;
    
    if (regionWidth < 100 || regionHeight < 100) {
      return null;
    }
    
    return {
      x: minX,
      y: minY,
      width: regionWidth,
      height: regionHeight,
    };
  }

  /**
   * Check for vertical edge
   */
  private hasVerticalEdge(edges: Uint8ClampedArray, x: number, y: number, width: number, height: number): boolean {
    let edgeCount = 0;
    for (let dy = 0; dy < 50 && y + dy < height; dy++) {
      if (edges[(y + dy) * width + x] > 0) {
        edgeCount++;
      }
    }
    return edgeCount > 10;
  }

  /**
   * Check for horizontal edge
   */
  private hasHorizontalEdge(edges: Uint8ClampedArray, x: number, y: number, width: number, height: number): boolean {
    let edgeCount = 0;
    for (let dx = 0; dx < 50 && x + dx < width; dx++) {
      if (edges[y * width + (x + dx)] > 0) {
        edgeCount++;
      }
    }
    return edgeCount > 10;
  }

  /**
   * Merge overlapping regions
   */
  private mergeOverlappingRegions(regions: LayoutRegion[]): LayoutRegion[] {
    const merged: LayoutRegion[] = [];
    const used = new Set<number>();
    
    for (let i = 0; i < regions.length; i++) {
      if (used.has(i)) continue;
      
      let current = regions[i];
      
      for (let j = i + 1; j < regions.length; j++) {
        if (used.has(j)) continue;
        
        if (this.regionsOverlap(current, regions[j])) {
          current = this.mergeRegions(current, regions[j]);
          used.add(j);
        }
      }
      
      merged.push(current);
    }
    
    return merged;
  }

  /**
   * Check if two regions overlap
   */
  private regionsOverlap(r1: LayoutRegion, r2: LayoutRegion): boolean {
    return !(
      r1.x + r1.width < r2.x ||
      r2.x + r2.width < r1.x ||
      r1.y + r1.height < r2.y ||
      r2.y + r2.height < r1.y
    );
  }

  /**
   * Merge two regions
   */
  private mergeRegions(r1: LayoutRegion, r2: LayoutRegion): LayoutRegion {
    const minX = Math.min(r1.x, r2.x);
    const minY = Math.min(r1.y, r2.y);
    const maxX = Math.max(r1.x + r1.width, r2.x + r2.width);
    const maxY = Math.max(r1.y + r1.height, r2.y + r2.height);
    
    return {
      type: r1.type,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      confidence: Math.max(r1.confidence, r2.confidence),
      area: (maxX - minX) * (maxY - minY),
    };
  }

  /**
   * Classify regions based on size and position
   */
  private classifyRegions(regions: LayoutRegion[], screenWidth: number, screenHeight: number): LayoutRegion[] {
    return regions.map(region => {
      const { x, y, width, height } = region;
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      const aspectRatio = width / height;
      
      // Classify based on position and size
      let type: LayoutRegion['type'] = 'unknown';
      
      // Header: top of screen, wide
      if (y < screenHeight * 0.1 && width > screenWidth * 0.5 && height < screenHeight * 0.15) {
        type = 'header';
      }
      // Footer: bottom of screen, wide
      else if (y > screenHeight * 0.85 && width > screenWidth * 0.5 && height < screenHeight * 0.15) {
        type = 'footer';
      }
      // Sidebar: narrow and tall
      else if (aspectRatio < 0.5 && height > screenHeight * 0.4) {
        type = 'sidebar';
      }
      // Panel: medium sized
      else if (width > 200 && height > 200 && width < screenWidth * 0.8 && height < screenHeight * 0.8) {
        type = 'panel';
      }
      // Window: large region
      else if (width > screenWidth * 0.3 && height > screenHeight * 0.3) {
        type = 'window';
      }
      
      return {
        ...region,
        type,
      };
    });
  }
}
