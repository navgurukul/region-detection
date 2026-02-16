export class ScreenCapture {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  async start(): Promise<void> {
    try {
      // Request screen capture
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor',
        } as MediaTrackConstraints,
        audio: false,
      });

      // Attach to video element
      this.videoElement.srcObject = this.stream;
      
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          this.videoElement.play();
          resolve();
        };
      });

      // Handle stream end (user stops sharing)
      this.stream.getVideoTracks()[0].addEventListener('ended', () => {
        this.stop();
        window.dispatchEvent(new CustomEvent('screenshare-ended'));
      });

    } catch (error) {
      console.error('Screen capture failed:', error);
      throw new Error('Failed to capture screen. Please grant permission and try again.');
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.videoElement.srcObject = null;
    }
  }

  isActive(): boolean {
    return this.stream !== null && this.stream.active;
  }

  getVideoElement(): HTMLVideoElement {
    return this.videoElement;
  }

  getStreamDimensions(): { width: number; height: number } {
    return {
      width: this.videoElement.videoWidth,
      height: this.videoElement.videoHeight,
    };
  }
}
