# Hierarchical OCR Detection

The `HierarchicalOCRDetector` provides granular text detection at multiple levels: blocks, paragraphs, lines, words, and symbols (characters).

## Overview

Tesseract OCR organizes detected text in a hierarchical structure:

```
Page
├── Block (largest text regions)
│   ├── Paragraph
│   │   ├── Line
│   │   │   ├── Word
│   │   │   │   └── Symbol (character)
```

## Detection Levels

### 1. Blocks
Largest text regions, typically representing distinct sections of content.

```typescript
interface OCRBlock {
  level: 'block';
  bbox: BoundingBox;
  text: string;
  confidence: number;
  paragraphs?: OCRParagraph[];
  blocktype?: string;
  isCode?: boolean;
}
```

**Use cases:**
- Detecting major content sections
- Identifying code vs text regions
- Layout analysis

### 2. Paragraphs
Groups of related lines within a block.

```typescript
interface OCRParagraph {
  level: 'paragraph';
  bbox: BoundingBox;
  text: string;
  confidence: number;
  lines?: OCRLine[];
  is_ltr?: boolean; // Left-to-right text direction
}
```

**Use cases:**
- Document structure analysis
- Text direction detection
- Content grouping

### 3. Lines
Individual lines of text.

```typescript
interface OCRLine {
  level: 'line';
  bbox: BoundingBox;
  text: string;
  confidence: number;
  baseline?: Baseline;
  words?: OCRWord[];
}
```

**Use cases:**
- Line spacing analysis
- Text alignment detection
- Reading order determination

### 4. Words
Individual words within lines.

```typescript
interface OCRWord {
  level: 'word';
  bbox: BoundingBox;
  text: string;
  confidence: number;
  baseline?: Baseline;
  symbols?: OCRSymbol[];
  is_numeric?: boolean;
  is_bold?: boolean;
  is_italic?: boolean;
  is_underlined?: boolean;
  font_name?: string;
  font_size?: number;
}
```

**Use cases:**
- Word-level text extraction
- Font style detection
- Keyword highlighting
- Text formatting analysis

### 5. Symbols (Characters)
Individual characters within words.

```typescript
interface OCRSymbol {
  level: 'symbol';
  bbox: BoundingBox;
  text: string;
  confidence: number;
  baseline?: Baseline;
  choices?: Array<{ text: string; confidence: number }>;
}
```

**Use cases:**
- Character-level analysis
- OCR confidence checking
- Alternative character suggestions
- Character distribution analysis

## Usage

### Basic Usage

```typescript
import { HierarchicalOCRDetector } from '@navgurukul/screen-region-detector';

// Initialize
const detector = new HierarchicalOCRDetector();
await detector.initialize();

// Get image data
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Detect all levels
const result = await detector.detect(imageData);

console.log('Blocks:', result.blocks.length);
console.log('Paragraphs:', result.paragraphs.length);
console.log('Lines:', result.lines.length);
console.log('Words:', result.words.length);
console.log('Symbols:', result.symbols.length);
console.log('Full text:', result.fullText);
```

### Detect Specific Level

```typescript
// Detect only words
const words = await detector.detectLevel(imageData, 'word');

// Detect only lines
const lines = await detector.detectLevel(imageData, 'line');

// Detect only blocks
const blocks = await detector.detectLevel(imageData, 'block');
```

### Custom Options

```typescript
const result = await detector.detect(imageData, {
  // Choose which levels to include
  includeBlocks: true,
  includeParagraphs: true,
  includeLines: true,
  includeWords: true,
  includeSymbols: false, // Skip symbols for performance
  
  // Minimum confidence threshold (0-100)
  minConfidence: 60,
  
  // Detect code blocks
  detectCode: true,
});
```

### Performance Optimization

```typescript
// Option 1: Detect only what you need
const result = await detector.detect(imageData, {
  includeBlocks: true,
  includeLines: true,
  includeWords: false,    // Skip for speed
  includeSymbols: false,  // Skip for speed
  minConfidence: 70,      // Higher threshold = faster
});

// Option 2: Use caching (automatic)
// The detector caches results for 3 seconds by default
const result1 = await detector.detect(imageData); // Fresh detection
const result2 = await detector.detect(imageData); // Returns cached (fast!)

// Option 3: Clear cache to force new detection
detector.clearCache();
const result3 = await detector.detect(imageData); // Fresh detection
```

