# Product Requirements Document
## FA Full-Time Fixtures Scraping System
### Urmston Town Juniors FC

---

## 1. Executive Summary

### Project Overview
Automated system to scrape fixture data from FA Full-Time widget and display on Urmston Town Juniors FC website with custom styling and enhanced functionality.

### Problem Statement
- FA Full-Time widget uses legacy JavaScript that conflicts with React/Next.js
- Limited styling options with the official widget
- No data persistence or historical tracking
- Widget occasionally fails or shows outdated data

### Solution
Build an automated scraping pipeline that extracts fixture data from FA Full-Time and stores it in a MySQL database on Hostinger, allowing full control over presentation and data management.

---

## 2. System Architecture

### High-Level Flow
```
FA Full-Time → Hidden HTML Page → AWS Lambda (Puppeteer) → PHP Endpoint → MySQL → API → Next.js Site
```

### Components

#### 2.1 FA Widget Host Page
- **Location**: `https://pages.urmstontownjfc.co.uk/fa-widget.html` (hidden)
- **Purpose**: Hosts FA Full-Time widgets for scraping
- **Technology**: Plain HTML with FA JavaScript widgets
- **Widget Codes**: 
  - `783655865` for Timperley & District JFL (U9, U10, U15, U16 teams)
  - `84363452` for Salford League (U7, U8, U13 teams)

#### 2.2 AWS Lambda Scraper
- **Function**: `urmston-fixtures-scraper` (Account: 650251723700)
- **Schedule**: EventBridge rules running twice daily (9 AM and 3 PM UTC)
- **Technology**: Node.js with Puppeteer (@sparticuz/chromium)
- **Container**: 253MB optimized Docker image on ECR
- **Function**: Visits widget page, waits for data load, extracts fixture information

#### 2.3 Data Ingestion Endpoint
- **Location**: `https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php`
- **Method**: POST
- **Authentication**: Secret token in headers
- **Function**: Receives scraped data, validates, and stores in MySQL

#### 2.4 MySQL Database
- **Host**: Hostinger MySQL (already available)
- **Database Name**: `u790502142_fixtures`
- **Tables**: `fixtures`, `teams`, `scrape_logs`

#### 2.5 Public API Endpoint
- **Location**: `https://pages.urmstontownjfc.co.uk/api/fixtures/get.php`
- **Method**: GET
- **Parameters**: team, date_from, date_to, status
- **Response**: JSON fixture data

#### 2.6 Next.js Integration
- **Location**: Existing fixtures page
- **Function**: Fetches from API and displays with enhanced UI
- **Features**: Team filtering, date grouping, results/upcoming tabs
- **Enhanced Display**: Two-line format showing League || Pitch || Venue
- **Airtable Integration**: Pitch allocations and venue details for Urmston teams

---

## 3. Technical Specifications

### 3.1 Database Schema

```sql
-- Fixtures table
CREATE TABLE fixtures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fixture_date DATETIME NOT NULL,
    home_team VARCHAR(100) NOT NULL,
    away_team VARCHAR(100) NOT NULL,
    venue VARCHAR(200),
    competition VARCHAR(100),
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    status ENUM('upcoming', 'completed', 'postponed', 'cancelled') DEFAULT 'upcoming',
    age_group VARCHAR(20),
    raw_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_fixture (fixture_date, home_team, away_team)
);

-- Teams table (for our teams only)
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    age_group VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

-- Scrape logs for monitoring
CREATE TABLE scrape_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scrape_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fixtures_found INT,
    fixtures_updated INT,
    fixtures_new INT,
    success BOOLEAN,
    error_message TEXT
);
```

### 3.2 AWS Lambda Configuration

```yaml
Function: urmston-fixtures-scraper
Region: eu-north-1
Memory: 1024 MB
Timeout: 120 seconds
Runtime: Container (Node.js 20)
Architecture: x86_64

Environment Variables:
  API_TOKEN: a8f3d2b1c9e4f7a6d5b8c3e2f1a9b4c7
  WIDGET_URL: https://pages.urmstontownjfc.co.uk/fa-widget.html
  API_URL: https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php

EventBridge Rules:
  - urmston-fixtures-09-00: cron(0 9 * * ? *)  # 9 AM UTC daily
  - urmston-fixtures-15-00: cron(0 15 * * ? *) # 3 PM UTC daily
```

### 3.3 Scraper Logic (Puppeteer)

