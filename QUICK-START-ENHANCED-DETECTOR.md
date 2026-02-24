# 🚀 Quick Start: Enhanced Code Detector

## Installation

```bash
npm install @navgurukul/screen-region-detector
```

## Basic Usage

```typescript
import { EnhancedCodeDetector } from '@navgurukul/screen-region-detector';

const detector = new EnhancedCodeDetector();

// Detect code
const result = await detector.detect('function hello() {}');

console.log(result.isCode);      // true
console.log(result.confidence);  // 0.92
console.log(result.language);    // 'javascript'
```

## Automatic Integration

```typescript
// Works automatically with existing detectors!
import { HybridDetector } from '@navgurukul/screen-region-detector';

const detector = new HybridDetector();
await detector.initialize();

const regions = await detector.detectRegions(imageData);
// regions[0].isCode - now more accurate!
```

## Supported Languages

JavaScript • TypeScript • Python • Java • C/C++ • Ruby • Go • Rust • SQL • HTML • CSS • Shell

## Key Features

✅ **85-90% accuracy** (up from 60-70%)  
✅ **13+ languages** (up from 1)  
✅ **3 detection methods** (pattern, statistical, syntax)  
✅ **100% client-side** (no backend)  
✅ **Fast** (3-5ms typical)

## Options

```typescript
// Disable syntax parsing for speed
await detector.detect(text, {
  enableSyntaxParsing: false,
  minConfidence: 0.7,
  minTextLength: 15
});
```

## Batch Detection

```typescript
const texts = ['code1', 'code2', 'text'];
const results = await detector.detectBatch(texts);
```

## Interactive Demo

```bash
npm run dev
# Open: http://localhost:5173/enhanced-code-demo.html
```

## Documentation

- **Full Guide:** `docs/ENHANCED-CODE-DETECTION.md`
- **Summary:** `ENHANCED-CODE-DETECTION-SUMMARY.md`
- **Examples:** `src/enhancedCodeDemo.ts`

## Need Help?

- Read the docs: `docs/ENHANCED-CODE-DETECTION.md`
- Run the demo: `npm run dev`
- Check examples: `src/enhancedCodeDemo.ts`

---

**Ready to use! 🎉**
