/**
 * Content Classifier
 * 
 * Classifies text regions into semantic categories:
 * - project_structure: File/folder trees, directory listings
 * - code: Actual programming code
 * - file_path: File names, paths (src/, config.ts)
 * - documentation: README, comments, markdown
 * - terminal: Command output, logs
 * - ui_element: Buttons, menus, labels
 * - regular_text: Normal prose
 */

export type ContentType = 
  | 'project_structure'
  | 'code'
  | 'file_path'
  | 'documentation'
  | 'terminal'
  | 'ui_element'
  | 'regular_text';

export interface ContentClassificationResult {
  type: ContentType;
  confidence: number;
  subtype?: string;  // e.g., 'folder_tree', 'javascript_code', 'bash_command'
  features: {
    hasTreeChars: boolean;
    hasFileExtensions: boolean;
    hasCodePatterns: boolean;
    hasCommandPrompt: boolean;
    hasMarkdown: boolean;
    hasUIPatterns: boolean;
  };
}

export class ContentClassifier {
  
  /**
   * Classify text content into semantic categories
   */
  classify(text: string): ContentClassificationResult {
    if (!text || text.trim().length < 3) {
      return {
        type: 'regular_text',
        confidence: 0,
        features: this.extractFeatures(text),
      };
    }

    // Extract features
    const features = this.extractFeatures(text);
    
    // Calculate scores for each content type
    const scores = {
      project_structure: this.scoreProjectStructure(text, features),
      file_path: this.scoreFilePath(text, features),
      code: this.scoreCode(text, features),
      terminal: this.scoreTerminal(text, features),
      documentation: this.scoreDocumentation(text, features),
      ui_element: this.scoreUIElement(text, features),
      regular_text: this.scoreRegularText(text, features),
    };

    // Find highest scoring type
    let maxScore = 0;
    let detectedType: ContentType = 'regular_text';
    let subtype: string | undefined;

    for (const [type, scoreResult] of Object.entries(scores)) {
      if (scoreResult.score > maxScore) {
        maxScore = scoreResult.score;
        detectedType = type as ContentType;
        subtype = scoreResult.subtype;
      }
    }

    return {
      type: detectedType,
      confidence: Math.min(maxScore, 1.0),
      subtype,
      features,
    };
  }

  /**
   * Extract features from text
   */
  private extractFeatures(text: string) {
    return {
      hasTreeChars: this.hasTreeCharacters(text),
      hasFileExtensions: this.hasFileExtensions(text),
      hasCodePatterns: this.hasCodePatterns(text),
      hasCommandPrompt: this.hasCommandPrompt(text),
      hasMarkdown: this.hasMarkdown(text),
      hasUIPatterns: this.hasUIPatterns(text),
    };
  }

  /**
   * Score: Project Structure (file/folder trees)
   */
  private scoreProjectStructure(text: string, features: any): { score: number; subtype?: string } {
    let score = 0;
    let subtype: string | undefined;

    // Tree characters: ├── └── │ ─
    if (features.hasTreeChars) {
      score += 0.5;
      subtype = 'folder_tree';
    }

    // Multiple lines with indentation
    const lines = text.split('\n');
    const indentedLines = lines.filter(l => /^[\s│├└─]+/.test(l));
    if (indentedLines.length > 2 && indentedLines.length / lines.length > 0.5) {
      score += 0.3;
    }

    // File extensions in multiple lines
    const linesWithExtensions = lines.filter(l => /\.\w{1,4}(\s|$)/.test(l));
    if (linesWithExtensions.length > 2) {
      score += 0.2;
    }

    // Folder indicators: 📁 📂 / or trailing /
    if (/[📁📂]|\/\s*$/m.test(text)) {
      score += 0.15;
    }

    // Common folder names
    const folderPatterns = [
      /\bsrc\b/,
      /\bdist\b/,
      /\bnode_modules\b/,
      /\bpublic\b/,
      /\bcomponents\b/,
      /\butils\b/,
      /\blib\b/,
      /\btest\b/,
    ];
    const folderMatches = folderPatterns.filter(p => p.test(text)).length;
    if (folderMatches > 1) {
      score += 0.15;
      subtype = 'directory_listing';
    }

    // Bullet points or dashes at line start
    const bulletLines = lines.filter(l => /^[\s]*[-•*]\s+/.test(l));
    if (bulletLines.length > 2 && features.hasFileExtensions) {
      score += 0.1;
    }

    return { score, subtype };
  }