```javascript
// Key functionality (Lambda handler)
1. Launch Puppeteer with @sparticuz/chromium
2. Navigate to FA widget page
3. Wait for both widget selectors:
   - '#lrep783655865' (Timperley)
   - '#lrep84363452' (Salford)
4. Extract from both widgets:
   - Date/time
   - Home team
   - Away team
   - Venue
   - Score (if available)
   - Competition (league name)
5. Transform to JSON with league identification
6. POST combined data to PHP endpoint with auth token
7. Return success/failure status to Lambda
```

### 3.4 PHP Endpoints

#### Ingestion Endpoint
```php
// /api/fixtures/ingest.php
- Verify auth token
- Validate JSON structure
- Connect to MySQL
- Upsert fixtures (update if exists, insert if new)
- Log scrape results
- Return success/failure response
```

#### Public API Endpoint
```php
// /api/fixtures/get.php
- Accept query parameters
- Build SQL query with filters
- Return JSON response with CORS headers
- Cache for 5 minutes
```

---

## 4. Security Considerations

### Authentication
- **Scraper → PHP**: Secret token in Authorization header
- **PHP → MySQL**: Credentials stored in `.env` file
- **Public API**: No auth required (read-only public data)

### Data Validation
- Sanitize all inputs before database insertion
- Escape special characters
- Validate date formats
- Limit response sizes

### Rate Limiting
- Implement basic rate limiting on public API
- Maximum 60 requests per minute per IP

---

## 5. Development Phases

### Phase 1: Infrastructure Setup (2 hours) ✅ COMPLETE
1. ✅ Setup FA widget HTML page (COMPLETE - 2025-09-12)
2. ✅ Create MySQL database and tables (COMPLETE - 2025-09-12)
3. ✅ Create PHP endpoint structure (COMPLETE - 2025-09-12)
4. ⏳ Initialize GitHub repository

### Phase 2: Scraping Pipeline (3 hours) ✅ **COMPLETE**
1. ✅ Build Puppeteer scraper (COMPLETE - 2025-09-12)
2. ✅ Test local scraping (COMPLETE - 2025-09-12)
3. ✅ Setup AWS Lambda (COMPLETE - 2025-09-13)
4. ✅ Configure environment variables (COMPLETE - 2025-09-13)

### Phase 3: Data Layer (2 hours) ✅ COMPLETE
1. ✅ Build ingestion endpoint (COMPLETE - 2025-09-12)
2. ✅ Implement database operations (COMPLETE - 2025-09-12)
3. ✅ Create public API endpoint (COMPLETE - 2025-09-12)
4. ✅ Add error logging (COMPLETE - 2025-09-12)

### Phase 4: Integration (2 hours) ✅ **COMPLETE - ENHANCED**
1. ✅ Update Next.js fixtures page (COMPLETE - 2025-09-13)
2. ✅ Connect to new API (COMPLETE - 2025-09-13)
3. ✅ Implement caching (5-minute client-side caching)
4. ✅ Style and polish (Loading states, error handling)
5. ✅ **Deploy to production** (COMPLETE - 2025-09-13 via Hostinger File Manager)
6. ✅ **Enhanced two-line display format** (COMPLETE - 2025-09-13)
7. ✅ **Pitch allocation visibility** (LIVE - Airtable integration)

### Phase 5: Testing & Deployment (1 hour)
1. End-to-end testing
2. Error handling
3. Monitoring setup
4. Documentation

---

## 6. Success Metrics

- **Reliability**: 95% successful scrape rate
- **Freshness**: Data updated within 12 hours of changes
- **Performance**: API response < 200ms
- **Uptime**: 99.9% availability

---

## 7. Future Enhancements

- League table integration
- Team statistics
- Push notifications for fixture changes
- Historical match reports
- Multi-league support
- Calendar export (iCal)

---

## 8. Technical Contacts

- **GitHub**: junksamiad@gmail.com
- **Hostinger Account**: SSH enabled (Port 65002, see HOSTINGER_CREDENTIALS.md)
- **FA Full-Time League Codes**: 
  - Timperley & District JFL: 783655865
  - Salford League: 84363452
- **SSH Access**: `ssh -p 65002 u790502142@82.29.186.226`

---

## 9. Acceptance Criteria

### Completed:
- [x] FA widget page deployed and accessible (with dual league support)
- [x] MySQL database structure created with all tables
- [x] Database credentials securely documented
- [x] Data ingestion endpoint operational
- [x] Public API endpoint live and tested
- [x] **Playwright scraper fully implemented and tested (38 fixtures found)**
- [x] **Multi-league support with smart data handling**

