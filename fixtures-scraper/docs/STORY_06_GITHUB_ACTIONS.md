# Story 6: GitHub Actions Implementation Attempts

## Story Overview
**Objective**: Automate fixture scraping using GitHub Actions as a free, scheduled task runner to replace Replit.

**Status**: ❌ BLOCKED - GitHub Actions cannot reliably run browser automation

**Date**: September 13, 2025

---

## Summary of All Attempts

### 1. Initial Playwright Implementation (Previous Attempt)
- **What**: Used Playwright for browser automation
- **Issue**: Timeout errors when accessing Hostinger-hosted widget page
- **Result**: Failed - couldn't load pages.urmstontownjfc.co.uk/fa-widget.html

### 2. Switch to Puppeteer (September 13, 2025)
- **What**: Migrated from Playwright to Puppeteer based on working Replit configuration
- **Changes Made**:
  - Created new `index-puppeteer.js` implementation
  - Updated GitHub Actions workflow to use Puppeteer
  - Added proper Chrome installation steps
  - Used same configuration as working Replit instance
- **Issue**: Still timing out accessing Hostinger page
- **Result**: Failed - same timeout issues

### 3. Hostinger IP Blocking Discovery
- **Testing Performed**:
  - GitHub Actions → example.com: ✅ Success
  - GitHub Actions → Hostinger page: ❌ Timeout
  - Local machine → Hostinger page: ✅ Success
  - Replit → Hostinger page: ✅ Success
- **Conclusion**: Hostinger appears to be blocking GitHub Actions IP addresses

### 4. GitHub Pages Migration
- **Solution Attempted**: Move widget HTML from Hostinger to GitHub Pages
- **Implementation**:
  ```
  Repository: junksamiad/urmston-town-fixtures
  URL: https://junksamiad.github.io/urmston-town-fixtures/
  ```
- **Process**:
  1. Created new GitHub repository
  2. Added index.html with FA widget code (both leagues)
  3. Enabled GitHub Pages from main branch
  4. Updated scraper to use new URL
- **Initial Issues**:
  - GitHub Pages build failures due to `temp-repo` submodule
  - Fixed by removing submodule and force pushing

### 5. Testing with GitHub Pages URL
- **Local Testing**: ✅ Success - scraped 38 fixtures (19 per league)
- **GitHub Actions Testing**: ❌ Still timing out
- **Debug Steps Taken**:
  - Added debug logging to workflow
  - Verified GitHub Pages accessible via curl
  - Confirmed widget divs present in HTML
  - Changed Puppeteer wait strategy from `networkidle0` to `domcontentloaded`
  - Added error logging and page console output
  - Still failed with navigation timeout

---

## Current Architecture Status

### Widget Hosting (Both Active)
1. **Hostinger** (Original):
   - URL: `https://pages.urmstontownjfc.co.uk/fa-widget.html`
   - Status: ✅ Still active and accessible
   - Issues: Blocks some IP ranges (GitHub Actions)

2. **GitHub Pages** (New):
   - URL: `https://junksamiad.github.io/urmston-town-fixtures/`
   - Status: ✅ Active and accessible
   - Benefits: CDN-backed, no IP blocking, free forever

### Scraper Implementations
1. **Puppeteer Version** (`index-puppeteer.js`):
   - Works locally: ✅
   - Works on Replit: ✅ (presumed, same as before)
   - Works on GitHub Actions: ❌

2. **Original Playwright Version** (`index.js`):
   - Deprecated in favor of Puppeteer

### API Endpoint
- URL: `https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php`
- Status: ✅ Active and working
- No changes needed

---

## Platform Comparison Results

| Platform | Browser Support | Scheduling | Free Tier | Status |
|----------|----------------|------------|-----------|---------|
| **Replit** | ✅ Works | ✅ Yes | ✅ Yes | Working but want alternative |
| **GitHub Actions** | ❌ Timeouts | ✅ Yes | ✅ Yes | Failed - can't run browsers reliably |
| **Vercel** | ❌ No browsers | ✅ Yes | ✅ Yes | Failed - serverless limitations |
| **Hostinger** | ❌ Shared hosting | ❌ PHP only | N/A | Can't run Node/Chrome |
| **AWS EC2** | ✅ Would work | ✅ Yes | ⚠️ 1 year | Not tried - expires after 12 months |
| **Render/Railway** | ❓ Unknown | ✅ Yes | ✅ Yes | Not tried - might have same issues |

---

## Key Learnings

1. **GitHub Actions Limitations**:
   - Can access URLs via curl but Puppeteer/Playwright timeout
   - Appears to be fundamental issue with browser automation in GitHub Actions environment
   - Not related to specific URLs - happens with both Hostinger and GitHub Pages

2. **Hosting Considerations**:
   - Hostinger may block certain IP ranges (cloud providers)
   - GitHub Pages more reliable for public access
   - Having both provides redundancy

3. **Browser Automation Requirements**:
   - Need full Chrome/Chromium installation
   - Requires persistent environment (not serverless)
   - Works best on traditional servers/VPS

---

## Recommendation

**Return to Replit** with GitHub Pages URL:
- Replit is the only platform we've confirmed works reliably
- Update WIDGET_URL to use GitHub Pages for better reliability
- Keep Hostinger URL as backup option
- Document why alternatives failed for future reference

### To Implement on Replit:
```env
# Update in Replit .env file
WIDGET_URL=https://junksamiad.github.io/urmston-town-fixtures/
# Keep as backup: https://pages.urmstontownjfc.co.uk/fa-widget.html
```

---

## Files Created/Modified

### New Files
- `/fixtures-scraper/scraper/index-puppeteer.js` - Puppeteer implementation
- `/.github/workflows/scrape-puppeteer.yml` - GitHub Actions workflow
- `/.github/workflows/test-github-pages-access.yml` - Debug workflow
- `/index.html` - GitHub Pages widget host
- `/fixtures-scraper/scraper/test-github-pages.js` - Test script

### Modified Files
- `/fixtures-scraper/scraper/.env` - Updated WIDGET_URL
- `/fixtures-scraper/scraper/package.json` - Added Puppeteer dependency

### Repository Created
- `https://github.com/junksamiad/urmston-town-fixtures` - GitHub Pages hosting

---

## Next Steps

1. **Update Replit scraper** to use GitHub Pages URL
2. **Clean up failed attempts**:
   - Remove/archive GitHub Actions workflows
   - Clean up Vercel deployments if any remain
   - Document in main story tracker
3. **Test Replit** with new configuration
4. **Set up monitoring** to ensure continued operation

---

## Completion Status: 30%
- ✅ Attempted multiple solutions
- ✅ Identified root causes of failures
- ✅ Created fallback hosting on GitHub Pages
- ❌ Could not get GitHub Actions working
- ⏸️ Reverting to Replit as most reliable option