  /**
   * Score: File Path (file names, paths)
   */
  private scoreFilePath(text: string, features: any): { score: number; subtype?: string } {
    let score = 0;
    let subtype: string | undefined;

    const trimmed = text.trim();
    const lines = text.split('\n');

    // Single line or very short
    if (lines.length <= 2 && trimmed.length < 100) {
      
      // Has file extension
      if (/\.\w{1,4}$/.test(trimmed)) {
        score += 0.4;
        subtype = 'file_name';
      }

      // Path separators
      if (/[\/\\]/.test(trimmed)) {
        score += 0.3;
        subtype = 'file_path';
      }

      // Common path patterns
      if (/^(\.\/|\.\.\/|\/|~\/|[A-Z]:\\)/.test(trimmed)) {
        score += 0.2;
      }

      // Looks like: src/components/Button.tsx
      if (/^[\w\-\.\/\\]+\.\w{1,4}$/.test(trimmed)) {
        score += 0.3;
      }
    }

    return { score, subtype };
  }

  /**
   * Score: Code (programming code)
   */
  private scoreCode(text: string, features: any): { score: number; subtype?: string } {
    let score = 0;
    let subtype: string | undefined;

    if (!features.hasCodePatterns) {
      return { score: 0 };
    }

    // Code keywords
    const codeKeywords = [
      /\bfunction\s+\w+/,
      /\bconst\s+\w+\s*=/,
      /\blet\s+\w+\s*=/,
      /\bvar\s+\w+\s*=/,
      /\bclass\s+\w+/,
      /\bdef\s+\w+\s*\(/,
      /\bimport\s+/,
      /\bexport\s+/,
      /\breturn\s+/,
    ];

    const keywordMatches = codeKeywords.filter(p => p.test(text)).length;
    if (keywordMatches > 0) {
      score += keywordMatches * 0.15;
      subtype = 'source_code';
    }

    // Special characters density
    const specialChars = text.match(/[{}()\[\];:=<>]/g);
    const ratio = specialChars ? specialChars.length / text.length : 0;
    if (ratio > 0.1) {
      score += 0.3;
    }

    // Indentation (code has consistent indentation)
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const indentedLines = lines.filter(l => /^[\s\t]+/.test(l));
    if (indentedLines.length / lines.length > 0.4) {
      score += 0.2;
    }

    // Has brackets and semicolons
    if (/[{}]/.test(text) && /;/.test(text)) {
      score += 0.15;
    }

    return { score, subtype };
  }

  /**
   * Score: Terminal (command output, logs)
   */
  private scoreTerminal(text: string, features: any): { score: number; subtype?: string } {
    let score = 0;
    let subtype: string | undefined;

    // Command prompt indicators
    if (features.hasCommandPrompt) {
      score += 0.4;
      subtype = 'bash_command';
    }

    // Common commands
    const commands = [
      /\b(npm|yarn|pnpm)\s+(install|run|build|dev|start)/,
      /\b(git)\s+(clone|pull|push|commit|add|status)/,
      /\b(cd|ls|pwd|mkdir|rm|cp|mv)\s+/,
      /\b(node|python|java|gcc)\s+/,
      /\b(docker|kubectl)\s+/,
    ];

    const commandMatches = commands.filter(p => p.test(text)).length;
    if (commandMatches > 0) {
      score += commandMatches * 0.2;
      subtype = 'command_output';
    }

    // Log patterns
    const logPatterns = [
      /\[(INFO|WARN|ERROR|DEBUG)\]/,
      /\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/,  // timestamp
      /^>\s+/m,  // output indicator
      /\berror:/i,
      /\bwarning:/i,
    ];

    const logMatches = logPatterns.filter(p => p.test(text)).length;
    if (logMatches > 0) {
      score += logMatches * 0.15;
      subtype = 'log_output';
    }

    // Exit codes
    if (/Exit\s+Code:\s*\d+/.test(text)) {
      score += 0.2;
    }

    return { score, subtype };
  }

  /**
   * Score: Documentation (README, comments, markdown)
   */
  private scoreDocumentation(text: string, features: any): { score: number; subtype?: string } {
    let score = 0;
    let subtype: string | undefined;

    // Markdown headers
    if (features.hasMarkdown) {
      score += 0.3;
      subtype = 'markdown';
    }

    // Documentation keywords
    const docKeywords = [
      /\b(README|CHANGELOG|LICENSE|CONTRIBUTING)\b/i,
      /\b(Installation|Usage|Example|API|Documentation)\b/,
      /\b(Getting Started|Quick Start|Tutorial)\b/i,
    ];

    const docMatches = docKeywords.filter(p => p.test(text)).length;
    if (docMatches > 0) {
      score += docMatches * 0.15;
      subtype = 'documentation';
    }

    // Code comments
    if (/^[\s]*\/\/|^[\s]*\/\*|^[\s]*\*|^[\s]*#/m.test(text)) {
      score += 0.2;
      subtype = 'code_comment';
    }

    // Markdown lists
    if (/^[\s]*[-*+]\s+/m.test(text)) {
      score += 0.1;
    }

    // Links
    if (/\[.*\]\(.*\)/.test(text) || /https?:\/\//.test(text)) {
      score += 0.15;
    }

    return { score, subtype };
  }

  /**
   * Score: UI Element (buttons, menus, labels)
   */
  private scoreUIElement(text: string, features: any): { score: number; subtype?: string } {
    let score = 0;
    let subtype: string | undefined;

    const trimmed = text.trim();
    const lines = text.split('\n');

    // Very short text (typical for UI elements)
    if (trimmed.length < 50 && lines.length <= 2) {
      score += 0.2;
    }

    // UI action words
    const uiActions = [
      /^(Click|Press|Tap|Select|Choose|Open|Close|Save|Cancel|Submit|Delete|Edit|Add|Remove)\b/i,
      /\b(Button|Menu|Tab|Link|Icon|Label|Input|Checkbox|Radio)\b/i,
    ];

    const uiMatches = uiActions.filter(p => p.test(text)).length;
    if (uiMatches > 0) {
      score += uiMatches * 0.25;
      subtype = 'ui_label';
    }

    // Title case (common in UI)
    if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/.test(trimmed)) {
      score += 0.15;
    }

    // All caps (buttons often use this)
    if (trimmed.length < 30 && /^[A-Z\s]+$/.test(trimmed)) {
      score += 0.2;
      subtype = 'button';
    }

    // Has emoji (common in modern UI)
    if (/[\u{1F300}-\u{1F9FF}]/u.test(text)) {
      score += 0.15;
    }

    return { score, subtype };
  }