## Practical Examples

### Example 1: Find All Code Blocks

```typescript
const result = await detector.detect(imageData, {
  includeBlocks: true,
  detectCode: true,
});

const codeBlocks = result.blocks.filter(block => block.isCode);
console.log(`Found ${codeBlocks.length} code blocks`);

codeBlocks.forEach(block => {
  console.log('Code:', block.text);
  console.log('Position:', detector.getBBoxDimensions(block.bbox));
});
```

### Example 2: Analyze Text Layout

```typescript
const lines = await detector.detectLevel(imageData, 'line');

// Calculate line spacing
const spacings: number[] = [];
for (let i = 1; i < lines.length; i++) {
  const prevLine = lines[i - 1];
  const currLine = lines[i];
  const spacing = currLine.bbox.y0 - prevLine.bbox.y1;
  spacings.push(spacing);
}

const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
console.log('Average line spacing:', avgSpacing, 'pixels');
```

### Example 3: Extract Formatted Text

```typescript
const words = await detector.detectLevel(imageData, 'word');

const boldWords = words.filter(w => 'is_bold' in w && w.is_bold);
const italicWords = words.filter(w => 'is_italic' in w && w.is_italic);

console.log('Bold words:', boldWords.map(w => w.text));
console.log('Italic words:', italicWords.map(w => w.text));
```

### Example 4: Character Distribution Analysis

```typescript
const symbols = await detector.detectLevel(imageData, 'symbol');

const charTypes = {
  letters: 0,
  digits: 0,
  punctuation: 0,
  special: 0,
};

symbols.forEach(symbol => {
  const char = symbol.text;
  if (/[a-zA-Z]/.test(char)) charTypes.letters++;
  else if (/[0-9]/.test(char)) charTypes.digits++;
  else if (/[.,!?;:]/.test(char)) charTypes.punctuation++;
  else charTypes.special++;
});

console.log('Character distribution:', charTypes);
```

### Example 5: Highlight Low Confidence Text

```typescript
const result = await detector.detect(imageData);

const lowConfidenceWords = result.words.filter(w => w.confidence < 70);

console.log(`Found ${lowConfidenceWords.length} words with low confidence`);
lowConfidenceWords.forEach(word => {
  console.log(`"${word.text}" - ${word.confidence.toFixed(1)}% confidence`);
});
```

## Helper Methods

### Get Bounding Box Dimensions

```typescript
const block = result.blocks[0];
const dims = detector.getBBoxDimensions(block.bbox);

console.log('Position:', dims.x, dims.y);
console.log('Size:', dims.width, dims.height);
```

### Check if Ready

```typescript
if (detector.isReady()) {
  console.log('Detector is ready');
}
```

### Clear Cache

```typescript
detector.clearCache();
```

### Terminate

```typescript
await detector.terminate();
```

## Performance Considerations

### Processing Time
- **Blocks only**: ~500-1000ms
- **Blocks + Lines**: ~800-1500ms
- **All levels**: ~1500-3000ms
- **With symbols**: ~2000-4000ms

### Optimization Tips

1. **Skip symbols** unless you need character-level analysis
2. **Use higher confidence threshold** to filter out noise
3. **Leverage caching** - results are cached for 3 seconds
4. **Resize images** - detector automatically resizes to 1280x720 max
5. **Detect only needed levels** - don't include all levels if you only need blocks

### Memory Usage

- Symbols consume the most memory (thousands of objects)
- Words are moderate (hundreds of objects)
- Blocks/paragraphs/lines are lightweight (tens of objects)

## Comparison with HybridDetector

| Feature | HierarchicalOCRDetector | HybridDetector |
|---------|------------------------|----------------|
| Granularity | 5 levels (block→symbol) | Block level only |
| Performance | Slower (more data) | Faster |
| Use case | Detailed text analysis | Quick region detection |
| Font info | Yes (word level) | No |
| Character-level | Yes | No |
| Code detection | Yes | Yes |

## When to Use Each Level

- **Blocks**: General layout detection, code vs text
- **Paragraphs**: Document structure, text grouping
- **Lines**: Line spacing, reading order, alignment
- **Words**: Keyword extraction, font analysis, formatting
- **Symbols**: Character analysis, OCR quality check, alternative suggestions

## See Also

- [API Usage Guide](./API-USAGE.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Demo Examples](../src/hierarchicalDemo.ts)
