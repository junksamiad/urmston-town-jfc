# Development Stories
## FA Full-Time Fixtures Scraping System

📁 **Project Directory**: `/Users/leehayton/ai-apps/urmston-town/fixtures-scraper/`  
📝 **README Location**: `/fixtures-scraper/README.md` - **MUST BE KEPT UPDATED**

---

## ✅ Story 1: Setup FA Widget HTML Page [COMPLETE]
**Time Estimate**: 30 minutes (Actual: ~45 minutes)  
**Priority**: P0 - Blocker  
**Location**: `/fixtures-scraper/hostinger/fa-widget.html`  
**Completed**: 2025-09-12
**Updated**: 2025-09-12 - Added Salford League support

### Tasks:
1. ✅ Create `fa-widget.html` file with FA Full-Time widget code
2. ✅ Upload to Hostinger at `/public_html/fa-widget.html`
3. ✅ Test widget loads and displays fixtures
4. ✅ Add robots.txt entry to prevent indexing
5. ✅ **Update README.md with deployment status**
6. ✅ **Add second league widget (Salford League)**

### Acceptance Criteria:
- [x] Page accessible at `https://pages.urmstontownjfc.co.uk/fa-widget.html`
- [x] FA widget displays Timperley league fixtures (783655865)
- [x] FA widget displays Salford league fixtures (84363452)
- [x] Page not indexed by search engines
- [x] README updated with deployment confirmation

### File Location:
```
Source: /fixtures-scraper/hostinger/fa-widget.html
Deploy to: https://pages.urmstontownjfc.co.uk/fa-widget.html
```

---

## ✅ Story 2: Create MySQL Database Structure [COMPLETE]
**Time Estimate**: 30 minutes (Actual: ~40 minutes)  
**Priority**: P0 - Blocker  
**Location**: `/fixtures-scraper/hostinger/database/`  
**Completed**: 2025-09-12

### Tasks:
1. ✅ Create SQL schema file with tables and views
2. ✅ Create setup instructions for deployment
3. ✅ Create test queries for verification
4. ✅ Create environment template (.env.example)
5. ✅ Create deployment helper script
6. ✅ Deploy to Hostinger via phpMyAdmin

### Files Created:
```
/fixtures-scraper/hostinger/database/
├── schema.sql              # Complete database schema
├── setup-instructions.md   # Step-by-step deployment guide
├── test-queries.sql       # Verification queries
└── ../deploy-database.sh  # Helper deployment script
```

### Database Details:
- **Database**: `u790502142_fixtures`
- **Tables**: fixtures, teams, scrape_logs
- **Views**: upcoming_fixtures, recent_results
- **Teams**: 8 teams populated (U9s-U16s)

### Acceptance Criteria:
- [x] SQL schema file created with all tables
- [x] Setup instructions documented
- [x] Test queries prepared
- [x] Environment template created
- [x] Database deployed to Hostinger
- [x] Credentials saved securely in HOSTINGER_DB_CREDENTIALS.md

---

## ✅ Story 3: Build Data Ingestion PHP Endpoint [COMPLETE]
**Time Estimate**: 1 hour (Actual: ~50 minutes)  
**Priority**: P0 - Blocker  
**Location**: `/fixtures-scraper/hostinger/api/fixtures/`  
**Completed**: 2025-09-12

### Tasks:
1. ✅ Create `/api/fixtures/ingest.php`
2. ✅ Implement authentication check
3. ✅ Add database connection
4. ✅ Build upsert logic for fixtures
5. ✅ Add error handling and logging
6. ✅ Create `.htaccess` security file
7. ✅ Test endpoint with sample data

### Deployed Endpoint:
```
URL: https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php
Method: POST
Auth: Bearer a8f3d2b1c9e4f7a6d5b8c3e2f1a9b4c7
```

### Acceptance Criteria:
- [x] Endpoint rejects unauthorized requests (403 for invalid token)
- [x] Successfully inserts new fixtures
- [x] Updates existing fixtures
- [x] Logs all operations to scrape_logs table

---

## ✅ Story 4: Build Public API Endpoint [COMPLETE]
**Time Estimate**: 45 minutes (Actual: ~40 minutes)  
**Priority**: P1 - High  
**Location**: `/fixtures-scraper/hostinger/api/fixtures/`  
**Completed**: 2025-09-12