  /**
   * Score: Regular Text (prose, paragraphs)
   */
  private scoreRegularText(text: string, features: any): { score: number; subtype?: string } {
    let score = 0.3;  // Base score

    // Complete sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    if (sentences.length > 1) {
      score += 0.2;
    }

    // Proper capitalization
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const capitalizedLines = lines.filter(l => /^[A-Z]/.test(l.trim()));
    if (capitalizedLines.length / lines.length > 0.5) {
      score += 0.15;
    }

    // Low special character density
    const specialChars = text.match(/[{}()\[\];:=<>]/g);
    const ratio = specialChars ? specialChars.length / text.length : 0;
    if (ratio < 0.05) {
      score += 0.15;
    }

    // Penalize if has code/terminal features
    if (features.hasCodePatterns || features.hasCommandPrompt) {
      score -= 0.3;
    }

    return { score };
  }

  /**
   * Helper: Check for tree characters
   */
  private hasTreeCharacters(text: string): boolean {
    return /[├└│─]|[📁📂]/.test(text);
  }

  /**
   * Helper: Check for file extensions
   */
  private hasFileExtensions(text: string): boolean {
    return /\.(js|ts|tsx|jsx|py|java|cpp|c|h|css|html|json|md|txt|yml|yaml|xml|sh|go|rs|rb)\b/.test(text);
  }

  /**
   * Helper: Check for code patterns
   */
  private hasCodePatterns(text: string): boolean {
    const patterns = [
      /\bfunction\s+\w+/,
      /\bconst\s+\w+\s*=/,
      /\bdef\s+\w+\s*\(/,
      /\bclass\s+\w+/,
      /\bimport\s+/,
      /=>/,
      /[{}()\[\]];/,
    ];
    return patterns.some(p => p.test(text));
  }

  /**
   * Helper: Check for command prompt
   */
  private hasCommandPrompt(text: string): boolean {
    return /^[\s]*[$#>]\s+/m.test(text) || /^[\s]*\w+@\w+:/m.test(text);
  }

  /**
   * Helper: Check for markdown
   */
  private hasMarkdown(text: string): boolean {
    return /^#{1,6}\s+/m.test(text) || /\*\*.*\*\*/.test(text) || /\[.*\]\(.*\)/.test(text);
  }

  /**
   * Helper: Check for UI patterns
   */
  private hasUIPatterns(text: string): boolean {
    return /^(Click|Press|Button|Menu|Tab)\b/i.test(text);
  }

  /**
   * Batch classification
   */
  classifyBatch(texts: string[]): ContentClassificationResult[] {
    return texts.map(text => this.classify(text));
  }

  /**
   * Get all possible content types
   */
  getContentTypes(): ContentType[] {
    return [
      'project_structure',
      'code',
      'file_path',
      'documentation',
      'terminal',
      'ui_element',
      'regular_text',
    ];
  }
}
