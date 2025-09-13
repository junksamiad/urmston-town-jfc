# Story 1: Setup FA Widget HTML Page
**Status**: ✅ COMPLETE  
**Priority**: P0 - Blocker  
**Time Estimate**: 30 minutes (Actual: ~45 minutes)  

---

## 📋 Story Overview
Create and deploy the FA Full-Time widget HTML page that will be scraped by our Playwright automation to extract fixture data.

---

## ✅ Progress Checklist

### Pre-requisites
- [x] PRD document created
- [x] Development stories defined
- [x] Directory structure established

### Implementation Tasks
- [x] **Task 1**: Create `fa-widget.html` file with FA Full-Time widget code
  - **Location**: `/Users/leehayton/ai-apps/urmston-town/fixtures-scraper/hostinger/fa-widget.html`
  - **Status**: ✅ COMPLETE
  - **Notes**: File created with league code 783655865, includes debug info and noindex tags

- [x] **Task 2**: Upload to Hostinger at `/public_html/fa-widget.html`
  - **Method**: Use Hostinger File Manager via browser
  - **Source**: `/fixtures-scraper/hostinger/fa-widget.html`
  - **Destination**: `https://pages.urmstontownjfc.co.uk/fa-widget.html`
  - **Status**: ✅ COMPLETE

- [x] **Task 3**: Test widget loads and displays fixtures
  - **Test URL**: `https://pages.urmstontownjfc.co.uk/fa-widget.html`
  - **Expected**: Should see fixture list for Timperley & District JFL
  - **Status**: ✅ COMPLETE - Widget displays fixtures correctly

- [x] **Task 4**: Add robots.txt entry to prevent indexing
  - **File**: `/public_html/robots.txt`
  - **Add line**: `Disallow: /fa-widget.html`
  - **Status**: ✅ COMPLETE - robots.txt created with exclusion

- [x] **Task 5**: Update README.md with deployment status
  - **File**: `/fixtures-scraper/README.md`
  - **Add**: Deployment confirmation and test results
  - **Status**: ✅ COMPLETE - README updated with deployment details

---

## 📁 Files

### Created Files
```
✅ /Users/leehayton/ai-apps/urmston-town/fixtures-scraper/hostinger/fa-widget.html
```

### File Contents
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FA Widget - Do Not Index</title>
    <meta name="robots" content="noindex, nofollow">
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        #widget-container {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
        }
        .loading {
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <h1>FA Full-Time Widget - Urmston Town Juniors FC</h1>
    <p>This page is for data scraping purposes only. Not intended for public viewing.</p>
    
    <div id="widget-container">
        <div id="lrep783655865" style="width: 100%;">
            <span class="loading">Data loading from FA Full-Time...</span>
        </div>
    </div>

    <!-- FA Full-Time Widget Script -->
    <script language="javascript" type="text/javascript">
        var lrcode = '783655865';  // Timperley & District JFL code
    </script>
    <script language="javascript" type="text/javascript" 
            src="https://fulltime.thefa.com/client/api/cs1.js"></script>

    <!-- Debug info (helps with scraping) -->
    <div id="debug-info" style="margin-top: 40px; padding: 10px; background: #e0e0e0; font-size: 12px;">
        <strong>Debug Info:</strong><br>
        League Code: 783655865<br>
        Last Loaded: <span id="load-time"></span>
    </div>

    <script>
        // Add timestamp for debugging
        document.getElementById('load-time').textContent = new Date().toISOString();
        
        // Log when widget loads (helps with Playwright waiting)
        window.addEventListener('load', function() {
            console.log('Page loaded at:', new Date().toISOString());
        });

        // Monitor for widget content changes
        const observer = new MutationObserver(function(mutations) {
            console.log('Widget content updated at:', new Date().toISOString());
        });
        
        const widgetElement = document.getElementById('lrep783655865');
        if (widgetElement) {
            observer.observe(widgetElement, { 
                childList: true, 
                subtree: true 
            });
        }
    </script>
</body>
</html>
```

---

## 🎯 Acceptance Criteria

| Criteria | Status | Notes |
|----------|--------|-------|
| Page accessible at `https://pages.urmstontownjfc.co.uk/fa-widget.html` | ✅ | Live and accessible |
| FA widget displays Timperley league fixtures | ✅ | Shows fixtures for U9, U10, U15, U16 teams |
| Page not indexed by search engines | ✅ | Meta tags and robots.txt configured |
| README updated with deployment confirmation | ✅ | Deployment status documented |

---

## 🚀 Next Steps

### To Complete This Story:

1. **Upload the HTML file to Hostinger**
   ```bash
   # File to upload:
   /Users/leehayton/ai-apps/urmston-town/fixtures-scraper/hostinger/fa-widget.html
   
   # Upload to:
   https://pages.urmstontownjfc.co.uk/fa-widget.html
   ```

2. **Test the deployed page**
   - Visit: `https://pages.urmstontownjfc.co.uk/fa-widget.html`
   - Verify fixtures load
   - Check console for debug messages

3. **Update robots.txt**
   ```
   # Add to /public_html/robots.txt:
   User-agent: *
   Disallow: /fa-widget.html
   ```

4. **Update README**
   - Mark deployment as complete
   - Add test results
   - Note any issues encountered

---

## 📝 Notes

### Important Information:
- **League Code**: 783655865 (Timperley & District JFL)
- **Widget Container ID**: `lrep783655865`
- **FA API Script**: `https://fulltime.thefa.com/client/api/cs1.js`

### Debugging Tips:
- The page includes console logging to track when the widget loads
- MutationObserver monitors for content changes
- Debug info section shows the league code and last load time

### Security Considerations:
- Page includes `noindex, nofollow` meta tags
- Should be added to robots.txt to prevent crawling
- Not linked from any public pages

---

## 🔄 Story Updates

| Date | Update | By |
|------|--------|-----|
| 2025-09-12 | Story created, HTML file generated | Assistant |
| 2025-09-12 | Successfully deployed to Hostinger, all tasks complete | Assistant |

---

## ✅ Definition of Done

- [x] HTML file uploaded to Hostinger
- [x] Page loads successfully at public URL
- [x] FA widget displays fixture data
- [x] Page excluded from search indexing
- [x] README.md updated with deployment details
- [x] Story marked as complete in todo list
- [x] Credentials document created at `/fixtures-scraper/HOSTINGER_CREDENTIALS.md`

---

## 🔗 Related Links

- [Main PRD](/Users/leehayton/ai-apps/urmston-town/docs/FIXTURES_SCRAPING_PRD.md)
- [All Stories](/Users/leehayton/ai-apps/urmston-town/docs/DEVELOPMENT_STORIES.md)
- [Project README](/Users/leehayton/ai-apps/urmston-town/fixtures-scraper/README.md)
- [FA Full-Time](https://fulltime.thefa.com)