### Tasks:
1. ✅ Create `/api/fixtures/get.php`
2. ✅ Implement query parameter parsing
3. ✅ Build SQL queries with filters
4. ✅ Add response caching (5 minutes)
5. ✅ Set CORS headers for Next.js

### Deployed Endpoint:
```
URL: https://pages.urmstontownjfc.co.uk/api/fixtures/get.php
Method: GET
```

### Available Endpoints:
```
GET /api/fixtures/get.php
GET /api/fixtures/get.php?team=U10
GET /api/fixtures/get.php?status=upcoming
GET /api/fixtures/get.php?from=2025-01-01&to=2025-01-31
GET /api/fixtures/get.php?limit=10
GET /api/fixtures/get.php?stats=true
```

### Acceptance Criteria:
- [x] Returns JSON fixture data
- [x] Filters work correctly (team, status, date range)
- [x] CORS enabled for Next.js
- [x] Response cached for 5 minutes
- [x] Proper error handling

---

## ✅ Story 5: Create Playwright Scraper Script [COMPLETE]
**Time Estimate**: 1.5 hours (Actual: ~1 hour)  
**Priority**: P0 - Blocker  
**Completed**: 2025-09-12 - **FULLY IMPLEMENTED & TESTED**

### Tasks:
1. ✅ Initialize Node.js project with Playwright
2. ✅ Write scraper to visit FA widget page
3. ✅ Extract fixture data from both league DOMs
4. ✅ Transform to JSON structure with league identification
5. ✅ Add POST to PHP endpoint

### Core Logic:
```javascript
// Main steps
1. await page.goto('https://pages.urmstontownjfc.co.uk/fa-widget.html')
2. await page.waitForSelector('#lrep783655865, #lrep84363452')
3. const timperleyFixtures = await extractFromWidget('#lrep783655865')
4. const salfordFixtures = await extractFromWidget('#lrep84363452')
5. await postToAPI([...timperleyFixtures, ...salfordFixtures])
```

### Acceptance Criteria:
- [x] Successfully extracts fixtures from both leagues (38 Urmston fixtures found)
- [x] Stores league name in league field 
- [x] Handles both results and upcoming games
- [x] Posts valid JSON to API (ready for automation)
- [x] Handles errors gracefully
- [x] **BONUS**: Captures fixture_type metadata (D/L/W)
- [x] **BONUS**: Smart time handling with venue preservation
- [x] **BONUS**: Test mode with browser visibility

---

## ✅ Story 6: Setup AWS Lambda Automation [COMPLETE]
**Time Estimate**: 45 minutes (Actual: ~1 hour)
**Priority**: P0 - Blocker
**Completed**: 2025-09-13
**Location**: `/fixtures-scraper/lambda/`
**Replaced**: GitHub Actions approach (Docker manifest issues)

### Tasks:
1. ✅ Configure AWS CLI with footballclub profile
2. ✅ Deploy Lambda infrastructure (ECR, Lambda, IAM)
3. ✅ Build and push Docker container (253MB optimized)
4. ✅ Configure EventBridge schedules (9 AM & 3 PM UTC)
5. ✅ Test and verify functionality

### Key Implementation Notes:
- **Region**: eu-north-1 (Stockholm) not eu-west-2
- **Docker Fix**: Added `--provenance=false` for Lambda compatibility
- **Simplified**: Removed system packages, used @sparticuz/chromium only
- **Success**: 38 fixtures scraped successfully on first test

### Acceptance Criteria:
- [x] Lambda runs on schedule (2 EventBridge rules)
- [x] Manual trigger works (200 response, 38 fixtures)
- [x] Environment variables configured
- [x] Integration test passes (45 Urmston fixtures in API)

---

## ✅ Story 7: Update Next.js Fixtures Page [COMPLETE]
**Status**: ✅ COMPLETE
**Time Estimate**: 1 hour (Actual: ~1.5 hours including deployment)
**Implementation**: ✅ **[COMPLETE - 2025-09-13]**
**Deployment**: ✅ **[COMPLETE - 2025-09-13]**

