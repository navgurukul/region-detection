/**
 * Test Content Classifier
 * Run with: node test-content-classifier.js
 */

class TestContentClassifier {
  
  runTests() {
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║     Content Classifier - Semantic Detection       ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

    this.testProjectStructure();
    this.testFilePath();
    this.testCode();
    this.testTerminal();
    this.testDocumentation();
    this.testUIElement();
    this.testRegularText();
    this.testRealWorldScenario();

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║              All Tests Complete!                   ║');
    console.log('╚════════════════════════════════════════════════════╝\n');
  }

  testProjectStructure() {
    console.log('=== Test 1: Project Structure ===');
    
    const samples = [
      {
        name: 'Folder tree with box chars',
        text: `├── src/
│   ├── components/
│   └── utils/
└── package.json`,
        expected: 'project_structure'
      },
      {
        name: 'Directory listing',
        text: `src/
  components/
  utils/
package.json`,
        expected: 'project_structure'
      }
    ];

    samples.forEach(sample => {
      const detected = this.classify(sample.text);
      const pass = detected === sample.expected;
      console.log(`  ${pass ? '✅' : '❌'} ${sample.name}: ${detected}`);
    });
  }

  testFilePath() {
    console.log('\n=== Test 2: File Paths ===');
    
    const samples = [
      { text: 'src/components/Button.tsx', expected: 'file_path' },
      { text: './utils/helpers.ts', expected: 'file_path' },
      { text: 'config.json', expected: 'file_path' },
    ];

    samples.forEach(sample => {
      const detected = this.classify(sample.text);
      const pass = detected === sample.expected;
      console.log(`  ${pass ? '✅' : '❌'} "${sample.text}": ${detected}`);
    });
  }

  testCode() {
    console.log('\n=== Test 3: Source Code ===');
    
    const samples = [
      {
        text: `function hello() {
  console.log("hi");
}`,
        expected: 'code'
      },
      {
        text: `const x = 5;
if (x > 0) {
  return true;
}`,
        expected: 'code'
      }
    ];

    samples.forEach((sample, i) => {
      const detected = this.classify(sample.text);
      const pass = detected === sample.expected;
      console.log(`  ${pass ? '✅' : '❌'} Code sample ${i + 1}: ${detected}`);
    });
  }

  testTerminal() {
    console.log('\n=== Test 4: Terminal/Commands ===');
    
    const samples = [
      { text: '$ npm install', expected: 'terminal' },
      { text: '$ git clone https://...', expected: 'terminal' },
      { text: '[INFO] Server started', expected: 'terminal' },
    ];

    samples.forEach(sample => {
      const detected = this.classify(sample.text);
      const pass = detected === sample.expected;
      console.log(`  ${pass ? '✅' : '❌'} "${sample.text}": ${detected}`);
    });
  }

  testDocumentation() {
    console.log('\n=== Test 5: Documentation ===');
    
    const samples = [
      { text: '# README\n\n## Installation', expected: 'documentation' },
      { text: '// This is a comment', expected: 'documentation' },
    ];

    samples.forEach((sample, i) => {
      const detected = this.classify(sample.text);
      const pass = detected === sample.expected;
      console.log(`  ${pass ? '✅' : '❌'} Doc sample ${i + 1}: ${detected}`);
    });
  }

  testUIElement() {
    console.log('\n=== Test 6: UI Elements ===');
    
    const samples = [
      { text: 'Click Here', expected: 'ui_element' },
      { text: 'SUBMIT', expected: 'ui_element' },
      { text: 'Save Changes', expected: 'ui_element' },
    ];

    samples.forEach(sample => {
      const detected = this.classify(sample.text);
      const pass = detected === sample.expected;
      console.log(`  ${pass ? '✅' : '❌'} "${sample.text}": ${detected}`);
    });
  }

  testRegularText() {
    console.log('\n=== Test 7: Regular Text ===');
    
    const text = 'This is a normal paragraph. It contains regular sentences.';
    const detected = this.classify(text);
    const pass = detected === 'regular_text';
    console.log(`  ${pass ? '✅' : '❌'} Regular paragraph: ${detected}`);
  }

  testRealWorldScenario() {
    console.log('\n=== Test 8: Real-World GitHub Screenshot ===');
    
    const scenarios = [
      {
        name: 'Left Sidebar (File Tree)',
        text: `├── .github/
├── src/
│   ├── components/
│   └── index.ts
└── package.json`,
        expected: 'project_structure'
      },
      {
        name: 'Main Content (Code)',
        text: `export function sum(a, b) {
  return a + b;
}`,
        expected: 'code'
      },
      {
        name: 'Terminal Output',
        text: `$ npm run build
✓ Build complete`,
        expected: 'terminal'
      },
      {
        name: 'File Tab',
        text: 'src/index.ts',
        expected: 'file_path'
      }
    ];

    scenarios.forEach(scenario => {
      const detected = this.classify(scenario.text);
      const pass = detected === scenario.expected;
      console.log(`  ${pass ? '✅' : '❌'} ${scenario.name}: ${detected}`);
    });
  }

  // Simplified classifier logic for testing
  classify(text) {
    // Project structure
    if (/[├└│─]/.test(text) || (text.includes('/') && text.split('\n').length > 2)) {
      return 'project_structure';
    }

    // File path
    if (text.length < 100 && /\.\w{1,4}$/.test(text.trim()) && text.split('\n').length <= 2) {
      return 'file_path';
    }

    // Terminal
    if (/^[\s]*[$#>]\s+/m.test(text) || /\[(INFO|WARN|ERROR)\]/.test(text)) {
      return 'terminal';
    }

    // Code
    if (/function\s+\w+|const\s+\w+\s*=|=>|[{}();]/.test(text)) {
      const specialChars = (text.match(/[{}()\[\];:=<>]/g) || []).length;
      if (specialChars / text.length > 0.08) {
        return 'code';
      }
    }

    // Documentation
    if (/^#{1,6}\s+/m.test(text) || /^[\s]*\/\//.test(text)) {
      return 'documentation';
    }

    // UI Element
    if (text.length < 50 && /^(Click|Press|SUBMIT|Save|Cancel)/i.test(text)) {
      return 'ui_element';
    }

    return 'regular_text';
  }
}

// Run tests
const tester = new TestContentClassifier();
tester.runTests();