### All Completed:
- [x] Fixtures automatically update twice daily (AWS Lambda - Story 6) ✅ **COMPLETE**
- [x] All Urmston Town teams' fixtures displayed (41 fixtures across 8 age groups) ✅ **LIVE**
- [x] Historical results stored and searchable (database operational)
- [x] Page loads in under 2 seconds ✅ **IN PRODUCTION**
- [x] Mobile responsive design ✅ **DEPLOYED**
- [x] **Production deployment** ✅ **COMPLETE** (Deployed via Hostinger File Manager)
- [x] **Enhanced two-line display format** ✅ **LIVE** (League || Pitch || Venue)
- [x] **Pitch allocation visibility for managers** ✅ **LIVE** (Airtable integration)
- [x] Graceful fallback if scraping fails (retry logic implemented)

---

## Appendix A: Environment Variables

### GitHub Secrets Required
```
HOSTINGER_API_KEY=<to be generated>
SCRAPER_AUTH_TOKEN=a8f3d2b1c9e4f7a6d5b8c3e2f1a9b4c7
HOSTINGER_MYSQL_HOST=localhost
HOSTINGER_MYSQL_USER=u790502142_fixtures
HOSTINGER_MYSQL_PASS=<stored in HOSTINGER_DB_CREDENTIALS.md>
HOSTINGER_MYSQL_DB=u790502142_fixtures
```

### Hostinger .env File (✅ CREATED)
```
DB_HOST=localhost
DB_USER=u790502142_fixtures
DB_PASS=<stored securely>
DB_NAME=u790502142_fixtures
API_AUTH_TOKEN=a8f3d2b1c9e4f7a6d5b8c3e2f1a9b4c7
```
**Location**: `/fixtures-scraper/hostinger/.env`

---

## Appendix B: File Structure

### Local Development Structure
```
/Users/leehayton/ai-apps/urmston-town/
├── fixtures-scraper/              # 📁 MAIN PROJECT DIRECTORY
│   ├── README.md                  # ⚠️ KEEP THIS UPDATED - Primary reference
│   ├── scraper/                   # Playwright scraper
│   │   ├── index.js              # Main scraper script
│   │   ├── package.json          # Node dependencies
│   │   └── .env.example          # Environment variables template
│   ├── hostinger/                # Files to deploy to Hostinger
│   │   ├── fa-widget.html        # FA Full-Time widget page
│   │   ├── api/                  # PHP endpoints
│   │   │   └── fixtures/
│   │   │       ├── ingest.php   # Receives scraped data
│   │   │       ├── get.php      # Public API endpoint
│   │   │       └── .htaccess    # Security rules
│   │   └── database/
│   │       └── schema.sql        # MySQL database schema
│   └── lambda/                    # AWS Lambda deployment
│       ├── index-lambda.js        # Lambda handler
│       ├── Dockerfile            # Container definition (simplified)
│       ├── deploy.sh            # Deployment script
│       └── package.json         # Dependencies
├── docs/                          # Documentation
│   ├── FIXTURES_SCRAPING_PRD.md  # This document
│   └── DEVELOPMENT_STORIES.md    # Implementation stories
└── [existing Next.js files]      # Current website

```

### Deployed Structure (Hostinger)
```
pages.urmstontownjfc.co.uk/
├── fa-widget.html           # Hidden FA widget page
├── api/
│   ├── fixtures/
│   │   ├── ingest.php      # Receives scraped data
│   │   └── get.php         # Public API endpoint
│   └── .env                # Database credentials
└── [existing files]        # Current website files
```

### AWS Lambda Structure
```
AWS Resources (Account: 650251723700, Region: eu-north-1):
├── Lambda Function: urmston-fixtures-scraper
│   ├── Runtime: Container (Node.js 20)
│   ├── Memory: 1024 MB, Timeout: 120s
│   └── Environment Variables: API_TOKEN, WIDGET_URL, API_URL
├── ECR Repository: urmston-fixtures-scraper (253MB optimized image)
├── EventBridge Rules:
│   ├── urmston-fixtures-09-00 (9 AM UTC daily)
│   └── urmston-fixtures-15-00 (3 PM UTC daily)
└── CloudWatch Logs: /aws/lambda/urmston-fixtures-scraper
```

📝 **Note**: See `/fixtures-scraper/README.md` for detailed setup and deployment instructions.