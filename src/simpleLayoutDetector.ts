/**
 * Simple Layout Detector - Uses grid-based sampling to find distinct regions
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

export class SimpleLayoutDetector {
  /**
   * Detect regions by dividing screen into grid and finding distinct areas
   */
  detectRegions(imageData: ImageData): LayoutRegion[] {
    const { width, height } = imageData;
    
    console.log(`[SimpleLayout] Processing ${width}x${height} frame`);
    
    // Create a simple grid of regions
    const regions: LayoutRegion[] = [];
    
    // Divide screen into 2x2 grid (4 quadrants)
    const gridCols = 2;
    const gridRows = 2;
    const cellWidth = Math.floor(width / gridCols);
    const cellHeight = Math.floor(height / gridRows);
    
    for (let row = 0; row < gridRows; row++) {
      for (let col = 0; col < gridCols; col++) {
        const x = col * cellWidth;
        const y = row * cellHeight;
        
        // Check if this region has content (not blank)
        if (this.hasContent(imageData, x, y, cellWidth, cellHeight)) {
          regions.push({
            type: 'region',
            x,
            y,
            width: cellWidth,
            height: cellHeight,
            confidence: 0.9,
            area: cellWidth * cellHeight,
          });
        }
      }
    }
    
    // Also try to detect full-screen window
    if (this.hasContent(imageData, 0, 0, width, height)) {
      regions.push({
        type: 'window',
        x: Math.floor(width * 0.05),
        y: Math.floor(height * 0.05),
        width: Math.floor(width * 0.9),
        height: Math.floor(height * 0.9),
        confidence: 0.8,
        area: width * height * 0.81,
      });
    }
    
    console.log(`[SimpleLayout] Found ${regions.length} regions`);
    
    return regions;
  }
  
  /**
   * Check if region has content (not blank/uniform)
   */
  private hasContent(imageData: ImageData, x: number, y: number, w: number, h: number): boolean {
    const { data, width } = imageData;
    
    // Sample a few points in the region
    const samples = 20;
    let variance = 0;
    let avgR = 0, avgG = 0, avgB = 0;
    
    for (let i = 0; i < samples; i++) {
      const sx = x + Math.floor(Math.random() * w);
      const sy = y + Math.floor(Math.random() * h);
      const idx = (sy * width + sx) * 4;
      
      avgR += data[idx];
      avgG += data[idx + 1];
      avgB += data[idx + 2];
    }
    
    avgR /= samples;
    avgG /= samples;
    avgB /= samples;
    
    // Calculate variance
    for (let i = 0; i < samples; i++) {
      const sx = x + Math.floor(Math.random() * w);
      const sy = y + Math.floor(Math.random() * h);
      const idx = (sy * width + sx) * 4;
      
      const dr = data[idx] - avgR;
      const dg = data[idx + 1] - avgG;
      const db = data[idx + 2] - avgB;
      
      variance += dr * dr + dg * dg + db * db;
    }
    
    variance /= samples;
    
    // If variance is high, there's content
    return variance > 100;
  }
}
