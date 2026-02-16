import { ScreenCapture } from './screenCapture';
import { SmartLayoutDetector } from './smartLayoutDetector';
import { OCRProcessor } from './ocrProcessor';
import { OverlayRenderer } from './overlay';
import { CONFIG } from './config';
import type { Settings, Stats, Detection } from './types';

class App {
  private screenCapture: ScreenCapture;
  private layoutDetector: SmartLayoutDetector;
  private ocrProcessor: OCRProcessor;
  private overlay: OverlayRenderer;
  private settings: Settings;
  private stats: Stats;
  private isRunning = false;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;
  private frameCount = 0;
  private fpsUpdateTime = 0;
  private processedRegions = new Set<string>(); // Track which regions we've OCR'd
  private showBounds = true; // Toggle for showing bounds

  // DOM elements
  private startBtn: HTMLButtonElement;
  private stopBtn: HTMLButtonElement;
  private videoElement: HTMLVideoElement;
  private displayCanvas: HTMLCanvasElement;
  private placeholder: HTMLElement;
  private loading: HTMLElement;
  private statsElement: HTMLElement;

  constructor() {
    // Initialize DOM elements
    this.startBtn = document.getElementById('startBtn') as HTMLButtonElement;
    this.stopBtn = document.getElementById('stopBtn') as HTMLButtonElement;
    this.videoElement = document.getElementById('videoElement') as HTMLVideoElement;
    this.displayCanvas = document.getElementById('displayCanvas') as HTMLCanvasElement;
    this.placeholder = document.getElementById('placeholder') as HTMLElement;
    this.loading = document.getElementById('loading') as HTMLElement;
    this.statsElement = document.getElementById('stats') as HTMLElement;

    // Initialize settings
    this.settings = {
      showLabels: true,
      showConfidence: true,
      enableOCR: false,
      confidenceThreshold: CONFIG.CONFIDENCE_THRESHOLD,
    };

    // Initialize stats
    this.stats = {
      fps: 0,
      latency: 0,
      detectionCount: 0,
      modelLoaded: false,
    };

    // Initialize components
    this.screenCapture = new ScreenCapture(this.videoElement);
    this.layoutDetector = new SmartLayoutDetector();
    this.ocrProcessor = new OCRProcessor();
    this.overlay = new OverlayRenderer(this.displayCanvas, this.settings);

    this.setupEventListeners();
    this.initializeDetector();
  }

  private setupEventListeners(): void {
    // Start/Stop buttons
    this.startBtn.addEventListener('click', () => this.start());
    this.stopBtn.addEventListener('click', () => this.stop());

    // Show bounds toggle
    const showBoundsCheckbox = document.getElementById('showBounds') as HTMLInputElement;
    if (showBoundsCheckbox) {
      showBoundsCheckbox.addEventListener('change', (e) => {
        this.showBounds = (e.target as HTMLInputElement).checked;
      });
    }

    // Settings
    const showLabelsCheckbox = document.getElementById('showLabels') as HTMLInputElement;
    const showConfidenceCheckbox = document.getElementById('showConfidence') as HTMLInputElement;
    const enableOCRCheckbox = document.getElementById('enableOCR') as HTMLInputElement;
    const confidenceSlider = document.getElementById('confidenceThreshold') as HTMLInputElement;
    const confidenceValue = document.getElementById('confidenceValue') as HTMLSpanElement;

    showLabelsCheckbox.addEventListener('change', (e) => {
      this.settings.showLabels = (e.target as HTMLInputElement).checked;
      this.overlay.updateSettings(this.settings);
    });

    showConfidenceCheckbox.addEventListener('change', (e) => {
      this.settings.showConfidence = (e.target as HTMLInputElement).checked;
      this.overlay.updateSettings(this.settings);
    });

    enableOCRCheckbox.addEventListener('change', (e) => {
      this.settings.enableOCR = (e.target as HTMLInputElement).checked;
      this.overlay.updateSettings(this.settings);
    });

    confidenceSlider.addEventListener('input', (e) => {
      const value = parseFloat((e.target as HTMLInputElement).value);
      this.settings.confidenceThreshold = value;
      confidenceValue.textContent = value.toFixed(1);
      this.overlay.updateSettings(this.settings);
    });

    // Screen share ended
    window.addEventListener('screenshare-ended', () => {
      this.stop();
      alert('Screen sharing stopped');
    });
  }

