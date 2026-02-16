import type { Detection, Settings } from './types';
import { CONFIG } from './config';

export class OverlayRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private settings: Settings;

  constructor(canvas: HTMLCanvasElement, settings: Settings) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.settings = settings;
  }

  updateSettings(settings: Partial<Settings>): void {
    this.settings = { ...this.settings, ...settings };
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawDetections(detections: Detection[], videoElement: HTMLVideoElement): void {
    // Update canvas size to match video
    const { videoWidth, videoHeight } = videoElement;
    if (this.canvas.width !== videoWidth || this.canvas.height !== videoHeight) {
      this.canvas.width = videoWidth;
      this.canvas.height = videoHeight;
    }

    // Clear previous frame
    this.clear();

    // Draw video frame
    this.ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

    // Filter by confidence threshold
    const filtered = detections.filter(
      d => d.confidence >= this.settings.confidenceThreshold
    );

    // Draw each detection
    for (const detection of filtered) {
      this.drawBox(detection);
      
      if (this.settings.showLabels) {
        this.drawLabel(detection);
      }
    }
  }

  private drawBox(detection: Detection): void {
    const { x, y, width, height } = detection;

    // Draw bounding box
    this.ctx.strokeStyle = CONFIG.BOX_COLOR;
    this.ctx.lineWidth = CONFIG.BOX_THICKNESS;
    this.ctx.strokeRect(x, y, width, height);

    // Draw corner accents for better visibility
    const cornerLength = 15;
    this.ctx.lineWidth = CONFIG.BOX_THICKNESS + 1;
    
    // Top-left
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + cornerLength);
    this.ctx.lineTo(x, y);
    this.ctx.lineTo(x + cornerLength, y);
    this.ctx.stroke();

    // Top-right
    this.ctx.beginPath();
    this.ctx.moveTo(x + width - cornerLength, y);
    this.ctx.lineTo(x + width, y);
    this.ctx.lineTo(x + width, y + cornerLength);
    this.ctx.stroke();

    // Bottom-left
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height - cornerLength);
    this.ctx.lineTo(x, y + height);
    this.ctx.lineTo(x + cornerLength, y + height);
    this.ctx.stroke();

    // Bottom-right
    this.ctx.beginPath();
    this.ctx.moveTo(x + width - cornerLength, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.lineTo(x + width, y + height - cornerLength);
    this.ctx.stroke();
  }

  private drawLabel(detection: Detection): void {
    const { x, y, label, confidence, text } = detection;

    // Prepare label text
    let labelText = label;
    if (this.settings.showConfidence) {
      labelText += ` ${(confidence * 100).toFixed(0)}%`;
    }
    if (text && this.settings.enableOCR) {
      labelText += ` | ${text.substring(0, 20)}`;
    }

    // Measure text
    this.ctx.font = `${CONFIG.FONT_SIZE}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    const metrics = this.ctx.measureText(labelText);
    const textWidth = metrics.width;
    const textHeight = CONFIG.FONT_SIZE;

    // Draw label background
    const padding = CONFIG.LABEL_PADDING;
    const labelX = x;
    const labelY = y - textHeight - padding * 2;
    const labelWidth = textWidth + padding * 2;
    const labelHeight = textHeight + padding * 2;

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

    // Draw label border
    this.ctx.strokeStyle = CONFIG.BOX_COLOR;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

    // Draw label text
    this.ctx.fillStyle = CONFIG.BOX_COLOR;
    this.ctx.fillText(labelText, labelX + padding, labelY + textHeight);
  }

  drawStats(stats: { fps: number; latency: number; count: number }): void {
    const x = 10;
    const y = 30;
    const lineHeight = 20;

    this.ctx.font = '14px monospace';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x - 5, y - 20, 200, lineHeight * 3 + 10);

    this.ctx.fillStyle = CONFIG.BOX_COLOR;
    this.ctx.fillText(`FPS: ${stats.fps.toFixed(1)}`, x, y);
    this.ctx.fillText(`Latency: ${stats.latency.toFixed(0)}ms`, x, y + lineHeight);
    this.ctx.fillText(`Detections: ${stats.count}`, x, y + lineHeight * 2);
  }

  blurRegion(x: number, y: number, width: number, height: number): void {
    const imageData = this.ctx.getImageData(x, y, width, height);
    const blurred = this.applyGaussianBlur(imageData);
    this.ctx.putImageData(blurred, x, y);
  }

  private applyGaussianBlur(imageData: ImageData): ImageData {
    // Simple box blur approximation
    const { data, width, height } = imageData;
    const output = new Uint8ClampedArray(data);
    const radius = 5;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, count = 0;

        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              r += data[idx];
              g += data[idx + 1];
              b += data[idx + 2];
              count++;
            }
          }
        }

        const idx = (y * width + x) * 4;
        output[idx] = r / count;
        output[idx + 1] = g / count;
        output[idx + 2] = b / count;
      }
    }

    return new ImageData(output, width, height);
  }
}
