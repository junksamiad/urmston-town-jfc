# Urmston Town Fixtures Scraper

Automated scraper for FA Full-Time fixtures data for Urmston Town Juniors FC.

## 🤖 Automated Schedule

This scraper runs automatically via GitHub Actions:
- **9:00 AM UTC** - Morning update
- **3:00 PM UTC** - Afternoon update

## 🚀 Manual Trigger

To manually trigger the scraper:
1. Go to Actions tab
2. Select "Scrape FA Fixtures" workflow
3. Click "Run workflow"
4. Optionally enable debug mode

## 🔐 Required Secrets

Configure these in Settings → Secrets → Actions:
- `API_TOKEN` - Authentication token for API endpoint (a8f3d2b1c9e4f7a6d5b8c3e2f1a9b4c7)
- `WIDGET_URL` - URL of FA widget page (https://pages.urmstontownjfc.co.uk/fa-widget.html)
- `API_URL` - URL of ingestion endpoint (https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php)

### 🆕 Dual-League Support (Updated: 2025-09-12)
The system now scrapes fixtures from two leagues:
- **Timperley & District JFL** (Code: 783655865) - U9, U10, U15, U16 teams
- **Salford League** (Code: 84363452) - U7, U8, U13 teams

## Project Structure

```
/Users/leehayton/ai-apps/urmston-town/
├── fixtures-scraper/              # All scraping-related code
│   ├── README.md                  # This file
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
│   └── .github/
│       └── workflows/
│           └── scrape.yml         # GitHub Actions workflow
├── docs/                          # Documentation (already created)
│   ├── FIXTURES_SCRAPING_PRD.md
│   └── DEVELOPMENT_STORIES.md
└── [existing Next.js files]      # Your current website
```

## Quick Start

1. **Local Development**: Work in `/fixtures-scraper/`
2. **Hostinger Deployment**: Use SSH/SCP or the deploy script
   ```bash
   # Test SSH connection
   ./deploy.sh test
   
   # Deploy specific component
   ./deploy.sh widget
   ./deploy.sh api
   
   # Deploy everything
   ./deploy.sh all
   ```
3. **GitHub Actions**: Push `/fixtures-scraper/.github/` to your GitHub repo

## File Locations

### On Your Local Machine
- Main project: `/Users/leehayton/ai-apps/urmston-town/fixtures-scraper/`
- Documentation: `/Users/leehayton/ai-apps/urmston-town/docs/`

### On Hostinger (after deployment)
- Widget page: `https://pages.urmstontownjfc.co.uk/fa-widget.html` ✅ **DEPLOYED**
- API endpoints: `https://pages.urmstontownjfc.co.uk/api/fixtures/`
- Database: MySQL panel in Hostinger

### On GitHub (after push)
- Repository: `github.com/junksamiad/urmston-town-fixtures`
- Actions: `.github/workflows/scrape.yml`

## Deployment Status

### ✅ Completed (2025-09-12)
1. **FA Widget HTML Page**: Successfully deployed to `https://pages.urmstontownjfc.co.uk/fa-widget.html`
   - Widget loads and displays fixtures for Timperley & District JFL (League Code: 783655865)
   - Shows fixtures for multiple Urmston Town Juniors teams (U9, U10, U15, U16)
   - Page includes noindex meta tags and robots.txt exclusion
2. **Robots.txt**: Created and configured to prevent search engine indexing of fa-widget.html
3. **SSH Access**: Enabled on Hostinger (Port: 65002, IP: 82.29.186.226)
4. **MySQL Database Structure**: Files ready for deployment
   - Schema file created: `/hostinger/database/schema.sql`
   - Setup instructions: `/hostinger/database/setup-instructions.md`
   - Test queries: `/hostinger/database/test-queries.sql`
   - Environment template: `/hostinger/.env.example`

### ✅ Completed (2025-09-12)
- **Story 2**: MySQL Database Structure - Successfully deployed
  - **Database**: `u790502142_fixtures` created in Hostinger
  - **Tables**: 3 tables created (fixtures, teams, scrape_logs)
  - **Views**: 2 views created (upcoming_fixtures, recent_results)  
  - **Teams**: 8 teams populated (U9s through U16s)
  - **Credentials**: Documented in `HOSTINGER_DB_CREDENTIALS.md`
  - **Local Setup**: `.env` file created for PHP endpoints

### ✅ Completed (2025-09-12) 
- **Story 3**: PHP Ingestion Endpoint - Successfully deployed
  - **Endpoint URL**: `https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php`
  - **Method**: POST
  - **Authentication**: Bearer token `a8f3d2b1c9e4f7a6d5b8c3e2f1a9b4c7`
  - **Files Deployed**: 
    - `/public_html/api/fixtures/ingest.php` - Full database operations
    - `/public_html/api/fixtures/.htaccess` - Security configuration
    - `/public_html/.env.php` - Database credentials
  - **Features**:
    - Bearer token authentication (403 on invalid)
    - Database upsert operations (insert new, update existing)
    - Transaction handling for data integrity
    - Scrape logging to track operations
    - CORS headers enabled
  - **Tests Passed**:
    - ✅ New fixture insertion
    - ✅ Fixture updates
    - ✅ Authentication validation
    - ✅ Database operations

### 🚀 Next Steps

1. ✅ ~~Database deployment complete~~
2. ✅ ~~Schema executed and verified~~  
3. ✅ ~~PHP Ingestion endpoint deployed~~
4. → **Ready for Story 5**: Playwright Scraper development