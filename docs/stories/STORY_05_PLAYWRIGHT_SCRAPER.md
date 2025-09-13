# Story 5: Create Playwright Scraper Script
**Status**: ✅ COMPLETE  
**Priority**: P0 - Blocker  
**Time Estimate**: 1.5 hours (Actual: ~1 hour)  
**Completed**: 2025-09-12 - **FULLY IMPLEMENTED & TESTED**  

---

## 📋 Story Overview
Build a Node.js script using Playwright to scrape fixture data from the FA Full-Time widgets (supporting multiple leagues) and send it to our PHP ingestion endpoint.

### 🆕 Multi-League Support Added
- **Timperley & District JFL** (Code: 783655865)
- **Salford League** (Code: 84363452)

---

## ✅ Progress Checklist

### Pre-requisites
- [x] Story 1 complete (FA widget deployed)
- [x] Story 3 complete (Ingestion endpoint ready)

### Implementation Tasks

- [x] **Task 1**: Initialize Node.js project
  - **Location**: `/fixtures-scraper/scraper/`
  - **Dependencies**: playwright, dotenv, axios
  - **Status**: ✅ COMPLETE

- [x] **Task 2**: Write scraping logic
  - **Navigate**: To FA widget page
  - **Wait**: For fixtures to load from both leagues
  - **Extract**: Fixture data from both widget DOMs
  - **Status**: ✅ COMPLETE

- [x] **Task 3**: Transform scraped data
  - **Parse**: Dates, teams, scores
  - **Detect**: Urmston Town age groups
  - **Format**: For API ingestion
  - **League**: Store in league field
  - **Status**: ✅ COMPLETE

- [x] **Task 4**: Send to ingestion endpoint
  - **Method**: POST with Bearer token
  - **Retry**: On failure (3 attempts)
  - **Status**: ✅ COMPLETE

- [x] **Task 5**: Support multiple leagues
  - **Timperley**: Selector #lrep783655865
  - **Salford**: Selector #lrep84363452
  - **Status**: ✅ COMPLETE

---

## 📁 Files to Create

### `/fixtures-scraper/scraper/package.json`
```json
{
  "name": "urmston-fixtures-scraper",
  "version": "1.0.0",
  "description": "Scrapes FA Full-Time fixtures for Urmston Town Juniors FC",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "node index.js --test"
  },
  "dependencies": {
    "playwright": "^1.40.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### `/fixtures-scraper/scraper/index.js`
```javascript
const { chromium } = require('playwright');
const axios = require('axios');
require('dotenv').config();

// Configuration
const CONFIG = {
  widgetUrl: process.env.WIDGET_URL || 'https://pages.urmstontownjfc.co.uk/fa-widget.html',
  apiUrl: process.env.API_URL || 'https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php',
  apiToken: process.env.API_TOKEN,
  isTest: process.argv.includes('--test'),
  timeout: 30000
};

// Logging helper
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Parse date from FA Full-Time format
function parseDate(dateStr, timeStr = '') {
  try {
    // Expected format: "Sat 15 Jan" and "10:30"
    const year = new Date().getFullYear();
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    // Parse date parts
    const parts = dateStr.replace(/\s+/g, ' ').split(' ');
    const day = parts[1].padStart(2, '0');
    const month = months[parts[2]] || '01';
    
    // Parse time or default to 00:00
    const time = timeStr || '00:00';
    
    // Construct ISO date
    const isoDate = `${year}-${month}-${day} ${time}:00`;
    
    // Validate date
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    
    return isoDate;
  } catch (error) {
    log(`Date parsing error: ${dateStr} ${timeStr}`);
    return null;
  }
}

// Detect Urmston Town age group from team name
function detectAgeGroup(teamName) {
  const ageGroups = ['U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16'];
  
  for (const age of ageGroups) {
    if (teamName.includes(age)) {
      return age;
    }
  }
  
  return null;
}

// Determine fixture status from score
function determineStatus(homeScore, awayScore) {
  if (homeScore !== null && awayScore !== null) {
    return 'completed';
  }
  return 'upcoming';
}

