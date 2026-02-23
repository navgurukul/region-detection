/**
 * Demo: Using Hierarchical OCR Detection
 * Shows how to use all detection levels: blocks, paragraphs, lines, words, symbols
 */

import { HierarchicalOCRDetector } from './hierarchicalOCR';
import type { DetectionOptions } from './types';

export class HierarchicalDemo {
  private detector: HierarchicalOCRDetector;

  constructor() {
    this.detector = new HierarchicalOCRDetector();
  }

  async initialize(): Promise<void> {
    console.log('Initializing hierarchical OCR detector...');
    await this.detector.initialize();
    console.log('✓ Ready!');
  }

  /**
   * Example 1: Detect all levels at once
   */
  async detectAllLevels(imageData: ImageData): Promise<void> {
    console.log('\n=== Example 1: Detect All Levels ===');
    
    const result = await this.detector.detect(imageData, {
      includeBlocks: true,
      includeParagraphs: true,
      includeLines: true,
      includeWords: true,
      includeSymbols: true,
      minConfidence: 60, // Only show results with >60% confidence
      detectCode: true,
    });

    console.log('Full text:', result.fullText);
    console.log('Overall confidence:', result.confidence);
    console.log('Processing time:', result.processingTime, 'ms');
    console.log('\nDetection counts:');
    console.log('- Blocks:', result.blocks.length);
    console.log('- Paragraphs:', result.paragraphs.length);
    console.log('- Lines:', result.lines.length);
    console.log('- Words:', result.words.length);
    console.log('- Symbols:', result.symbols.length);

    // Show first block details
    if (result.blocks.length > 0) {
      const block = result.blocks[0];
      console.log('\nFirst block:');
      console.log('- Text:', block.text.substring(0, 100));
      console.log('- Is code?', block.isCode);
      console.log('- Confidence:', block.confidence);
      console.log('- Position:', this.detector.getBBoxDimensions(block.bbox));
    }
  }

  /**
   * Example 2: Detect only specific level (e.g., words)
   */
  async detectWordsOnly(imageData: ImageData): Promise<void> {
    console.log('\n=== Example 2: Detect Words Only ===');
    
    const words = await this.detector.detectLevel(imageData, 'word', {
      minConfidence: 70,
    });

    console.log(`Found ${words.length} words`);
    
    // Show first 10 words
    words.slice(0, 10).forEach((word, i) => {
      if ('is_bold' in word) {
        const dims = this.detector.getBBoxDimensions(word.bbox);
        console.log(`${i + 1}. "${word.text}" - ${word.confidence.toFixed(1)}% confidence`);
        console.log(`   Position: (${dims.x}, ${dims.y}), Size: ${dims.width}x${dims.height}`);
        console.log(`   Bold: ${word.is_bold}, Italic: ${word.is_italic}`);
      }
    });
  }

  /**
   * Example 3: Detect lines for layout analysis
   */
  async detectLinesForLayout(imageData: ImageData): Promise<void> {
    console.log('\n=== Example 3: Detect Lines for Layout ===');
    
    const lines = await this.detector.detectLevel(imageData, 'line', {
      minConfidence: 60,
    });

    console.log(`Found ${lines.length} lines of text`);
    
    // Analyze line spacing
    if (lines.length > 1) {
      const spacings: number[] = [];
      for (let i = 1; i < lines.length; i++) {
        const prevLine = lines[i - 1];
        const currLine = lines[i];
        const spacing = currLine.bbox.y0 - prevLine.bbox.y1;
        spacings.push(spacing);
      }
      
      const avgSpacing = spacings.reduce((a, b) => a + b, 0) / spacings.length;
      console.log('Average line spacing:', avgSpacing.toFixed(2), 'pixels');
    }

    // Show first 5 lines
    lines.slice(0, 5).forEach((line, i) => {
      console.log(`Line ${i + 1}: "${line.text.substring(0, 60)}..."`);
    });
  }

  /**
   * Example 4: Detect paragraphs for document structure
   */
  async detectParagraphs(imageData: ImageData): Promise<void> {
    console.log('\n=== Example 4: Detect Paragraphs ===');
    
    const paragraphs = await this.detector.detectLevel(imageData, 'paragraph', {
      minConfidence: 60,
    });

    console.log(`Found ${paragraphs.length} paragraphs`);
    
    paragraphs.forEach((para, i) => {
      if ('is_ltr' in para) {
        const dims = this.detector.getBBoxDimensions(para.bbox);
        console.log(`\nParagraph ${i + 1}:`);
        console.log('- Text:', para.text.substring(0, 100) + '...');
        console.log('- Left-to-right?', para.is_ltr);
        console.log('- Size:', `${dims.width}x${dims.height}`);
        console.log('- Confidence:', para.confidence.toFixed(1) + '%');
      }
    });
  }

