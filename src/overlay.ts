import type { Detection, Settings } from './types';

export class OverlayRenderer {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
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

    console.log(`[Overlay] Drawing ${detections.length} detections`);

    // Draw each detection
    for (const detection of detections) {
      this.drawBox(detection);
      this.drawLabel(detection);
    }
  }

  private drawBox(detection: Detection): void {
    const { x, y, width, height, isCode } = detection;

    // Choose color based on content type
    let boxColor = '#2196F3'; // Blue for regular regions
    let fillColor = 'rgba(33, 150, 243, 0.1)';
    
    if (isCode) {
      boxColor = '#4CAF50'; // Green for code
      fillColor = 'rgba(76, 175, 80, 0.15)';
    }

    // Draw semi-transparent fill
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(x, y, width, height);

    // Draw thick border
    this.ctx.strokeStyle = boxColor;
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(x, y, width, height);

    // Draw corner markers for better visibility
    const cornerSize = 20;
    this.ctx.lineWidth = 6;
    
    // Top-left
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + cornerSize);
    this.ctx.lineTo(x, y);
    this.ctx.lineTo(x + cornerSize, y);
    this.ctx.stroke();

    // Top-right
    this.ctx.beginPath();
    this.ctx.moveTo(x + width - cornerSize, y);
    this.ctx.lineTo(x + width, y);
    this.ctx.lineTo(x + width, y + cornerSize);
    this.ctx.stroke();

    // Bottom-left
    this.ctx.beginPath();
    this.ctx.moveTo(x, y + height - cornerSize);
    this.ctx.lineTo(x, y + height);
    this.ctx.lineTo(x + cornerSize, y + height);
    this.ctx.stroke();

    // Bottom-right
    this.ctx.beginPath();
    this.ctx.moveTo(x + width - cornerSize, y + height);
    this.ctx.lineTo(x + width, y + height);
    this.ctx.lineTo(x + width, y + height - cornerSize);
    this.ctx.stroke();
  }

  private drawLabel(detection: Detection): void {
    const { x, y, label, text, isCode } = detection;

    // Prepare label text
    let labelText = label.toUpperCase();
    
    if (isCode !== undefined) {
      labelText += isCode ? ' [CODE]' : ' [TEXT]';
    }
    
    if (text && text.length > 0) {
      // Show first 30 chars of extracted text
      const preview = text.substring(0, 30) + (text.length > 30 ? '...' : '');
      labelText += `: ${preview}`;
    }

    // Choose color
    const boxColor = isCode ? '#4CAF50' : '#2196F3';

    // Measure text
    this.ctx.font = 'bold 16px monospace';
    const metrics = this.ctx.measureText(labelText);
    const textWidth = metrics.width;
    const textHeight = 16;

    // Draw label background
    const padding = 8;
    const labelX = x;
    const labelY = y - textHeight - padding * 2 - 5;
    const labelWidth = textWidth + padding * 2;
    const labelHeight = textHeight + padding * 2;

    // Solid background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(labelX, labelY, labelWidth, labelHeight);

    // Border
    this.ctx.strokeStyle = boxColor;
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);

    // Text
    this.ctx.fillStyle = boxColor;
    this.ctx.fillText(labelText, labelX + padding, labelY + textHeight + 2);
  }

  blurRegion(x: number, y: number, width: number, height: number): void {
    const imageData = this.ctx.getImageData(x, y, width, height);
    const blurred = this.applyGaussianBlur(imageData);
    this.ctx.putImageData(blurred, x, y);
  }

  private applyGaussianBlur(imageData: ImageData): ImageData {
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