### Tasks:
1. ✅ Create API service to fetch from PHP endpoint (`lib/fixtures-api.ts`)
2. ✅ Create new fixtures component (`components/fixtures-list.tsx`)
3. ✅ Replace placeholder data with API calls
4. ✅ Implement loading states (skeleton UI)
5. ✅ Add error handling (graceful fallback)
6. ✅ Cache responses client-side (5-minute caching)
7. ✅ **Deploy via browser** (Successfully deployed via Hostinger File Manager)

### Components Created/Updated:
- ✅ `app/fixtures/page.tsx` - Updated with live API integration
- ✅ `lib/fixtures-api.ts` - Created API service layer
- ✅ `components/fixtures-list.tsx` - Created new component

### Acceptance Criteria:
- [x] Displays live fixture data ✅ **IN PRODUCTION**
- [x] Filters work correctly ✅ **Team filtering (U7-U16)**
- [x] Graceful error handling ✅ **With retry buttons**
- [x] Fast page load (< 2s) ✅ **With caching**
- [x] **DEPLOYED TO PRODUCTION** ✅ **Live at pages.urmstontownjfc.co.uk/fixtures/**

---

## 🎯 Story 8: End-to-End Testing
**Time Estimate**: 45 minutes  
**Priority**: P1 - High  

### Tasks:
1. Test full scrape → store → display flow
2. Verify data accuracy
3. Test error scenarios
4. Check mobile responsiveness
5. Performance testing

### Test Scenarios:
- [ ] New fixture appears after scrape
- [ ] Score updates correctly
- [ ] Postponed matches handled
- [ ] API filters work
- [ ] Page loads on mobile

---

## 🎯 Story 9: Monitoring & Alerts
**Time Estimate**: 30 minutes  
**Priority**: P2 - Medium  

### Tasks:
1. Setup GitHub Actions failure notifications
2. Add scrape success/failure logging
3. Create simple monitoring dashboard
4. Document troubleshooting steps

### Acceptance Criteria:
- [ ] Email on scrape failure
- [ ] Can view scrape history
- [ ] Clear troubleshooting guide

---

## 🎯 Story 10: Documentation & Handover
**Time Estimate**: 30 minutes  
**Priority**: P2 - Medium  

### Tasks:
1. Write API documentation
2. Create maintenance guide
3. Document credentials location
4. Create backup procedure
5. **Final README.md review and update**

### Deliverables:
- [ ] API.md with all endpoints
- [ ] MAINTENANCE.md guide
- [ ] Credential management doc
- [ ] Backup/restore procedure
- [ ] **README.md fully updated with all deployment details**

### ⚠️ Important:
**The README.md in `/fixtures-scraper/` should be continuously updated throughout development. It serves as the single source of truth for:**
- Directory structure
- Deployment locations
- API endpoints
- Credentials (where they're stored, not the actual values)
- Troubleshooting steps

---

## 📊 Development Order

### Day 1 (Critical Path):
1. Story 1: Setup FA Widget HTML ✅ **[COMPLETE - 2025-09-12]**
2. Story 2: Create MySQL Database ✅ **[COMPLETE - 2025-09-12]**
3. Story 3: Build Ingestion Endpoint ✅ **[COMPLETE - 2025-09-12]**
4. Story 5: Create Playwright Scraper ✅ **[COMPLETE - 2025-09-12]**

### Day 2 (Integration):
5. Story 6: Setup AWS Lambda ✅ **[COMPLETE - 2025-09-13]**
6. Story 4: Build Public API ✅ **[COMPLETE - 2025-09-12]**
7. Story 7: Update Next.js Page ✅ **[COMPLETE - 2025-09-13]**

### Day 3 (Polish):
8. Story 8: End-to-End Testing ⏳
9. Story 9: Monitoring ⏳
10. Story 10: Documentation ⏳

---

## 🚀 Quick Start Commands

```bash
# Test scraper locally
node scraper/index.js

# Test PHP endpoint
curl -X POST https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fixtures": []}'

# Test public API
curl https://pages.urmstontownjfc.co.uk/api/fixtures/get.php

# Trigger GitHub Action manually
gh workflow run scrape.yml
```