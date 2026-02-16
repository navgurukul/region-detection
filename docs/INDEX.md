# Documentation Index

Complete guide to the Screen Region Detector system.

## Quick Navigation

### Getting Started
- [QUICKSTART.md](../QUICKSTART.md) - Get running in 5 minutes
- [SETUP.md](SETUP.md) - Detailed installation guide
- [README.md](../README.md) - Project overview

### Core Documentation
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design and data flow
- [API-USAGE.md](API-USAGE.md) - Programmatic usage examples
- [BROWSER-LIMITATIONS.md](BROWSER-LIMITATIONS.md) - Browser quirks and workarounds

### Advanced Topics
- [TRAINING.md](TRAINING.md) - Train custom YOLOv8 models
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment guide
- [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md) - Complete project overview

## Documentation by Role

### For Developers

**First Time Setup:**
1. [QUICKSTART.md](../QUICKSTART.md) - 5-minute setup
2. [SETUP.md](SETUP.md) - Detailed installation
3. [API-USAGE.md](API-USAGE.md) - Code examples

**Understanding the System:**
1. [ARCHITECTURE.md](ARCHITECTURE.md) - How it works
2. [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md) - Overview
3. [BROWSER-LIMITATIONS.md](BROWSER-LIMITATIONS.md) - Constraints

**Customization:**
1. [TRAINING.md](TRAINING.md) - Custom models
2. [API-USAGE.md](API-USAGE.md) - Advanced usage
3. [DEPLOYMENT.md](DEPLOYMENT.md) - Production setup

### For Data Scientists

**Model Training:**
1. [TRAINING.md](TRAINING.md) - Complete training guide
2. Dataset preparation
3. Model conversion
4. Performance optimization

**Model Deployment:**
1. ONNX conversion process
2. Browser optimization
3. Performance benchmarking

### For DevOps/SRE

**Deployment:**
1. [DEPLOYMENT.md](DEPLOYMENT.md) - All deployment options
2. Server configuration
3. CDN setup
4. Monitoring

**Performance:**
1. [ARCHITECTURE.md](ARCHITECTURE.md) - Performance optimizations
2. [BROWSER-LIMITATIONS.md](BROWSER-LIMITATIONS.md) - Browser constraints
3. Resource management

### For Product Managers

**Overview:**
1. [PROJECT-SUMMARY.md](../PROJECT-SUMMARY.md) - What it does
2. [README.md](../README.md) - Features and benefits
3. Use cases and applications

**Capabilities:**
1. Real-time detection
2. Privacy features
3. Browser support
4. Performance metrics

## Documentation by Topic

### Installation & Setup
- [QUICKSTART.md](../QUICKSTART.md) - Quick setup
- [SETUP.md](SETUP.md) - Detailed setup
- Troubleshooting common issues

### Architecture & Design
- [ARCHITECTURE.md](ARCHITECTURE.md) - System architecture
- Component overview
- Data flow diagrams
- Performance optimizations

### Development
- [API-USAGE.md](API-USAGE.md) - Code examples
- TypeScript types
- Event handling
- Error handling

### AI/ML
- [TRAINING.md](TRAINING.md) - Model training
- Dataset preparation
- ONNX conversion
- Model optimization

### Browser Compatibility
- [BROWSER-LIMITATIONS.md](BROWSER-LIMITATIONS.md) - Browser support
- API limitations
- Workarounds
- Testing strategies

### Deployment
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment
- Hosting options
- Performance tuning
- Security configuration

## Key Concepts

### Core Technologies
- **WebRTC** - Screen capture via getDisplayMedia
- **Web Workers** - Background processing
- **ONNX Runtime Web** - Browser AI inference
- **YOLOv8** - Object detection model
- **Canvas API** - Frame extraction and overlay

### Architecture Patterns
- **Client-Side Only** - No backend required
- **Worker-Based** - Non-blocking inference
- **Event-Driven** - Reactive updates
- **Modular** - Separated concerns

### Performance Strategies
- **Frame Rate Control** - Configurable FPS
- **Model Optimization** - ONNX format
- **Memory Management** - Efficient cleanup
- **Parallel Processing** - Web Workers

## Common Tasks

### Setup Tasks
```bash
# Install dependencies
npm install

# Download model
curl -L <model-url> -o public/models/yolov8n.onnx

# Start dev server
npm run dev
```

### Development Tasks
```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

### Model Tasks
```bash
# Convert model to ONNX
python scripts/convert_model.py --model yolov8n.pt

# Train custom model
python train.py

# Optimize model
python scripts/optimize_model.py
```

### Deployment Tasks
```bash
# Deploy to Netlify
netlify deploy --prod --dir=dist

# Deploy to Vercel
vercel --prod

# Build Docker image
docker build -t screen-detector .
```

## Troubleshooting Guide

### Common Issues

**Model won't load**
→ See [SETUP.md](SETUP.md#troubleshooting)

**Screen capture fails**
→ See [BROWSER-LIMITATIONS.md](BROWSER-LIMITATIONS.md#getdisplaymedia-constraints)

**Slow performance**
→ See [ARCHITECTURE.md](ARCHITECTURE.md#performance-optimizations)

**Browser compatibility**
→ See [BROWSER-LIMITATIONS.md](BROWSER-LIMITATIONS.md#browser-support-matrix)

**Deployment issues**
→ See [DEPLOYMENT.md](DEPLOYMENT.md#troubleshooting)

## Code Examples

### Basic Usage
See [API-USAGE.md](API-USAGE.md#basic-usage)

### Advanced Patterns
See [API-USAGE.md](API-USAGE.md#advanced-examples)

### Custom Integration
See [API-USAGE.md](API-USAGE.md#integration-with-other-libraries)

## External Resources

### ONNX Runtime
- [Official Docs](https://onnxruntime.ai/docs/)
- [Web API Reference](https://onnxruntime.ai/docs/api/js/)
- [GitHub](https://github.com/microsoft/onnxruntime)

### YOLOv8
- [Ultralytics Docs](https://docs.ultralytics.com)
- [Model Zoo](https://github.com/ultralytics/ultralytics)
- [Training Guide](https://docs.ultralytics.com/modes/train/)

### Web APIs
- [getDisplayMedia](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

### Tools
- [LabelImg](https://github.com/heartexlabs/labelImg) - Image labeling
- [Roboflow](https://roboflow.com) - Dataset management
- [Netron](https://netron.app) - Model visualization

## Version History

### v1.0.0 (Current)
- ✅ Client-side detection
- ✅ YOLOv8 support
- ✅ Web Worker processing
- ✅ Real-time overlay
- ✅ Production ready

### Planned Features
- [ ] WebGPU support
- [ ] Model caching
- [ ] Advanced OCR
- [ ] Multi-model support

## Contributing

See main [README.md](../README.md) for contribution guidelines.

## License

MIT License - See [LICENSE](../LICENSE) file

## Support

- 📖 Read documentation
- 🐛 Open GitHub issues
- 💬 Join discussions
- 📧 Contact maintainers

---

**Last Updated:** 2024
**Documentation Version:** 1.0.0