  private async initializeDetector(): Promise<void> {
    // Layout detection doesn't need initialization
    this.stats.modelLoaded = true;
    this.updateStatsUI();
    console.log('✓ Layout detector ready');
  }

  private async start(): Promise<void> {
    if (this.isRunning) return;

    try {
      // Start screen capture
      await this.screenCapture.start();

      // Update UI
      this.isRunning = true;
      this.startBtn.disabled = true;
      this.stopBtn.disabled = false;
      this.placeholder.style.display = 'none';
      this.statsElement.style.display = 'block';

      // Start detection loop
      this.lastFrameTime = performance.now();
      this.fpsUpdateTime = performance.now();
      this.frameCount = 0;
      this.detectLoop();

      console.log('✓ Detection started');
    } catch (error) {
      console.error('Failed to start:', error);
      alert(`Failed to start: ${error}`);
      this.stop();
    }
  }

  private stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.screenCapture.stop();

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Update UI
    this.startBtn.disabled = false;
    this.stopBtn.disabled = true;
    this.placeholder.style.display = 'block';
    this.statsElement.style.display = 'none';
    this.overlay.clear();

    console.log('✓ Detection stopped');
  }

  private async detectLoop(): Promise<void> {
    if (!this.isRunning) return;

    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    const targetInterval = 1000 / CONFIG.DETECTION_FPS;

    if (elapsed >= targetInterval) {
      this.lastFrameTime = now;
      await this.processFrame();
      
      // Update FPS
      this.frameCount++;
      if (now - this.fpsUpdateTime >= 1000) {
        this.stats.fps = this.frameCount;
        this.frameCount = 0;
        this.fpsUpdateTime = now;
        this.updateStatsUI();
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.detectLoop());
  }

  private async processFrame(): Promise<void> {
    try {
      const startTime = performance.now();

      // Get frame from video
      const { width, height } = this.screenCapture.getStreamDimensions();
      if (width === 0 || height === 0) return;

      // Create temporary canvas for frame extraction
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d')!;
      tempCtx.drawImage(this.videoElement, 0, 0, width, height);

      // Get image data
      const imageData = tempCtx.getImageData(0, 0, width, height);

      // Detect layout regions
      const regions = this.layoutDetector.detectRegions(imageData);
      
      // Convert to detection format
      const detections: Detection[] = regions.map(region => ({
        label: region.type,
        confidence: region.confidence,
        x: region.x,
        y: region.y,
        width: region.width,
        height: region.height,
      }));

      // Update stats
      this.stats.latency = performance.now() - startTime;
      this.stats.detectionCount = detections.length;

      // Draw overlay only if showBounds is enabled
      if (this.showBounds) {
        this.overlay.drawDetections(detections, this.videoElement);
      } else {
        // Just show the video without boxes
        this.overlay.clear();
        const { videoWidth, videoHeight } = this.videoElement;
        this.overlay.canvas.width = videoWidth;
        this.overlay.canvas.height = videoHeight;
        this.overlay.ctx.drawImage(this.videoElement, 0, 0, videoWidth, videoHeight);
      }

    } catch (error) {
      console.error('Frame processing error:', error);
    }
  }

  private updateStatsUI(): void {
    const fpsElement = document.getElementById('fps');
    const latencyElement = document.getElementById('latency');
    const detectionsElement = document.getElementById('detections');
    const modelElement = document.getElementById('model');

    if (fpsElement) fpsElement.textContent = this.stats.fps.toFixed(1);
    if (latencyElement) latencyElement.textContent = `${this.stats.latency.toFixed(0)}ms`;
    if (detectionsElement) detectionsElement.textContent = this.stats.detectionCount.toString();
    if (modelElement) {
      modelElement.textContent = 'Layout Detection';
    }
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new App());
} else {
  new App();
}