  /**
   * Example 5: Detect symbols for character-level analysis
   */
  async detectSymbols(imageData: ImageData): Promise<void> {
    console.log('\n=== Example 5: Detect Symbols (Characters) ===');
    
    const symbols = await this.detector.detectLevel(imageData, 'symbol', {
      minConfidence: 70,
    });

    console.log(`Found ${symbols.length} symbols (characters)`);
    
    // Count character types
    const charTypes = {
      letters: 0,
      digits: 0,
      spaces: 0,
      punctuation: 0,
      special: 0,
    };

    symbols.forEach(symbol => {
      const char = symbol.text;
      if (/[a-zA-Z]/.test(char)) charTypes.letters++;
      else if (/[0-9]/.test(char)) charTypes.digits++;
      else if (/\s/.test(char)) charTypes.spaces++;
      else if (/[.,!?;:]/.test(char)) charTypes.punctuation++;
      else charTypes.special++;
    });

    console.log('Character distribution:');
    console.log('- Letters:', charTypes.letters);
    console.log('- Digits:', charTypes.digits);
    console.log('- Spaces:', charTypes.spaces);
    console.log('- Punctuation:', charTypes.punctuation);
    console.log('- Special chars:', charTypes.special);

    // Show first 20 symbols
    console.log('\nFirst 20 symbols:');
    symbols.slice(0, 20).forEach((symbol, i) => {
      console.log(`${i + 1}. "${symbol.text}" (${symbol.confidence.toFixed(1)}%)`);
    });
  }

  /**
   * Example 6: Custom options - detect only code blocks
   */
  async detectCodeBlocks(imageData: ImageData): Promise<void> {
    console.log('\n=== Example 6: Detect Code Blocks Only ===');
    
    const result = await this.detector.detect(imageData, {
      includeBlocks: true,
      includeParagraphs: false,
      includeLines: false,
      includeWords: false,
      includeSymbols: false,
      minConfidence: 60,
      detectCode: true,
    });

    const codeBlocks = result.blocks.filter(block => block.isCode);
    console.log(`Found ${codeBlocks.length} code blocks out of ${result.blocks.length} total blocks`);
    
    codeBlocks.forEach((block, i) => {
      const dims = this.detector.getBBoxDimensions(block.bbox);
      console.log(`\nCode Block ${i + 1}:`);
      console.log('- Preview:', block.text.substring(0, 100) + '...');
      console.log('- Size:', `${dims.width}x${dims.height}`);
      console.log('- Confidence:', block.confidence.toFixed(1) + '%');
    });
  }

  /**
   * Example 7: Performance optimization - detect only what you need
   */
  async detectOptimized(imageData: ImageData): Promise<void> {
    console.log('\n=== Example 7: Optimized Detection ===');
    
    // Only detect blocks and lines (skip words and symbols for speed)
    const result = await this.detector.detect(imageData, {
      includeBlocks: true,
      includeParagraphs: false,
      includeLines: true,
      includeWords: false,
      includeSymbols: false, // Symbols are expensive to process
      minConfidence: 70, // Higher threshold = faster
      detectCode: true,
    });

    console.log('Processing time:', result.processingTime, 'ms');
    console.log('Blocks:', result.blocks.length);
    console.log('Lines:', result.lines.length);
    console.log('(Skipped paragraphs, words, and symbols for speed)');
  }

  /**
   * Example 8: Clear cache and force new detection
   */
  async forceNewDetection(imageData: ImageData): Promise<void> {
    console.log('\n=== Example 8: Force New Detection ===');
    
    // Clear cache to force fresh detection
    this.detector.clearCache();
    console.log('Cache cleared');
    
    const result = await this.detector.detect(imageData);
    console.log('Fresh detection completed in', result.processingTime, 'ms');
  }

  async cleanup(): Promise<void> {
    await this.detector.terminate();
    console.log('Detector terminated');
  }
}

// Usage example:
/*
const demo = new HierarchicalDemo();
await demo.initialize();

// Get image data from canvas or video
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

// Run examples
await demo.detectAllLevels(imageData);
await demo.detectWordsOnly(imageData);
await demo.detectLinesForLayout(imageData);
await demo.detectParagraphs(imageData);
await demo.detectSymbols(imageData);
await demo.detectCodeBlocks(imageData);
await demo.detectOptimized(imageData);

// Cleanup
await demo.cleanup();
*/
