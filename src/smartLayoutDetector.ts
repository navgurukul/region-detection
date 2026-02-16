/**
 * Smart Layout Detector - Uses edge detection to find actual window boundaries
 */

export interface LayoutRegion {
  type: 'window' | 'panel' | 'region';
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  area: number;
}

export class SmartLayoutDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  detectRegions(imageData: ImageData): LayoutRegion[] {
    const { width, height } = imageData;
    
    console.log(`[SmartLayout] Processing ${width}x${height} frame`);
    
    // Convert to grayscale
    const gray = this.toGrayscale(imageData);
    
    // Detect edges
    const edges = this.detectEdges(gray, width, height);
    
    // Find contours (rectangular regions)
    const regions = this.findContours(edges, width, height);
    
    console.log(`[SmartLayout] Found ${regions.length} regions`);
    
    return regions;
  }

  private toGrayscale(imageData: ImageData): Uint8Array {
    const { data, width, height } = imageData;
    const gray = new Uint8Array(width * height);
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      gray[i / 4] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    }
    
    return gray;
  }

  private detectEdges(gray: Uint8Array, width: number, height: number): Uint8Array {
    const edges = new Uint8Array(width * height);
    const threshold = 30;
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        // Simple gradient detection
        const gx = Math.abs(gray[idx + 1] - gray[idx - 1]);
        const gy = Math.abs(gray[idx + width] - gray[idx - width]);
        const gradient = gx + gy;
        
        edges[idx] = gradient > threshold ? 255 : 0;
      }
    }
    
    return edges;
  }

  private findContours(edges: Uint8Array, width: number, height: number): LayoutRegion[] {
    const regions: LayoutRegion[] = [];
    const minSize = 200; // Minimum region size
    const gridSize = 100; // Sample every 100 pixels
    
    // Sample grid to find potential regions
    for (let y = 0; y < height - minSize; y += gridSize) {
      for (let x = 0; x < width - minSize; x += gridSize) {
        // Check if this area has edges (potential window border)
        if (this.hasEdges(edges, x, y, width, height)) {
          // Try to find the full region
          const region = this.expandRegion(edges, x, y, width, height);
          
          if (region && region.width >= minSize && region.height >= minSize) {
            regions.push({
              type: 'window',
              x: region.x,
              y: region.y,
              width: region.width,
              height: region.height,
              confidence: 0.8,
              area: region.width * region.height,
            });
          }
        }
      }
    }
    
    // Remove overlapping regions
    return this.removeOverlaps(regions);
  }

  private hasEdges(edges: Uint8Array, x: number, y: number, width: number, height: number): boolean {
    let edgeCount = 0;
    const sampleSize = 50;
    
    // Check top edge
    for (let i = 0; i < sampleSize && x + i < width; i++) {
      if (edges[y * width + (x + i)] > 0) edgeCount++;
    }
    
    // Check left edge
    for (let i = 0; i < sampleSize && y + i < height; i++) {
      if (edges[(y + i) * width + x] > 0) edgeCount++;
    }
    
    return edgeCount > 10;
  }

  private expandRegion(
    edges: Uint8Array,
    startX: number,
    startY: number,
    width: number,
    height: number
  ): { x: number; y: number; width: number; height: number } | null {
    let x = startX;
    let y = startY;
    let w = 300;
    let h = 300;
    
    // Expand right
    for (let i = startX + 100; i < width; i += 50) {
      if (this.hasVerticalEdge(edges, i, startY, width, height)) {
        w = i - startX;
        break;
      }
    }
    
    // Expand down
    for (let i = startY + 100; i < height; i += 50) {
      if (this.hasHorizontalEdge(edges, startX, i, width, height)) {
        h = i - startY;
        break;
      }
    }
    
    if (w < 200 || h < 200) return null;
    
    return { x, y, width: w, height: h };
  }

  private hasVerticalEdge(edges: Uint8Array, x: number, y: number, width: number, height: number): boolean {
    let count = 0;
    for (let i = 0; i < 100 && y + i < height; i++) {
      if (edges[(y + i) * width + x] > 0) count++;
    }
    return count > 20;
  }

  private hasHorizontalEdge(edges: Uint8Array, x: number, y: number, width: number, height: number): boolean {
    let count = 0;
    for (let i = 0; i < 100 && x + i < width; i++) {
      if (edges[y * width + (x + i)] > 0) count++;
    }
    return count > 20;
  }

  private removeOverlaps(regions: LayoutRegion[]): LayoutRegion[] {
    const result: LayoutRegion[] = [];
    
    for (const region of regions) {
      let overlaps = false;
      
      for (const existing of result) {
        if (this.overlaps(region, existing)) {
          overlaps = true;
          break;
        }
      }
      
      if (!overlaps) {
        result.push(region);
      }
    }
    
    return result;
  }

  private overlaps(r1: LayoutRegion, r2: LayoutRegion): boolean {
    return !(
      r1.x + r1.width < r2.x ||
      r2.x + r2.width < r1.x ||
      r1.y + r1.height < r2.y ||
      r2.y + r2.height < r1.y
    );
  }
}
