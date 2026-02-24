/**
 * Enhanced Code Detector Demo
 * 
 * Demonstrates the three detection approaches:
 * 1. Multi-language pattern matching
 * 2. Statistical analysis
 * 3. Syntax parsing (JavaScript)
 */

import { EnhancedCodeDetector } from './enhancedCodeDetector';

export class EnhancedCodeDemo {
  private detector: EnhancedCodeDetector;

  constructor() {
    this.detector = new EnhancedCodeDetector();
  }

  /**
   * Example 1: Detect JavaScript code
   */
  async detectJavaScript() {
    const jsCode = `
function calculateSum(a, b) {
  const result = a + b;
  console.log('Sum:', result);
  return result;
}
    `.trim();

    const result = await this.detector.detect(jsCode);
    console.log('JavaScript Detection:', result);
    // Expected: { isCode: true, confidence: ~0.9, language: 'javascript' }
  }

  /**
   * Example 2: Detect Python code
   */
  async detectPython() {
    const pythonCode = `
def calculate_sum(a, b):
    result = a + b
    print(f'Sum: {result}')
    return result
    `.trim();

    const result = await this.detector.detect(pythonCode);
    console.log('Python Detection:', result);
    // Expected: { isCode: true, confidence: ~0.85, language: 'python' }
  }

  /**
   * Example 3: Detect SQL query
   */
  async detectSQL() {
    const sqlCode = `
SELECT users.name, orders.total
FROM users
JOIN orders ON users.id = orders.user_id
WHERE orders.total > 100
ORDER BY orders.total DESC;
    `.trim();

    const result = await this.detector.detect(sqlCode);
    console.log('SQL Detection:', result);
    // Expected: { isCode: true, confidence: ~0.8, language: 'sql' }
  }

  /**
   * Example 4: Detect regular text (should NOT be code)
   */
  async detectRegularText() {
    const text = `
This is a regular paragraph of text.
It talks about various topics and contains
normal sentences with proper grammar.
    `.trim();

    const result = await this.detector.detect(text);
    console.log('Regular Text Detection:', result);
    // Expected: { isCode: false, confidence: ~0.2 }
  }

  /**
   * Example 5: Detect HTML markup
   */
  async detectHTML() {
    const htmlCode = `
<!DOCTYPE html>
<html>
  <head>
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello World</h1>
  </body>
</html>
    `.trim();

    const result = await this.detector.detect(htmlCode);
    console.log('HTML Detection:', result);
    // Expected: { isCode: true, confidence: ~0.75, language: 'html' }
  }

  /**
   * Example 6: Detect CSS
   */
  async detectCSS() {
    const cssCode = `
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
  }
}
    `.trim();

    const result = await this.detector.detect(cssCode);
    console.log('CSS Detection:', result);
    // Expected: { isCode: true, confidence: ~0.75, language: 'css' }
  }

  /**
   * Example 7: Detect shell commands
   */
  async detectShell() {
    const shellCode = `
$ npm install
$ npm run build
$ npm run dev
    `.trim();

    const result = await this.detector.detect(shellCode);
    console.log('Shell Detection:', result);
    // Expected: { isCode: true, confidence: ~0.8, language: 'shell' }
  }

  /**
   * Example 8: Edge case - code-like text
   */
  async detectCodeLikeText() {
    const text = `
The function should return the value.
If you use const or let, make sure to
declare variables properly. For example,
you might write: const x = 5;
    `.trim();

    const result = await this.detector.detect(text);
    console.log('Code-like Text Detection:', result);
    // Expected: { isCode: false or borderline, confidence: ~0.5 }
  }

  /**
   * Example 9: Batch detection
   */
  async batchDetection() {
    const samples = [
      'function hello() { console.log("hi"); }',
      'This is regular text.',
      'def greet(): print("hello")',
      'SELECT * FROM users WHERE id = 1;',
      'Just a normal sentence.',
    ];

    const results = await this.detector.detectBatch(samples);
    console.log('Batch Detection Results:');
    results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.isCode ? 'CODE' : 'TEXT'} (${result.confidence.toFixed(2)}) - ${result.language || 'N/A'}`);
    });
  }

  /**
   * Example 10: Compare detection methods
   */
  async compareDetectionMethods() {
    const jsCode = `
const add = (a, b) => {
  return a + b;
};
    `.trim();

    console.log('\n=== Comparing Detection Methods ===');
    
    // With syntax parsing
    const withSyntax = await this.detector.detect(jsCode, {
      enableSyntaxParsing: true,
    });
    console.log('With syntax parsing:', withSyntax);

    // Without syntax parsing
    const withoutSyntax = await this.detector.detect(jsCode, {
      enableSyntaxParsing: false,
    });
    console.log('Without syntax parsing:', withoutSyntax);

    console.log('\nScore breakdown:');
    console.log('  Pattern score:', withSyntax.scores.pattern.toFixed(2));
    console.log('  Statistical score:', withSyntax.scores.statistical.toFixed(2));
    console.log('  Syntax score:', withSyntax.scores.syntax.toFixed(2));
  }

  /**
   * Example 11: Test all supported languages
   */
  async testAllLanguages() {
    console.log('\n=== Supported Languages ===');
    const languages = this.detector.getSupportedLanguages();
    console.log('Total languages:', languages.length);
    console.log('Languages:', languages.join(', '));
  }

  /**
   * Example 12: Check syntax parsing availability
   */
  checkSyntaxParsing() {
    const available = this.detector.isSyntaxParsingAvailable();
    console.log('\n=== Syntax Parsing ===');
    console.log('Available:', available ? 'Yes (acorn loaded)' : 'No (acorn not available)');
  }

  /**
   * Run all examples
   */
  async runAll() {
    console.log('=== Enhanced Code Detector Demo ===\n');

    await this.detectJavaScript();
    await this.detectPython();
    await this.detectSQL();
    await this.detectRegularText();
    await this.detectHTML();
    await this.detectCSS();
    await this.detectShell();
    await this.detectCodeLikeText();
    await this.batchDetection();
    await this.compareDetectionMethods();
    await this.testAllLanguages();
    this.checkSyntaxParsing();

    console.log('\n=== Demo Complete ===');
  }
}

// Usage example
export async function runEnhancedCodeDemo() {
  const demo = new EnhancedCodeDemo();
  await demo.runAll();
}
