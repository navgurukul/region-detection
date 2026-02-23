import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  // Library build mode
  if (mode === 'lib') {
    return {
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'ScreenRegionDetector',
          fileName: 'index',
          formats: ['es'],
        },
        rollupOptions: {
          external: ['tesseract.js', 'onnxruntime-web'],
          output: {
            globals: {
              'tesseract.js': 'Tesseract',
              'onnxruntime-web': 'ort',
            },
          },
        },
        outDir: 'dist',
        emptyOutDir: true,
      },
    };
  }

  // Demo/dev mode
  return {
    base: process.env.NODE_ENV === 'production' ? '/region-detection/' : '/',
    server: {
      port: 5173,
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      exclude: ['onnxruntime-web'],
    },
  };
});
