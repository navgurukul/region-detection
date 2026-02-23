# Quick Reference - Hierarchical OCR

## Installation

```bash
npm install @navgurukul/screen-region-detector
```

## Basic Usage

```typescript
import { HierarchicalOCRDetector } from '@navgurukul/screen-region-detector';

// 1. Initialize
const detector = new HierarchicalOCRDetector();
await detector.initialize(); // Takes 10-20 seconds

// 2. Get image data
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// 3. Detect
const result = await detector.detect(imageData);

// 4. Use results
console.log('Blocks:', result.blocks);
console.log('Words:', result.words);
console.log('Full text:', result.fullText);
```

## Detection Levels

| Level | Description | Count | Use Case |
|-------|-------------|-------|----------|
| **Block** | Largest regions | 5-20 | Major sections, code detection |
| **Paragraph** | Text groups | 10-50 | Document structure |
| **Line** | Text lines | 50-200 | Line spacing, alignment |
| **Word** | Individual words | 200-1000 | Keywords, font analysis |
| **Symbol** | Characters | 1000-10000 | Character analysis |

## Common Patterns

### Detect All Levels
```typescript
const result = await detector.detect(imageData);
```

### Detect Specific Level
```typescript
const words = await detector.detectLevel(imageData, 'word');
const lines = await detector.detectLevel(imageData, 'line');
const blocks = await detector.detectLevel(imageData, 'block');
```

### Find Code Blocks
```typescript
const result = await detector.detect(imageData, {
  includeBlocks: true,
  detectCode: true,
});
const codeBlocks = result.blocks.filter(b => b.isCode);
```

### Find Bold/Italic Text
```typescript
const words = await detector.detectLevel(imageData, 'word');
const boldWords = words.filter(w => w.is_bold);
const italicWords = words.filter(w => w.is_italic);
```

### Optimize Performance
```typescript
const result = await detector.detect(imageData, {
  includeBlocks: true,
  includeLines: true,
  includeWords: false,    // Skip for speed
  includeSymbols: false,  // Skip for speed
  minConfidence: 70,      // Higher = faster
});
```

### Analyze Line Spacing
```typescript
const lines = await detector.detectLevel(imageData, 'line');
const spacings = [];
for (let i = 1; i < lines.length; i++) {
  spacings.push(lines[i].bbox.y0 - lines[i-1].bbox.y1);
}
const avgSpacing = spacings.reduce((a,b) => a+b) / spacings.length;
```

### Character Distribution
```typescript
const symbols = await detector.detectLevel(imageData, 'symbol');
const letters = symbols.filter(s => /[a-zA-Z]/.test(s.text)).length;
const digits = symbols.filter(s => /[0-9]/.test(s.text)).length;
```

### Get Bounding Box
```typescript
const block = result.blocks[0];
const dims = detector.getBBoxDimensions(block.bbox);
// Returns: { x, y, width, height }
```

## Options

```typescript
interface DetectionOptions {
  includeBlocks?: boolean;      // Default: true
  includeParagraphs?: boolean;  // Default: true
  includeLines?: boolean;       // Default: true
  includeWords?: boolean;       // Default: true
  includeSymbols?: boolean;     // Default: true
  minConfidence?: number;       // Default: 0 (0-100)
  detectCode?: boolean;         // Default: true
}
```

## Result Structure

```typescript
interface HierarchicalOCRResult {
  blocks: OCRBlock[];
  paragraphs: OCRParagraph[];
  lines: OCRLine[];
  words: OCRWord[];
  symbols: OCRSymbol[];
  fullText: string;
  confidence: number;
  processingTime: number;
}
```

## Block Properties

```typescript
interface OCRBlock {
  level: 'block';
  bbox: { x0, y0, x1, y1 };
  text: string;
  confidence: number;
  isCode?: boolean;
  blocktype?: string;
}
```

## Word Properties

```typescript
interface OCRWord {
  level: 'word';
  bbox: { x0, y0, x1, y1 };
  text: string;
  confidence: number;
  is_bold?: boolean;
  is_italic?: boolean;
  is_underlined?: boolean;
  is_numeric?: boolean;
  font_name?: string;
  font_size?: number;
}
```

## Performance Tips

1. **Skip symbols** - Biggest performance impact
2. **Use caching** - Results cached for 3 seconds automatically
3. **Higher confidence** - Filter out noise
4. **Detect only needed levels** - Don't include all if not needed
5. **Clear cache** - `detector.clearCache()` to force fresh detection

## Processing Time (1280x720)

- Blocks only: ~500-1000ms
- Blocks + Lines: ~800-1500ms
- Blocks + Lines + Words: ~1200-2000ms
- All levels: ~2000-4000ms

## Methods

```typescript
// Initialize Tesseract
await detector.initialize()

// Detect all levels
await detector.detect(imageData, options?)

// Detect specific level
await detector.detectLevel(imageData, level, options?)

// Get bbox dimensions
detector.getBBoxDimensions(bbox)

// Check if ready
detector.isReady()

// Clear cache
detector.clearCache()

// Clean up
await detector.terminate()
```

## Complete Example

```typescript
import { HierarchicalOCRDetector } from '@navgurukul/screen-region-detector';

async function analyzeScreen() {
  // Initialize
  const detector = new HierarchicalOCRDetector();
  await detector.initialize();
  
  // Get screen capture
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const video = document.createElement('video');
  video.srcObject = stream;
  await video.play();
  
  // Capture frame
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
  // Detect
  const result = await detector.detect(imageData, {
    includeBlocks: true,
    includeWords: true,
    includeSymbols: false, // Skip for performance
    minConfidence: 60,
    detectCode: true,
  });
  
  // Analyze
  console.log('Summary:');
  console.log('- Blocks:', result.blocks.length);
  console.log('- Words:', result.words.length);
  console.log('- Processing time:', result.processingTime + 'ms');
  
  // Find code blocks
  const codeBlocks = result.blocks.filter(b => b.isCode);
  console.log('Code blocks:', codeBlocks.length);
  
  // Find bold words
  const boldWords = result.words.filter(w => w.is_bold);
  console.log('Bold words:', boldWords.map(w => w.text));
  
  // Clean up
  stream.getTracks().forEach(track => track.stop());
  await detector.terminate();
}

analyzeScreen();
```

## See Also

- [Full Documentation](./docs/HIERARCHICAL-OCR.md)
- [Demo Examples](./src/hierarchicalDemo.ts)
- [Interactive Demo](./hierarchical-demo.html)
- [API Reference](./README.md)
