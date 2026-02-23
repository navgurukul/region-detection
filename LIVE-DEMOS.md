# 🚀 Live Demos

The development server is running at **http://localhost:5173/**

## Available Demos

### 1. Demo Hub
**URL:** http://localhost:5173/demos.html

Landing page with links to all demos.

---

### 2. Basic Detection Demo (Original)
**URL:** http://localhost:5173/index.html or http://localhost:5173/

**Features:**
- Real-time screen region detection
- Block-level text detection
- Code vs text classification
- Visual overlay with bounding boxes
- Toggle to show/hide detection boxes
- FPS and performance stats

**How to use:**
1. Click "Start Detection"
2. Select your screen or window to share
3. Watch as regions are detected in real-time
4. Toggle "Show Bounds" checkbox to hide/show boxes

---

### 3. Hierarchical OCR Demo (NEW!)
**URL:** http://localhost:5173/hierarchical-demo.html

**Features:**
- 5 detection levels: blocks, paragraphs, lines, words, symbols
- Level selector to choose what to detect
- Font analysis (bold, italic, underlined)
- Character distribution statistics
- Processing time metrics
- Visual results with badges

**How to use:**
1. Click "Start Screen Capture"
2. Select your screen or window
3. Choose detection level (All Levels, Blocks, Words, etc.)
4. Click "Run Detection"
5. View detailed results with text, position, and confidence

**Detection Levels:**
- **All Levels** - Detect everything (blocks → symbols)
- **Blocks** - Largest text regions
- **Paragraphs** - Groups of related lines
- **Lines** - Individual text lines
- **Words** - Individual words with font info
- **Symbols** - Individual characters

---

### 4. Test Suite
**URL:** http://localhost:5173/test-hierarchical.html

**Features:**
- Automated test suite for hierarchical OCR
- Test canvas with sample content
- Performance benchmarks
- Character distribution analysis
- Line spacing calculations

**How to use:**
1. Click "Draw Test Text/Code/Mixed Content" to create test images
2. Click "Run All Tests" to test all detection levels
3. Or click individual test buttons (Test Blocks, Test Words, etc.)
4. View detailed console output

**Tests included:**
- Block detection with code identification
- Word detection with font analysis
- Line detection with spacing analysis
- Symbol detection with character distribution
- Performance comparison (all levels vs optimized)

---

## Quick Start

### Start the dev server:
```bash
cd screen-region-detector-client
npm run dev
```

### Access demos:
1. Open http://localhost:5173/demos.html
2. Choose a demo
3. Allow screen sharing when prompted
4. Start detecting!

---

## What to Test

### Basic Demo (index.html)
✅ Screen capture works
✅ Real-time detection (10 FPS)
✅ Bounding boxes appear
✅ Code regions show as green
✅ Text regions show as blue
✅ Toggle checkbox works
✅ Stats update correctly

### Hierarchical Demo (hierarchical-demo.html)
✅ Screen capture works
✅ Level selector changes detection
✅ All levels detected correctly
✅ Statistics show correct counts
✅ Results display with proper formatting
✅ Badges show (CODE, BOLD, ITALIC)
✅ Processing time displayed
✅ Font analysis works (bold/italic detection)

### Test Suite (test-hierarchical.html)
✅ Canvas drawing works
✅ All tests run without errors
✅ Block detection finds text regions
✅ Word detection extracts individual words
✅ Line detection calculates spacing
✅ Symbol detection counts characters
✅ Performance tests show timing differences
✅ Code detection identifies code blocks

---

## Expected Results

### For Text Content:
- **Blocks**: 2-5 major regions
- **Lines**: 5-20 text lines
- **Words**: 20-100 words
- **Symbols**: 100-500 characters

### For Code Content:
- **Blocks**: Identified as `isCode: true`
- **Lines**: Code lines with proper spacing
- **Words**: Keywords, identifiers, operators
- **Symbols**: Brackets, semicolons, etc.

### Performance:
- **Blocks only**: ~500-1000ms
- **All levels**: ~2000-4000ms
- **Without symbols**: ~1200-2000ms (40-50% faster)

---

## Troubleshooting

### "Tesseract not initializing"
- Wait 10-20 seconds for first load
- Check browser console for errors
- Refresh the page

### "Screen capture not working"
- Make sure you're using HTTPS or localhost
- Allow screen sharing permission
- Try a different browser (Chrome/Edge recommended)

### "No detections found"
- Make sure there's visible text on screen
- Try capturing a window with clear text
- Check that text is not too small

### "Slow performance"
- Use "Blocks only" or skip symbols
- Increase confidence threshold
- Reduce screen resolution
- Close other tabs

---

## Browser Console

Open browser DevTools (F12) to see:
- Initialization progress
- Detection logs
- Performance metrics
- Error messages

Example console output:
```
[HierarchicalOCR] Starting Tesseract initialization...
[Tesseract] recognizing text: 100%
[HierarchicalOCR] ✓ Ready!
[HierarchicalOCR] Starting new scan...
[HierarchicalOCR] Running Tesseract...
[HierarchicalOCR] Completed in 1523ms
[HierarchicalOCR] Processing 12 blocks
[HierarchicalOCR] Processing 45 words
[HierarchicalOCR] Cached result with 12 blocks
```

---

## Next Steps

1. **Test the basic demo** - Make sure screen capture works
2. **Try hierarchical demo** - Test all detection levels
3. **Run test suite** - Verify all features work
4. **Check performance** - Compare different detection modes
5. **Test with real content** - Capture actual screens with code/text

---

## Documentation

- **Full API docs**: [docs/HIERARCHICAL-OCR.md](./docs/HIERARCHICAL-OCR.md)
- **Quick reference**: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md)
- **Implementation details**: [HIERARCHICAL-FEATURES.md](./HIERARCHICAL-FEATURES.md)
- **Usage examples**: [src/hierarchicalDemo.ts](./src/hierarchicalDemo.ts)

---

## Feedback

If you find any issues:
1. Check browser console for errors
2. Try different content (text vs code)
3. Test different detection levels
4. Compare performance with/without symbols
5. Report what works and what doesn't!

Happy testing! 🎉