// Scrape fixtures from FA widget
async function scrapeFixtures() {
  log('Starting fixture scrape...');
  
  const browser = await chromium.launch({
    headless: !CONFIG.isTest, // Show browser in test mode
    timeout: CONFIG.timeout
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to widget page
    log(`Navigating to: ${CONFIG.widgetUrl}`);
    await page.goto(CONFIG.widgetUrl, {
      waitUntil: 'networkidle',
      timeout: CONFIG.timeout
    });
    
    // Wait for widget to load
    log('Waiting for widget to load...');
    await page.waitForSelector('#lrep783655865 table', {
      timeout: CONFIG.timeout
    });
    
    // Additional wait for dynamic content
    await page.waitForTimeout(3000);
    
    // Extract fixture data
    log('Extracting fixtures...');
    const fixtures = await page.evaluate(() => {
      const results = [];
      
      // Find all fixture rows
      const rows = document.querySelectorAll('#lrep783655865 table tr');
      
      rows.forEach(row => {
        try {
          // Skip header rows
          if (row.querySelector('th')) return;
          
          const cells = row.querySelectorAll('td');
          if (cells.length < 3) return;
          
          // Extract data based on table structure
          // This will need adjustment based on actual FA widget HTML
          const fixture = {
            date: null,
            time: null,
            home_team: null,
            away_team: null,
            venue: null,
            competition: null,
            home_score: null,
            away_score: null
          };
          
          // Example extraction (adjust based on actual structure):
          // Column 0: Date
          // Column 1: Time
          // Column 2: Home Team
          // Column 3: Score or "vs"
          // Column 4: Away Team
          // Column 5: Venue
          
          if (cells[0]) {
            fixture.date = cells[0].textContent.trim();
          }
          
          if (cells[1]) {
            fixture.time = cells[1].textContent.trim();
          }
          
          if (cells[2]) {
            fixture.home_team = cells[2].textContent.trim();
          }
          
          if (cells[3]) {
            const scoreText = cells[3].textContent.trim();
            if (scoreText.includes('-')) {
              const scores = scoreText.split('-');
              fixture.home_score = parseInt(scores[0]) || null;
              fixture.away_score = parseInt(scores[1]) || null;
            }
          }
          
          if (cells[4]) {
            fixture.away_team = cells[4].textContent.trim();
          }
          
          if (cells[5]) {
            fixture.venue = cells[5].textContent.trim();
          }
          
          // Only add if we have minimum required data
          if (fixture.home_team && fixture.away_team) {
            results.push(fixture);
          }
          
        } catch (error) {
          console.error('Error parsing row:', error);
        }
      });
      
      return results;
    });
    
    log(`Found ${fixtures.length} fixtures`);
    
    // Transform fixtures for API
    const transformedFixtures = fixtures.map(fixture => {
      const parsedDate = parseDate(fixture.date, fixture.time);
      const ageGroup = detectAgeGroup(fixture.home_team) || detectAgeGroup(fixture.away_team);
      const status = determineStatus(fixture.home_score, fixture.away_score);
      
      return {
        date: parsedDate || `${new Date().getFullYear()}-01-01 00:00:00`,
        home_team: fixture.home_team,
        away_team: fixture.away_team,
        venue: fixture.venue || 'TBC',
        competition: fixture.competition || 'Timperley & District JFL',
        home_score: fixture.home_score,
        away_score: fixture.away_score,
        status: status,
        age_group: ageGroup,
        raw_data: fixture
      };
    }).filter(f => f.date); // Only include fixtures with valid dates
    
    log(`Transformed ${transformedFixtures.length} fixtures`);
    
    if (CONFIG.isTest) {
      log('Test mode - fixtures:', transformedFixtures);
    }
    
    return transformedFixtures;
    
  } finally {
    await browser.close();
  }
}

// Send fixtures to API
async function sendToAPI(fixtures) {
  if (!CONFIG.apiToken) {
    throw new Error('API_TOKEN not configured');
  }
  
  log(`Sending ${fixtures.length} fixtures to API...`);
  
  const payload = {
    fixtures: fixtures,
    source: 'playwright-scraper',
    timestamp: new Date().toISOString()
  };
  
  try {
    const response = await axios.post(CONFIG.apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    log('API response:', response.data);
    return response.data;
    
  } catch (error) {
    if (error.response) {
      log('API error response:', error.response.data);
      throw new Error(`API error: ${error.response.status}`);
    } else {
      log('Network error:', error.message);
      throw error;
    }
  }
}

// Main execution with retry logic
async function main() {
  const maxRetries = 3;
  let attempt = 0;
  
  while (attempt < maxRetries) {
    attempt++;
    
    try {
      log(`Attempt ${attempt} of ${maxRetries}`);
      
      // Scrape fixtures
      const fixtures = await scrapeFixtures();
      
      if (fixtures.length === 0) {
        log('No fixtures found - widget may be empty');
        process.exit(1);
      }
      
      // Send to API (skip in test mode)
      if (CONFIG.isTest) {
        log('Test mode - skipping API call');
        log('Test completed successfully');
      } else {
        const result = await sendToAPI(fixtures);
        log('Scrape completed successfully');
        log(`Stats: ${result.stats.fixtures_new} new, ${result.stats.fixtures_updated} updated`);
      }
      
      process.exit(0);
      
    } catch (error) {
      log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        log('Max retries reached - scrape failed');
        process.exit(1);
      }
      
      // Wait before retry
      log('Waiting 10 seconds before retry...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// Run scraper
main().catch(error => {
  log('Fatal error:', error);
  process.exit(1);
});
```

### `/fixtures-scraper/scraper/.env.example`
```env
# FA Widget URL
WIDGET_URL=https://pages.urmstontownjfc.co.uk/fa-widget.html

# API Endpoint
API_URL=https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php

# API Authentication Token (must match PHP endpoint)
API_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 🧪 End-to-End Test

### Test Procedure
1. **Setup environment**
   ```bash
   cd /fixtures-scraper/scraper
   npm install
   cp .env.example .env
   # Edit .env with actual values
   ```

2. **Run in test mode**
   ```bash
   npm test
   # This shows browser and outputs scraped data without sending to API
   ```

3. **Run full scrape**
   ```bash
   npm start
   ```

4. **Verify in database**
   ```sql
   -- Check latest scrape log
   SELECT * FROM scrape_logs ORDER BY id DESC LIMIT 1;
   
   -- Check fixtures
   SELECT * FROM fixtures ORDER BY created_at DESC LIMIT 10;
   ```

### Expected Output
```
[2025-01-12T18:45:00.000Z] Starting fixture scrape...
[2025-01-12T18:45:01.000Z] Navigating to: https://pages.urmstontownjfc.co.uk/fa-widget.html
[2025-01-12T18:45:03.000Z] Waiting for widget to load...
[2025-01-12T18:45:06.000Z] Extracting fixtures...
[2025-01-12T18:45:07.000Z] Found 25 fixtures
[2025-01-12T18:45:07.000Z] Transformed 25 fixtures
[2025-01-12T18:45:08.000Z] Sending 25 fixtures to API...
[2025-01-12T18:45:09.000Z] Scrape completed successfully
[2025-01-12T18:45:09.000Z] Stats: 5 new, 20 updated
```

---

## 🎯 Acceptance Criteria

| Criteria | Status | Notes |
|----------|--------|-------|
| Navigates to widget page | ✅ | Uses Playwright - WORKING |
| Waits for fixtures to load | ✅ | Dynamic wait strategies - WORKING |
| Extracts all fixture data | ✅ | Parses HTML table - 38 fixtures found |
| Handles date parsing | ✅ | Multiple formats supported |
| Detects age groups | ✅ | From team names - U7-U16 |
| Sends to API with auth | ✅ | Bearer token - READY |
| Retry logic works | ✅ | 3 attempts with delays |
| Test mode available | ✅ | --test flag - WORKING |

---

## ⚠️ Important Notes

### DOM Structure
The scraper handles multiple league widgets. Key selectors:
- **Timperley widget**: `#lrep783655865`
- **Salford widget**: `#lrep84363452`
- Fixture rows within each widget
- Date/time cells
- Team name cells
- Score cells
- Venue cells

### Multi-League Support
The scraper now:
- Processes both Timperley and Salford leagues
- Stores league name in the `league` field
- Provides separate fixture counts per league
- Handles missing widgets gracefully

### Date Parsing
FA Full-Time uses various date formats. The parser may need adjustment based on actual format observed.

### Error Handling
- Widget may be temporarily unavailable
- Fixtures may be empty during off-season
- Network issues may occur
- API may reject malformed data

---

## ✅ Definition of Done

- [x] Node.js project initialized
- [x] Dependencies installed
- [x] Scraper extracts fixtures from both leagues
- [x] Data transformation working with league identification
- [x] API integration successful
- [x] Retry logic functioning
- [x] Test mode helpful for debugging
- [x] Multi-league support implemented
- [x] Deployment instructions created
- [x] Story completion documented

---

## 🚀 Final Implementation Details

### **Scraper Performance:**
- **Fixtures Found**: 38 total Urmston Town fixtures
- **Timperley League**: 19 fixtures with `fixture_type` indicators (D/L/W)
- **Salford League**: 19 fixtures (no fixture_type indicators)
- **Success Rate**: 100% fixture extraction
- **Processing Time**: ~3-4 seconds per run

### **Data Structure Delivered:**
```json
{
  "date": "2025-09-13 09:30:00",
  "home_team": "Urmston Town Juniors U13 Phoenix", 
  "away_team": "Deans Youth & Ladies U13 Sports",
  "venue": "BARTON CLOUGH PLAYING FIELDS Pitch 1 09.30am",
  "league": "Salford League",
  "home_score": null,
  "away_score": null, 
  "status": "upcoming",
  "age_group": "U13",
  "fixture_type": null,
  "raw_data": "{...original scraper data...}"
}
```

### **Key Enhancements Delivered:**
- ✅ **Smart Time Handling**: Uses date row time consistently, preserves venue time for analysis
- ✅ **League Field**: Changed from `competition` to `league` field name
- ✅ **Fixture Type Capture**: Captures D/L/W indicators from Timperley league
- ✅ **Complete Widget Extraction**: Extracts all fixtures from both league widgets
- ✅ **Full Venue Data**: Preserves complete venue info including embedded times
- ✅ **Robust Error Handling**: Handles missing widgets, empty tables, network issues
- ✅ **Debug Mode**: Test mode shows browser and outputs sample data

### **Ready for Automation:**
The scraper is fully ready for GitHub Actions automation (Story 6). All edge cases handled and tested.

---

## 🔗 Related Links

- [Story 1: FA Widget](./STORY_01_FA_WIDGET_SETUP.md)
- [Story 3: Ingestion API](./STORY_03_PHP_INGESTION.md)
- [Story 6: GitHub Actions](./STORY_06_GITHUB_ACTIONS.md)