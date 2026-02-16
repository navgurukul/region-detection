export const CONFIG = {
  // Detection settings
  DETECTION_FPS: 10,
  
  // Layout detection settings
  MIN_REGION_SIZE: 150, // Minimum width/height for detected regions
  EDGE_THRESHOLD: 50, // Sensitivity for edge detection (lower = more sensitive)
  MERGE_THRESHOLD: 0.3, // How much regions can overlap before merging
  
  // UI
  BOX_COLOR: '#00ff88',
  BOX_THICKNESS: 2,
  FONT_SIZE: 14,
  LABEL_PADDING: 4,
};
