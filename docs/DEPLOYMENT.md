# Deployment Guide

## Prerequisites

- Node.js 18+
- HTTPS domain (required for screen sharing in production)
- ONNX model file

## Build for Production

```bash
npm install
npm run build
```

This creates optimized files in `dist/` directory.

## Deployment Options

### 1. Netlify (Recommended)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

Or use drag-and-drop at https://app.netlify.com/drop

**Configuration:**

Create `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### 2. Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Configuration:**

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        }
      ]
    }
  ]
}
```

### 3. GitHub Pages

```bash
# Build
npm run build

# Deploy to gh-pages branch
npx gh-pages -d dist
```

Enable GitHub Pages in repository settings.

**Note:** GitHub Pages uses HTTPS by default, which is required.

### 4. Self-Hosted (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/screen-detector/dist;
    index index.html;

    # Required headers for SharedArrayBuffer
    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Cache ONNX models
    location ~* \.onnx$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Content-Type "application/octet-stream";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 5. Docker

Create `Dockerfile`:

```dockerfile
FROM nginx:alpine

# Copy built files
COPY dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Create `nginx.conf`:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    add_header Cross-Origin-Embedder-Policy "require-corp" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Build and run:

```bash
docker build -t screen-detector .
docker run -p 8080:80 screen-detector
```

## Model Hosting

### Option 1: Same Origin (Recommended)

Place model in `public/models/`:

```
public/
└── models/
    └── yolov8n.onnx
```

### Option 2: CDN with CORS

If hosting model separately, enable CORS:

**Cloudflare Workers:**

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const response = await fetch(request)
  const newResponse = new Response(response.body, response)
  
  newResponse.headers.set('Access-Control-Allow-Origin', '*')
  newResponse.headers.set('Cross-Origin-Resource-Policy', 'cross-origin')
  
  return newResponse
}
```

**AWS S3:**

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://your-domain.com"],
      "AllowedMethods": ["GET"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

## Performance Optimization

### 1. Model Optimization

```bash
# Use smallest model
python scripts/convert_model.py --model yolov8n.pt

# Or reduce input size
python scripts/convert_model.py --model yolov8n.pt --size 320
```

### 2. Code Splitting

Vite automatically splits code. Ensure lazy loading:

```typescript
// Lazy load heavy dependencies
const tesseract = await import('tesseract.js');
```

### 3. Compression

Enable gzip/brotli in server config:

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1000;
```

### 4. CDN

Use CDN for static assets:

```typescript
// vite.config.ts
export default defineConfig({
  base: 'https://cdn.example.com/',
});
```

## Monitoring

### Error Tracking

Add Sentry:

```bash
npm install @sentry/browser
```

```typescript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'your-dsn',
  environment: 'production',
});
```

### Analytics

Add privacy-friendly analytics:

```html
<!-- Plausible -->
<script defer data-domain="yourdomain.com" 
  src="https://plausible.io/js/script.js"></script>
```

## Security Checklist

- ✅ HTTPS enabled
- ✅ CORS headers configured
- ✅ CSP headers set
- ✅ No sensitive data in client code
- ✅ Model files integrity checked
- ✅ Rate limiting (if using API)
- ✅ Input validation
- ✅ XSS protection

## Browser Compatibility

Test on:
- Chrome 90+ ✅
- Edge 90+ ✅
- Firefox 88+ ⚠️ (may be slower)
- Safari 15.4+ ⚠️ (limited support)

## Troubleshooting

### CORS Errors

Ensure headers are set:
```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

### Model Won't Load

- Check file path
- Verify CORS headers
- Check browser console
- Test model URL directly

### Slow Performance

- Use smaller model
- Reduce inference size
- Enable WebGL backend
- Check network throttling

### Screen Sharing Fails

- Must use HTTPS
- Check browser permissions
- Try different browser
- Check console errors

## Cost Estimation

### Netlify (Free Tier)
- 100GB bandwidth/month
- Unlimited sites
- HTTPS included
- **Cost:** Free

### Vercel (Hobby)
- 100GB bandwidth/month
- Unlimited sites
- HTTPS included
- **Cost:** Free

### AWS S3 + CloudFront
- S3: $0.023/GB storage
- CloudFront: $0.085/GB transfer
- **Cost:** ~$5-20/month

### Self-Hosted (DigitalOcean)
- Droplet: $6/month
- Bandwidth: 1TB included
- **Cost:** $6/month
