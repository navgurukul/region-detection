# Screenshot Examples for Training

## What Makes a Good Training Screenshot?

Your screenshots should show **real working scenarios** with the applications you want to detect.

## Example Scenarios

### Scenario 1: Coding Session
```
┌─────────────────────────────────────────────────────────┐
│  VS Code (Left Half)     │  Chrome (Right Half)         │
│  ├─ Sidebar              │  ├─ Address Bar              │
│  ├─ Editor (Python)      │  ├─ GitHub Page              │
│  └─ Terminal Panel       │  └─ Documentation            │
└─────────────────────────────────────────────────────────┘
```
**Label:** Draw box around VS Code → label "vscode"
**Label:** Draw box around Chrome → label "chrome"

### Scenario 2: Full Screen Editor
```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                    VS Code (Full Screen)                 │
│                                                          │
│  ├─ File Explorer (left)                                │
│  ├─ Editor (center) - JavaScript code                   │
│  └─ Terminal (bottom)                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```
**Label:** Draw box around entire VS Code window → label "vscode"

### Scenario 3: Multiple Windows
```
┌─────────────────────────────────────────────────────────┐
│  ┌──────────────┐                                       │
│  │   Terminal   │    ┌─────────────────────┐           │
│  │   (small)    │    │                     │           │
│  └──────────────┘    │    VS Code          │           │
│                      │    (large)          │           │
│  ┌─────────────────┐│                     │           │
│  │   Chrome        ││                     │           │
│  │   (medium)      │└─────────────────────┘           │
│  └─────────────────┘                                   │
└─────────────────────────────────────────────────────────┘
```
**Label:** Draw box around Terminal → label "terminal"
**Label:** Draw box around VS Code → label "vscode"
**Label:** Draw box around Chrome → label "chrome"

### Scenario 4: Overlapping Windows
```
┌─────────────────────────────────────────────────────────┐
│  ┌────────────────────────┐                             │
│  │   Chrome               │                             │
│  │   ┌────────────────────┼──────────┐                 │
│  │   │                    │          │                 │
│  └───┼────────────────────┘          │                 │
│      │      VS Code                  │                 │
│      │      (overlapping)            │                 │
│      └───────────────────────────────┘                 │
└─────────────────────────────────────────────────────────┘
```
**Label:** Draw box around Chrome (even if partially hidden) → label "chrome"
**Label:** Draw box around VS Code → label "vscode"

## Real Examples You Should Take

### Example Set 1: VS Code Variations (50 screenshots)
- VS Code full screen, dark theme, Python code
- VS Code full screen, light theme, JavaScript code
- VS Code left half, dark theme, TypeScript code
- VS Code right half, light theme, HTML code
- VS Code with terminal panel open
- VS Code with sidebar collapsed
- VS Code with multiple editor tabs
- VS Code with split editor view
- VS Code with extensions panel open
- VS Code with debug panel open

### Example Set 2: Browser Variations (50 screenshots)
- Chrome full screen, GitHub
- Chrome full screen, Stack Overflow
- Chrome full screen, documentation site
- Chrome left half, any website
- Chrome right half, any website
- Chrome with DevTools open
- Firefox full screen
- Firefox half screen
- Multiple browser windows
- Browser with many tabs visible

### Example Set 3: Terminal Variations (30 screenshots)
- Terminal full screen
- Terminal bottom half
- Terminal small window
- Terminal with different commands running
- Terminal with colored output
- Terminal with logs scrolling
- iTerm2 (if you use it)
- Multiple terminal windows

### Example Set 4: Multi-Window Scenarios (70 screenshots)
- VS Code + Chrome side by side
- VS Code + Terminal side by side
- VS Code + Chrome + Terminal (all visible)
- Browser + Browser (two browsers)
- VS Code + Slack
- VS Code + Zoom
- Any combination of your daily apps
- Overlapping windows
- Windows at different depths
- Windows partially off-screen

### Example Set 5: Real Work Sessions (100+ screenshots)
Take screenshots throughout your actual workday:
- Morning coding session
- Afternoon debugging
- Code review on GitHub
- Writing documentation
- Running tests
- Deploying code
- Researching solutions
- Attending meetings (with screen share)

## Screenshot Checklist

Before taking screenshots, ensure:

- [ ] Multiple applications visible (when possible)
- [ ] Window title bars are visible
- [ ] Different window sizes
- [ ] Different positions on screen
- [ ] Both light and dark themes
- [ ] Real content (not empty windows)
- [ ] Overlapping windows included
- [ ] Partial windows included
- [ ] Your typical working arrangements
- [ ] Different times of day (if lighting affects screen)

## What to Avoid

❌ **Bad Screenshot Examples:**

1. **Empty Windows**
   - Blank VS Code with no files open
   - Empty browser with no website loaded
   - Terminal with no output

2. **Too Repetitive**
   - 100 screenshots of the same layout
   - Only full-screen captures
   - Same content every time

3. **Unrealistic Scenarios**
   - Apps you never use
   - Arrangements you never work in
   - Artificial test setups

## Labeling Tips

When you upload to Roboflow:

1. **Draw tight boxes** around each window
2. **Include title bars** in the box
3. **Label consistently:**
   - "vscode" (not "VSCode" or "vs-code")
   - "chrome" (not "Chrome Browser")
   - "terminal" (not "Terminal.app")
   - "firefox" (not "Firefox Browser")

4. **Label partial windows** too
   - Even if only 30% visible, draw a box and label it

5. **Don't label:**
   - Desktop background
   - Menu bars (top of screen)
   - Dock/taskbar
   - Individual UI elements inside windows

## Summary

**Goal:** Teach the AI what your applications look like in real working scenarios.

**Method:** Take 200-500 screenshots of your actual workspace with different apps, layouts, and content.

**Result:** AI learns to accurately detect and identify your applications during screen sharing!

## Quick Start Command

```bash
# Run this to get started
cd screen-region-detector-client/training
bash take_screenshots.sh
```

Then start taking screenshots using:
- **Mac:** Cmd + Shift + 4 (select area)
- **Mac:** Cmd + Shift + 4 + Spacebar (capture window)

Save them all to the folder that opens, then upload to Roboflow for labeling!
