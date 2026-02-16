import type { Detection, DetectionResult, WorkerMessage } from './types';
import { CONFIG } from './config';
import DetectorWorker from './detector.worker?worker';

export class DetectorClient {
  private worker: Worker;
  private isReady = false;
  private pendingResolve: ((value: DetectionResult) => void) | null = null;
  private pendingReject: ((error: Error) => void) | null = null;

  constructor() {
    this.worker = new DetectorWorker();
    this.setupWorkerListeners();
  }

  private setupWorkerListeners(): void {
    this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
      const { type, data, error } = e.data;

      switch (type) {
        case 'ready':
          this.isReady = true;
          console.log('✓ Detector ready');
          break;

        case 'result':
          if (this.pendingResolve) {
            this.pendingResolve(data as DetectionResult);
            this.pendingResolve = null;
            this.pendingReject = null;
          }
          break;

        case 'error':
          console.error('Worker error:', error);
          if (this.pendingReject) {
            this.pendingReject(new Error(error));
            this.pendingResolve = null;
            this.pendingReject = null;
          }
          break;
      }
    };

    this.worker.onerror = (error) => {
      console.error('Worker error:', error);
      if (this.pendingReject) {
        this.pendingReject(new Error('Worker error'));
        this.pendingResolve = null;
        this.pendingReject = null;
      }
    };
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Model loading timeout'));
      }, 30000); // 30 second timeout

      const checkReady = () => {
        if (this.isReady) {
          clearTimeout(timeout);
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };

      // Send init message
      this.worker.postMessage({
        type: 'init',
        data: { modelPath: CONFIG.MODEL_PATH },
      } as WorkerMessage);

      checkReady();
    });
  }

  async detect(
    imageData: ImageData,
    confidenceThreshold: number = CONFIG.CONFIDENCE_THRESHOLD
  ): Promise<DetectionResult> {
    if (!this.isReady) {
      throw new Error('Detector not ready');
    }

    return new Promise((resolve, reject) => {
      this.pendingResolve = resolve;
      this.pendingReject = reject;

      // Send detection request
      this.worker.postMessage({
        type: 'detect',
        data: { imageData, confidenceThreshold },
      } as WorkerMessage);
    });
  }

  terminate(): void {
    this.worker.terminate();
    this.isReady = false;
  }

  getIsReady(): boolean {
    return this.isReady;
  }
}
