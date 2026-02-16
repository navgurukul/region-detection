/**
 * Manual Region Selector - Let users draw regions manually
 */

export interface LayoutRegion {
  type: 'window' | 'panel' | 'region';
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  area: number;
  id: string;
}

export class ManualRegionSelector {
  private regions: LayoutRegion[] = [];
  private canvas: HTMLCanvasElement | null = null;
  private isDrawing = false;
  private startX = 0;
  private startY = 0;
  private currentRegion: LayoutRegion | null = null;

  constructor() {
    // Load saved regions from localStorage
    this.loadRegions();
  }

  /**
   * Enable manual drawing mode
   */
  enableDrawing(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  /**
   * Disable manual drawing mode
   */
  disableDrawing(): void {
    if (this.canvas) {
      this.canvas.removeEventListener('mousedown', this.onMouseDown.bind(this));
      this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
      this.canvas.removeEventListener('mouseup', this.onMouseUp.bind(this));
      this.canvas = null;
    }
  }

  private onMouseDown(e: MouseEvent): void {
    if (!this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    this.startX = e.clientX - rect.left;
    this.startY = e.clientY - rect.top;
    this.isDrawing = true;
  }

  private onMouseMove(e: MouseEvent): void {
    if (!this.isDrawing || !this.canvas) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    // Update current region preview
    this.currentRegion = {
      type: 'region',
      x: Math.min(this.startX, currentX),
      y: Math.min(this.startY, currentY),
      width: Math.abs(currentX - this.startX),
      height: Math.abs(currentY - this.startY),
      confidence: 1.0,
      area: 0,
      id: Date.now().toString(),
    };
    
    this.currentRegion.area = this.currentRegion.width * this.currentRegion.height;
  }

  private onMouseUp(e: MouseEvent): void {
    if (!this.isDrawing || !this.currentRegion) return;
    
    this.isDrawing = false;
    
    // Only save if region is large enough
    if (this.currentRegion.width > 50 && this.currentRegion.height > 50) {
      this.regions.push(this.currentRegion);
      this.saveRegions();
      console.log('[Manual] Added region:', this.currentRegion);
    }
    
    this.currentRegion = null;
  }

  /**
   * Get all defined regions
   */
  getRegions(): LayoutRegion[] {
    return [...this.regions];
  }

  /**
   * Clear all regions
   */
  clearRegions(): void {
    this.regions = [];
    this.saveRegions();
  }

  /**
   * Remove a specific region
   */
  removeRegion(id: string): void {
    this.regions = this.regions.filter(r => r.id !== id);
    this.saveRegions();
  }

  /**
   * Save regions to localStorage
   */
  private saveRegions(): void {
    try {
      localStorage.setItem('screen-regions', JSON.stringify(this.regions));
    } catch (error) {
      console.error('[Manual] Failed to save regions:', error);
    }
  }

  /**
   * Load regions from localStorage
   */
  private loadRegions(): void {
    try {
      const saved = localStorage.getItem('screen-regions');
      if (saved) {
        this.regions = JSON.parse(saved);
        console.log('[Manual] Loaded', this.regions.length, 'saved regions');
      }
    } catch (error) {
      console.error('[Manual] Failed to load regions:', error);
    }
  }

  /**
   * Get current drawing region (for preview)
   */
  getCurrentRegion(): LayoutRegion | null {
    return this.currentRegion;
  }
}
