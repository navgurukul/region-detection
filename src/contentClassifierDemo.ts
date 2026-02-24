/**
 * Content Classifier Demo
 * Shows how to classify different types of screen content
 */

import { ContentClassifier } from './contentClassifier';

export class ContentClassifierDemo {
  private classifier: ContentClassifier;

  constructor() {
    this.classifier = new ContentClassifier();
  }

  /**
   * Example 1: Project Structure (folder tree)
   */
  classifyProjectStructure() {
    const text = `
├── src/
│   ├── components/
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── utils/
│   │   └── helpers.ts
│   └── index.ts
├── public/
│   └── index.html
└── package.json
    `.trim();

    const result = this.classifier.classify(text);
    console.log('Project Structure:', result);
    // Expected: { type: 'project_structure', confidence: ~0.9, subtype: 'folder_tree' }
  }

  /**
   * Example 2: File Path
   */
  classifyFilePath() {
    const text = 'src/components/Button.tsx';

    const result = this.classifier.classify(text);
    console.log('File Path:', result);
    // Expected: { type: 'file_path', confidence: ~0.9, subtype: 'file_path' }
  }

  /**
   * Example 3: Source Code
   */
  classifyCode() {
    const text = `
function calculateSum(a, b) {
  const result = a + b;
  return result;
}
    `.trim();

    const result = this.classifier.classify(text);
    console.log('Source Code:', result);
    // Expected: { type: 'code', confidence: ~0.8, subtype: 'source_code' }
  }

  /**
   * Example 4: Terminal Command
   */
  classifyTerminal() {
    const text = `
$ npm install
$ npm run build
$ npm run dev
    `.trim();

    const result = this.classifier.classify(text);
    console.log('Terminal:', result);
    // Expected: { type: 'terminal', confidence: ~0.8, subtype: 'bash_command' }
  }

  /**
   * Example 5: Documentation
   */
  classifyDocumentation() {
    const text = `
# Getting Started

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

Import the library and use it.
    `.trim();

    const result = this.classifier.classify(text);
    console.log('Documentation:', result);
    // Expected: { type: 'documentation', confidence: ~0.7, subtype: 'markdown' }
  }

  /**
   * Example 6: UI Element
   */
  classifyUIElement() {
    const text = 'Click Here to Continue';

    const result = this.classifier.classify(text);
    console.log('UI Element:', result);
    // Expected: { type: 'ui_element', confidence: ~0.6, subtype: 'ui_label' }
  }

  /**
   * Example 7: Regular Text
   */
  classifyRegularText() {
    const text = `
This is a regular paragraph of text.
It contains normal sentences with proper grammar.
There are no code patterns or special formatting.
    `.trim();

    const result = this.classifier.classify(text);
    console.log('Regular Text:', result);
    // Expected: { type: 'regular_text', confidence: ~0.6 }
  }

  /**
   * Example 8: Directory Listing (no tree chars)
   */
  classifyDirectoryListing() {
    const text = `
src/
  components/
  utils/
  index.ts
public/
  index.html
package.json
    `.trim();

    const result = this.classifier.classify(text);
    console.log('Directory Listing:', result);
    // Expected: { type: 'project_structure', confidence: ~0.7 }
  }

  /**
   * Example 9: Log Output
   */
  classifyLogOutput() {
    const text = `
[INFO] Server started on port 3000
[WARN] Deprecated API usage detected
[ERROR] Failed to connect to database
    `.trim();

    const result = this.classifier.classify(text);
    console.log('Log Output:', result);
    // Expected: { type: 'terminal', confidence: ~0.6, subtype: 'log_output' }
  }

  /**
   * Example 10: Batch Classification
   */
  batchClassification() {
    const samples = [
      '├── src/',
      'src/components/Button.tsx',
      'function hello() {}',
      '$ npm install',
      '# README',
      'Click Here',
      'This is regular text.',
    ];

    const results = this.classifier.classifyBatch(samples);
    console.log('\nBatch Classification:');
    results.forEach((result, i) => {
      console.log(`  ${i + 1}. ${result.type} (${(result.confidence * 100).toFixed(0)}%) - ${result.subtype || 'N/A'}`);
    });
  }

  /**
   * Example 11: Real-world GitHub Screenshot
   */
  classifyGitHubScreenshot() {
    console.log('\n=== GitHub Screenshot Simulation ===');

    // Left sidebar (file tree)
    const sidebar = `
├── .github/
├── src/
│   ├── components/
│   ├── utils/
│   └── index.ts
├── public/
└── package.json
    `.trim();

    // Main content (code file)
    const codeContent = `
export function calculateSum(a: number, b: number): number {
  return a + b;
}
    `.trim();

    // Terminal at bottom
    const terminal = `
$ npm run build
> Building...
✓ Build complete
    `.trim();

    const results = {
      sidebar: this.classifier.classify(sidebar),
      code: this.classifier.classify(codeContent),
      terminal: this.classifier.classify(terminal),
    };

    console.log('Sidebar:', results.sidebar.type, `(${(results.sidebar.confidence * 100).toFixed(0)}%)`);
    console.log('Code:', results.code.type, `(${(results.code.confidence * 100).toFixed(0)}%)`);
    console.log('Terminal:', results.terminal.type, `(${(results.terminal.confidence * 100).toFixed(0)}%)`);
  }

  /**
   * Example 12: VS Code Screenshot
   */
  classifyVSCodeScreenshot() {
    console.log('\n=== VS Code Screenshot Simulation ===');

    // Explorer sidebar
    const explorer = `
EXPLORER
  src
    components
      Button.tsx
      Input.tsx
    utils
      helpers.ts
    index.ts
    `.trim();

    // Editor content
    const editor = `
import React from 'react';

export const Button: React.FC = () => {
  return <button>Click me</button>;
};
    `.trim();

    // Status bar
    const statusBar = 'Ln 5, Col 12    UTF-8    TypeScript React';

    const results = {
      explorer: this.classifier.classify(explorer),
      editor: this.classifier.classify(editor),
      statusBar: this.classifier.classify(statusBar),
    };

    console.log('Explorer:', results.explorer.type, `(${(results.explorer.confidence * 100).toFixed(0)}%)`);
    console.log('Editor:', results.editor.type, `(${(results.editor.confidence * 100).toFixed(0)}%)`);
    console.log('Status Bar:', results.statusBar.type, `(${(results.statusBar.confidence * 100).toFixed(0)}%)`);
  }

  /**
   * Run all examples
   */
  runAll() {
    console.log('=== Content Classifier Demo ===\n');

    this.classifyProjectStructure();
    this.classifyFilePath();
    this.classifyCode();
    this.classifyTerminal();
    this.classifyDocumentation();
    this.classifyUIElement();
    this.classifyRegularText();
    this.classifyDirectoryListing();
    this.classifyLogOutput();
    this.batchClassification();
    this.classifyGitHubScreenshot();
    this.classifyVSCodeScreenshot();

    console.log('\n=== Demo Complete ===');
  }
}

// Usage
export async function runContentClassifierDemo() {
  const demo = new ContentClassifierDemo();
  demo.runAll();
}
