# Next.js Frontend Deployment Guide

## Overview

The Urmston Town website uses Next.js with static export (`output: 'export'`) to generate a static website that can be hosted on standard web hosting like Hostinger.

## Architecture

```
Next.js App → Static Build (npm run build) → /out/ directory → Upload to Hostinger
```

## Build Process

### 1. Local Development
```bash
# Run development server
npm run dev

# View at http://localhost:3000
```

### 2. Production Build
```bash
# Clean previous build (optional)
rm -rf .next out/

# Build static export
npm run build

# This creates:
# - .next/ (Next.js build cache)
# - out/ (Static files ready for hosting)
```

### 3. Verify Build
```bash
# Check the out/ directory structure
ls -la out/

# Should contain:
# - index.html (home page)
# - fixtures/ (fixtures page)
# - _next/ (CSS, JS, assets)
# - 404.html (error page)
```

## Deployment Methods

### Method 1: Hostinger File Manager (Recommended)

1. **Build the project locally**:
   ```bash
   npm run build
   ```

2. **Create deployment archive**:
   ```bash
   cd out/
   tar -czf ../urmston-town-frontend.tar.gz .
   cd ..
   ```

3. **Upload via Hostinger File Manager**:
   - Login to: https://hpanel.hostinger.com
   - Go to: **Files** → **File Manager**
   - Navigate to: `/public_html/`
   - Upload: `urmston-town-frontend.tar.gz`
   - Extract the archive
   - Delete the archive file

4. **Verify deployment**:
   - Visit: https://pages.urmstontownjfc.co.uk
   - Check fixtures page: https://pages.urmstontownjfc.co.uk/fixtures/

### Method 2: SSH Deployment (Advanced)

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy via SSH** (using the deployment script):
   ```bash
   ./deploy.sh frontend
   ```

### Method 3: Manual File Upload

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload files individually**:
   - Use Hostinger File Manager or FTP client
   - Upload contents of `out/` directory to `/public_html/`
   - Maintain directory structure

## Next.js Configuration

Current configuration in `next.config.ts`:

```typescript
const nextConfig: NextConfig = {
  output: 'export',        // Enable static export
  trailingSlash: true,     // Add trailing slashes to URLs
  images: {
    unoptimized: true      // Required for static hosting
  }
};
```

## Directory Structure After Deployment

```
public_html/
├── index.html              # Home page
├── fixtures/               # Fixtures page
│   └── index.html
├── _next/                  # Next.js assets
│   ├── static/
│   └── ...
├── images/                 # Static images
├── api/                    # PHP API endpoints (separate)
│   └── fixtures/
│       ├── get-enhanced.php
│       └── ingest.php
├── fa-widget.html          # FA widget (separate)
└── 404.html               # Error page
```

## Troubleshooting

### Build Errors

**"Error: Functions cannot be passed directly to Client Components"**
- Check for server-side functions in client components
- Use `"use client"` directive correctly

**"Module not found" errors**
- Run `npm install` to ensure all dependencies are installed
- Check import paths are correct

### Deployment Issues

**Page shows old content**
- Clear browser cache (Ctrl+F5 or Cmd+Shift+R)
- Check if new files were uploaded correctly
- Verify `_next/` directory was updated

**500 Internal Server Error**
- This indicates PHP API issues, not frontend issues
- Check API endpoints separately
- Review server logs

**Styling missing**
- Ensure `_next/` directory was uploaded completely
- Check file permissions on Hostinger
- Verify CSS files are accessible

### Cache Issues

**Browser showing old version**
```bash
# Update build ID by rebuilding
rm -rf .next out/
npm run build
```

**CDN/Server caching**
- Wait 5-10 minutes for hosting cache to clear
- Contact Hostinger support if persistent

## Integration with Fixtures System

The frontend integrates with the fixtures scraping system:

1. **API Calls**: Frontend calls `/api/fixtures/get-enhanced.php`
2. **Data Flow**: MySQL → PHP API → Next.js Frontend
3. **Updates**: Frontend updates automatically when API data changes

## Maintenance

### Regular Updates
1. Update dependencies: `npm update`
2. Test locally: `npm run dev`
3. Build and deploy: `npm run build && ./deploy.sh frontend`

### Performance Optimization
- Images are unoptimized due to static export
- Consider optimizing images manually before deployment
- Monitor bundle size with `npm run build`

## Security Notes

- Static files are publicly accessible
- No server-side rendering reduces attack surface
- API security handled separately in PHP endpoints
- No environment variables exposed to frontend

---

**Generated**: 2025-09-14
**Next Update**: After any significant frontend changes