/**
 * Quick test script for Enhanced Code Detector
 * Run with: node test-enhanced-detector.js
 */

// Simulate the detector logic without imports
class TestEnhancedCodeDetector {
  
  // Test pattern matching
  testPatternMatching() {
    console.log('\n=== Testing Pattern Matching ===');
    
    const tests = [
      { text: 'function hello() { console.log("hi"); }', expected: true, lang: 'javascript' },
      { text: 'def greet():\n    print("hello")', expected: true, lang: 'python' },
      { text: 'SELECT * FROM users WHERE id = 1;', expected: true, lang: 'sql' },
      { text: 'This is just regular text.', expected: false, lang: null },
    ];
    
    tests.forEach((test, i) => {
      const hasJSPattern = /function\s+\w+/.test(test.text) || /console\./.test(test.text);
      const hasPyPattern = /def\s+\w+\s*\(/.test(test.text) || /print\s*\(/.test(test.text);
      const hasSQLPattern = /SELECT\s+.*FROM/i.test(test.text);
      
      const detected = hasJSPattern || hasPyPattern || hasSQLPattern;
      const pass = detected === test.expected;
      
      console.log(`Test ${i + 1}: ${pass ? '✅ PASS' : '❌ FAIL'} - ${test.expected ? 'Code' : 'Text'}`);
      if (!pass) {
        console.log(`  Expected: ${test.expected}, Got: ${detected}`);
      }
    });
  }
  
  // Test statistical analysis
  testStatisticalAnalysis() {
    console.log('\n=== Testing Statistical Analysis ===');
    
    const tests = [
      { text: 'const x = 5;\nif (x > 0) {\n  console.log(x);\n}', expected: true },
      { text: 'This is a normal sentence with proper grammar.', expected: false },
    ];
    
    tests.forEach((test, i) => {
      const specialChars = (test.text.match(/[{}()\[\];:=<>]/g) || []).length;
      const ratio = specialChars / test.text.length;
      const detected = ratio > 0.08;
      const pass = detected === test.expected;
      
      console.log(`Test ${i + 1}: ${pass ? '✅ PASS' : '❌ FAIL'} - Special char ratio: ${(ratio * 100).toFixed(1)}%`);
    });
  }
  
  // Test bracket balance
  testBracketBalance() {
    console.log('\n=== Testing Bracket Balance ===');
    
    const tests = [
      { text: 'function() { return [1, 2, 3]; }', expected: true },
      { text: 'function() { return [1, 2, 3; }', expected: false },
      { text: 'if (x > 0) { console.log(x); }', expected: true },
    ];
    
    tests.forEach((test, i) => {
      const balanced = this.hasBalancedBrackets(test.text);
      const pass = balanced === test.expected;
      
      console.log(`Test ${i + 1}: ${pass ? '✅ PASS' : '❌ FAIL'} - Balanced: ${balanced}`);
    });
  }
  
  hasBalancedBrackets(text) {
    const pairs = { '(': ')', '[': ']', '{': '}' };
    const stack = [];
    
    for (const char of text) {
      if (char in pairs) {
        stack.push(char);
      } else if (Object.values(pairs).includes(char)) {
        const last = stack.pop();
        if (!last || pairs[last] !== char) {
          return false;
        }
      }
    }
    
    return stack.length === 0;
  }
  
  // Run all tests
  runAll() {
    console.log('╔════════════════════════════════════════════╗');
    console.log('║  Enhanced Code Detector - Unit Tests      ║');
    console.log('╚════════════════════════════════════════════╝');
    
    this.testPatternMatching();
    this.testStatisticalAnalysis();
    this.testBracketBalance();
    
    console.log('\n╔════════════════════════════════════════════╗');
    console.log('║  All Tests Complete!                       ║');
    console.log('╚════════════════════════════════════════════╝\n');
  }
}

// Run tests
const tester = new TestEnhancedCodeDetector();
tester.runAll();
