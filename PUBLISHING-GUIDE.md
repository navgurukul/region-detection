# 📦 NPM Publishing Guide

## Prerequisites

1. **NPM Account**
   - Create account at https://www.npmjs.com/signup
   - Verify your email address

2. **Organization Access**
   - You need access to the `@navgurukul` organization on NPM
   - Or create the organization: https://www.npmjs.com/org/create

## Step-by-Step Publishing

### 1. Login to NPM

```bash
npm login
```

Enter your credentials:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify login:
```bash
npm whoami
# Should show your username
```

### 2. Verify Package Configuration

Check package.json:
```bash
cat package.json | grep -E "name|version"
```

Should show:
```json
"name": "@navgurukul/screen-region-detector",
"version": "1.0.0",
```

### 3. Build the Library

```bash
npm run build:lib
```

This will:
- Compile TypeScript to JavaScript
- Generate TypeScript declaration files (.d.ts)
- Bundle the library with Vite
- Output to `dist/` folder

Verify build output:
```bash
ls -la dist/
```

Should contain:
- `index.js` - Main library file
- `index.d.ts` - TypeScript declarations
- `*.d.ts` - Type definitions for all modules

### 4. Test the Package Locally (Optional)

Create a test project:
```bash
cd ..
mkdir test-package
cd test-package
npm init -y
npm link ../screen-region-detector-client
```

Test import:
```javascript
import { HierarchicalOCRDetector } from '@navgurukul/screen-region-detector';
console.log('Package works!');
```

### 5. Publish to NPM

**Dry run first (recommended):**
```bash
npm publish --dry-run
```

This shows what will be published without actually publishing.

**Publish for real:**
```bash
npm publish --access public
```

Note: `--access public` is required for scoped packages (@navgurukul/...)

### 6. Verify Publication

Check on NPM:
```bash
npm view @navgurukul/screen-region-detector
```

Or visit: https://www.npmjs.com/package/@navgurukul/screen-region-detector

### 7. Test Installation

In a new project:
```bash
npm install @navgurukul/screen-region-detector
```

## Publishing Updates

### Patch Release (1.0.0 → 1.0.1)
Bug fixes, minor changes:
```bash
npm version patch
npm publish --access public
git push && git push --tags
```

### Minor Release (1.0.0 → 1.1.0)
New features, backward compatible:
```bash
npm version minor
npm publish --access public
git push && git push --tags
```

### Major Release (1.0.0 → 2.0.0)
Breaking changes:
```bash
npm version major
npm publish --access public
git push && git push --tags
```

## Troubleshooting

### Error: 401 Unauthorized
**Problem:** Not logged in to NPM
**Solution:**
```bash
npm login
```

### Error: 403 Forbidden
**Problem:** No access to @navgurukul organization
**Solution:**
1. Ask organization owner to add you
2. Or publish under your own scope: `@yourusername/screen-region-detector`

### Error: Package already exists
**Problem:** Version 1.0.0 already published
**Solution:**
```bash
npm version patch  # Bump to 1.0.1
npm publish --access public
```

### Error: Missing files in package
**Problem:** Files not included in `files` field in package.json
**Solution:** Check package.json `files` array includes:
```json
"files": [
  "dist",
  "README.md",
  "LICENSE"
]
```

### Build fails
**Problem:** TypeScript or Vite errors
**Solution:**
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build:lib
```

## What Gets Published

Only these files/folders are included (defined in package.json):
- `dist/` - Compiled library code
- `README.md` - Documentation
- `LICENSE` - MIT license
- `package.json` - Package metadata

**NOT included:**
- `src/` - Source code (users get compiled version)
- `node_modules/` - Dependencies
- Demo files (index.html, hierarchical-demo.html, etc.)
- Test files
- Documentation files (except README)

## Package Info

- **Name:** `@navgurukul/screen-region-detector`
- **Version:** `1.0.0`
- **License:** MIT
- **Repository:** https://github.com/navgurukul/region-detection
- **Homepage:** https://navgurukul.github.io/region-detection/

## After Publishing

1. **Update README badges** (if needed)
2. **Create GitHub release** with tag `v1.0.0`
3. **Announce on social media** (optional)
4. **Update documentation** with installation instructions

## Quick Commands Reference

```bash
# Login
npm login

# Build
npm run build:lib

# Dry run
npm publish --dry-run

# Publish
npm publish --access public

# Check published package
npm view @navgurukul/screen-region-detector

# Update version
npm version patch|minor|major

# Unpublish (within 72 hours only)
npm unpublish @navgurukul/screen-region-detector@1.0.0
```

## Need Help?

If you encounter any issues:

1. Check NPM documentation: https://docs.npmjs.com/
2. Verify you're logged in: `npm whoami`
3. Check organization access: https://www.npmjs.com/settings/navgurukul/members
4. Contact me for assistance!

---

**Ready to publish?** Run these commands:

```bash
npm login
npm run build:lib
npm publish --access public
```

Good luck! 🚀
