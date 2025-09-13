# Story 10: Documentation & Handover
**Status**: ⏳ Pending  
**Priority**: P2 - Medium  
**Time Estimate**: 30 minutes  

---

## 📋 Story Overview
Create comprehensive documentation for maintenance, troubleshooting, and future development of the fixture scraping system.

---

## ✅ Progress Checklist

### Pre-requisites
- [ ] All previous stories complete (1-9)
- [ ] System fully operational

### Documentation Tasks

- [ ] **Task 1**: Create API documentation
  - **File**: `/fixtures-scraper/docs/API.md`
  - **Content**: All endpoints, parameters, responses
  - **Status**: ⏳ PENDING

- [ ] **Task 2**: Write maintenance guide
  - **File**: `/fixtures-scraper/docs/MAINTENANCE.md`
  - **Content**: Common tasks, troubleshooting
  - **Status**: ⏳ PENDING

- [ ] **Task 3**: Document credentials management
  - **File**: `/fixtures-scraper/docs/CREDENTIALS.md`
  - **Content**: Where stored, how to update
  - **Status**: ⏳ PENDING

- [ ] **Task 4**: Create backup procedures
  - **File**: `/fixtures-scraper/docs/BACKUP.md`
  - **Content**: Database backup, recovery steps
  - **Status**: ⏳ PENDING

- [ ] **Task 5**: Final README review
  - **File**: `/fixtures-scraper/README.md`
  - **Action**: Ensure completely up-to-date
  - **Status**: ⏳ PENDING

---

## 📁 Files to Create

### `/fixtures-scraper/docs/API.md`
```markdown
# API Documentation
## Urmston Town Fixtures API

### Base URL
```
https://pages.urmstontownjfc.co.uk/api/fixtures
```

---

## Endpoints

### 1. Get Fixtures (Public)
Retrieve fixture data with optional filters.

**Endpoint:** `GET /get.php`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| team | string | No | Filter by team/age group (e.g., "U10") |
| status | string | No | Filter by status: upcoming, completed, postponed, cancelled |
| from | string | No | Start date (YYYY-MM-DD) |
| to | string | No | End date (YYYY-MM-DD) |
| limit | integer | No | Max results (default: 100, max: 500) |
| offset | integer | No | Pagination offset (default: 0) |

**Example Request:**
```bash
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php?team=U12&status=upcoming"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "date": "2025-01-20 10:30:00",
      "homeTeam": "Urmston Town U12s",
      "awayTeam": "Sale United U12s",
      "venue": "Abbotsfield Park",
      "competition": "Timperley League",
      "homeScore": null,
      "awayScore": null,
      "status": "upcoming",
      "ageGroup": "U12",
      "isHome": true,
      "isAway": false
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  },
  "stats": {
    "total": 25,
    "upcoming": 15,
    "completed": 10,
    "postponed": 0
  }
}
```

---

### 2. Ingest Fixtures (Private)
Submit scraped fixture data to the database.

**Endpoint:** `POST /ingest.php`

**Authentication:** Bearer token required

**Headers:**
```
Authorization: Bearer YOUR_SECRET_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "fixtures": [
    {
      "date": "2025-01-20 14:00:00",
      "home_team": "Urmston Town U10s",
      "away_team": "Stretford FC U10s",
      "venue": "Abbotsfield Park",
      "competition": "Timperley League",
      "home_score": null,
      "away_score": null,
      "status": "upcoming",
      "age_group": "U10"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "fixtures_found": 1,
    "fixtures_new": 1,
    "fixtures_updated": 0,
    "errors": []
  },
  "timestamp": "2025-01-12 15:00:00"
}
```

---

### 3. Health Check
Monitor system health and status.

**Endpoint:** `GET /health.php`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-12 19:00:00",
  "checks": {
    "database": {
      "status": "healthy",
      "fixtures_count": 45
    },
    "scraper": {
      "status": "healthy",
      "last_success": "2025-01-12 15:00:00",
      "hours_ago": 4
    }
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request parameters"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "No authorization header"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Invalid token"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "An error occurred"
}
```

---

## Rate Limiting
- Public endpoints: No hard limit, cached for 5 minutes
- Private endpoints: Unlimited (internal use only)

## CORS
All endpoints allow cross-origin requests from any domain.
```

### `/fixtures-scraper/docs/MAINTENANCE.md`
```markdown
# Maintenance Guide
## Urmston Town Fixtures System

---

## 🔧 Common Tasks

### 1. Manual Scrape Trigger
```bash
# Via AWS CLI
aws lambda invoke \
  --function-name urmston-fixtures-scraper \
  --profile footballclub \
  --region eu-north-1 \
  output.json && cat output.json

# Via AWS Console UI
1. Go to Lambda service
2. Select "urmston-fixtures-scraper"
3. Click "Test" tab
4. Click "Test" button
```

### 2. Check System Health
```bash
# Via command line
curl https://pages.urmstontownjfc.co.uk/api/fixtures/health.php | jq '.'

# Via browser
https://pages.urmstontownjfc.co.uk/monitor.php
```

### 3. Clear Old Data
```sql
-- Connect to database via phpMyAdmin
-- Remove fixtures older than 6 months
DELETE FROM fixtures 
WHERE fixture_date < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Clear old scrape logs
DELETE FROM scrape_logs 
WHERE scrape_time < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### 4. Update API Token
```bash
# 1. Generate new 32-character token
openssl rand -hex 16

# 2. Update AWS Lambda environment variable
aws lambda update-function-configuration \
  --function-name urmston-fixtures-scraper \
  --environment Variables='{API_TOKEN=NEW_TOKEN_HERE,WIDGET_URL=https://pages.urmstontownjfc.co.uk/fa-widget.html,API_URL=https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php}' \
  --profile footballclub \
  --region eu-north-1

# 3. Update on Hostinger
# Edit /api/fixtures/.env.php
define('API_AUTH_TOKEN', 'NEW_TOKEN_HERE');
```

---

## 🐛 Troubleshooting

### Problem: No New Fixtures Appearing

**Check 1: FA Widget**
```bash
# Visit the widget page
curl -I https://pages.urmstontownjfc.co.uk/fa-widget.html
# Should return 200 OK
```

**Check 2: AWS Lambda**
```bash
# Check recent invocations
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/urmston-fixtures-scraper" \
  --profile footballclub \
  --region eu-north-1

# View recent logs
aws logs tail /aws/lambda/urmston-fixtures-scraper \
  --follow \
  --profile footballclub \
  --region eu-north-1
```

**Check 3: Database**
```sql
-- Check last successful scrape
SELECT * FROM scrape_logs 
ORDER BY id DESC 
LIMIT 5;
```

**Check 4: API Response**
```bash
curl https://pages.urmstontownjfc.co.uk/api/fixtures/get.php
```

### Problem: Scraper Failing

**Common Causes:**
1. FA Full-Time changed HTML structure
2. Widget page down
3. API token mismatch
4. Database connection issue

**Solution Steps:**
1. Check CloudWatch logs for error details
2. Run scraper locally in test mode
3. Verify API token matches in Lambda environment
4. Check database credentials

### Problem: Duplicate Fixtures

**Solution:**
```sql
-- Find duplicates
SELECT fixture_date, home_team, away_team, COUNT(*) as count
FROM fixtures
GROUP BY fixture_date, home_team, away_team
HAVING count > 1;

-- Remove duplicates (keep newest)
DELETE f1 FROM fixtures f1
INNER JOIN fixtures f2 
WHERE f1.id < f2.id 
AND f1.fixture_date = f2.fixture_date 
AND f1.home_team = f2.home_team 
AND f1.away_team = f2.away_team;
```

---

## 📅 Regular Maintenance

### Daily
- Monitor automated scrapes (9 AM, 3 PM UTC)
- Check CloudWatch alarms for failures

### Weekly
- Review scrape success rate
- Check upcoming fixtures look correct
- Verify all age groups have fixtures

### Monthly
- Clear old scrape logs
- Review error patterns
- Update documentation if needed

### Seasonal
- Archive old season data
- Update team list if needed
- Review and optimize database

---

## 🚨 Emergency Procedures

### If Scraping Stops Working
1. Check FA Full-Time website is up
2. Manually trigger scrape via AWS Lambda
3. Check CloudWatch logs for errors
4. Test API endpoints
5. Contact support if needed

### If Database Corrupted
1. Stop scraping (disable EventBridge rules)
2. Restore from backup (see BACKUP.md)
3. Verify data integrity
4. Re-enable scraping

### If API Hacked/Compromised
1. Immediately change API token
2. Review access logs
3. Check for unauthorized data
4. Update all credentials
5. Implement additional security

---

## 📞 Support Contacts

- **GitHub Issues**: Create issue in repository
- **Hostinger Support**: Via hPanel
- **FA Full-Time**: No direct support (community forums)
```

### `/fixtures-scraper/docs/CREDENTIALS.md`
```markdown
# Credentials Management
## ⚠️ CONFIDENTIAL - Do Not Share

---

## 🔐 Credential Locations

### 1. AWS Lambda Environment Variables
**Location:** Lambda → urmston-fixtures-scraper → Configuration → Environment variables

| Variable | Purpose | How to Update |
|----------|---------|---------------|
| API_TOKEN | Auth for ingestion API | Update via AWS CLI or Console |
| WIDGET_URL | FA widget URL | Update via AWS CLI or Console |
| API_URL | Ingestion endpoint | Update via AWS CLI or Console |

### 2. Hostinger Database
**Location:** hPanel → Databases → MySQL

| Credential | Where Used | Notes |
|------------|------------|-------|
| DB Host | PHP endpoints | Usually 'localhost' |
| DB Name | PHP endpoints | u790502142_fixtures |
| DB User | PHP endpoints | u790502142_[name] |
| DB Password | PHP endpoints | Store in password manager |

### 3. Hostinger Files
**Location:** /api/fixtures/.env

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u790502142_fixtures');
define('DB_USER', 'u790502142_XXXXX');
define('DB_PASS', 'XXXXXXXXXXXXX');
define('API_AUTH_TOKEN', 'XXXXXXXXXXXXX');
```

---

## 🔄 Rotation Schedule

### Recommended Rotation
- **API Token**: Every 3 months
- **Database Password**: Every 6 months
- **AWS Lambda Environment Variables**: On suspicion of compromise

### Rotation Procedure
1. Generate new credential
2. Update in staging/test first
3. Update in production during low-traffic period
4. Verify system working
5. Document rotation date

---

## 🛡️ Security Best Practices

### DO:
- ✅ Use password manager
- ✅ Use strong, unique passwords
- ✅ Rotate credentials regularly
- ✅ Limit access to need-to-know
- ✅ Use environment variables

### DON'T:
- ❌ Commit credentials to Git
- ❌ Share credentials via email
- ❌ Use default passwords
- ❌ Store in plain text files
- ❌ Use same password multiple places

---

## 🚨 Breach Response

### If Credentials Compromised:
1. **Immediately** change all affected credentials
2. Review access logs for unauthorized use
3. Check for data tampering
4. Notify stakeholders if data affected
5. Document incident and response

### Priority Order:
1. Database password (highest risk)
2. API tokens
3. AWS Lambda environment variables
4. Monitoring credentials

---

## 📝 Credential History

| Date | Credential | Action | By |
|------|------------|--------|-----|
| 2025-01-12 | All | Initial setup | - |
| - | - | - | - |

---

## 🔑 Password Requirements

### Minimum Standards:
- Length: 16+ characters
- Complexity: Mixed case, numbers, symbols
- Uniqueness: Not used elsewhere
- Storage: Password manager only

### Token Generation:
```bash
# Generate secure 32-character token
openssl rand -hex 16

# Generate secure password
openssl rand -base64 32
```
```

### `/fixtures-scraper/docs/BACKUP.md`
```markdown
# Backup & Recovery Procedures
## Urmston Town Fixtures System

---

## 🗄️ What to Backup

### Priority 1: Database
- All fixture data
- Team information
- Scrape logs

### Priority 2: Configuration
- PHP endpoints
- Environment files
- AWS Lambda configuration

### Priority 3: Documentation
- API documentation
- Maintenance guides
- Credential records

---

## 📥 Backup Procedures

### 1. Database Backup (Manual)

**Via phpMyAdmin:**
1. Log into Hostinger hPanel
2. Open phpMyAdmin
3. Select database: `u790502142_fixtures`
4. Click "Export" tab
5. Choose:
   - Export method: Quick
   - Format: SQL
6. Click "Go" to download

**Via Command Line:**
```bash
# If SSH access available
mysqldump -u u790502142_USER -p u790502142_fixtures > backup_$(date +%Y%m%d).sql
```

### 2. Automated Backup Script

Create `/fixtures-scraper/hostinger/backup.php`:
```php
<?php
// Weekly backup script
require_once __DIR__ . '/.env.php';

$date = date('Y-m-d');
$backupFile = "/backups/fixtures_backup_{$date}.sql";

$command = sprintf(
    'mysqldump --user=%s --password=%s --host=%s %s > %s',
    DB_USER,
    DB_PASS,
    DB_HOST,
    DB_NAME,
    $backupFile
);

exec($command, $output, $return);

if ($return === 0) {
    echo "Backup successful: {$backupFile}";
} else {
    echo "Backup failed";
}
?>
```

### 3. Code Backup

**GitHub Repository:**
- Code automatically backed up by GitHub
- Lambda deployment via ECR images

**Local Backup:**
```bash
# Clone repository locally
git clone https://github.com/junksamiad/urmston-town-fixtures.git

# Create archive
tar -czf fixtures_backup_$(date +%Y%m%d).tar.gz fixtures-scraper/
```

---

## 📤 Recovery Procedures

### 1. Database Recovery

**From SQL Backup:**
```sql
-- Via phpMyAdmin
1. Select database
2. Click "Import" tab
3. Choose backup file
4. Click "Go"

-- Via command line
mysql -u u790502142_USER -p u790502142_fixtures < backup_20250112.sql
```

**Verify Recovery:**
```sql
-- Check fixture count
SELECT COUNT(*) FROM fixtures;

-- Check latest fixtures
SELECT * FROM fixtures ORDER BY created_at DESC LIMIT 10;
```

### 2. Code Recovery

**From GitHub:**
```bash
# Clone repository
git clone https://github.com/junksamiad/urmston-town-fixtures.git

# Redeploy Lambda
cd fixtures-scraper/lambda
export AWS_PROFILE=footballclub
export API_TOKEN=your_token_here
./deploy.sh

# Deploy to Hostinger
# Upload PHP files via file manager or FTP
```

**From Local Backup:**
```bash
# Extract archive
tar -xzf fixtures_backup_20250112.tar.gz

# Deploy files to Hostinger
```

---

## 🔄 Backup Schedule

### Recommended Schedule

| Component | Frequency | Method | Storage |
|-----------|-----------|--------|---------|
| Database | Weekly | Automated | Hostinger + Local |
| Code | On change | Git | GitHub |
| Configs | Monthly | Manual | Secure cloud |
| Docs | On change | Git | GitHub |

### Retention Policy

- **Daily backups**: Keep for 7 days
- **Weekly backups**: Keep for 4 weeks
- **Monthly backups**: Keep for 12 months
- **Annual backups**: Keep indefinitely

---

## 🚨 Disaster Recovery

### Scenario 1: Complete Data Loss

**Recovery Time Objective (RTO)**: 4 hours

1. **Hour 1**: Assess damage, notify stakeholders
2. **Hour 2**: Restore database from latest backup
3. **Hour 3**: Redeploy code and test
4. **Hour 4**: Run manual scrape, verify system

### Scenario 2: Corrupted Data

1. Identify corruption timeframe
2. Restore to point before corruption
3. Manually re-run scrapes for gap period
4. Verify data integrity

### Scenario 3: Accidental Deletion

1. Check if data in trash/recycle
2. Restore from latest backup
3. Re-run scrape for current fixtures
4. Update procedures to prevent recurrence

---

## 🧪 Backup Testing

### Monthly Test Procedure

1. **Test Backup Creation**
   ```bash
   # Create test backup
   mysqldump -u USER -p DATABASE > test_backup.sql
   
   # Verify file size > 0
   ls -lh test_backup.sql
   ```

2. **Test Restoration**
   ```sql
   -- Create test database
   CREATE DATABASE test_restore;
   
   -- Restore backup
   mysql -u USER -p test_restore < test_backup.sql
   
   -- Verify data
   SELECT COUNT(*) FROM test_restore.fixtures;
   
   -- Clean up
   DROP DATABASE test_restore;
   ```

3. **Document Results**
   - Date tested
   - Backup size
   - Restoration time
   - Any issues found

---

## 📋 Backup Checklist

### Before Major Changes
- [ ] Full database backup
- [ ] Code committed to Git
- [ ] Configuration files backed up
- [ ] Document current state

### Weekly Tasks
- [ ] Verify automated backups ran
- [ ] Check backup file sizes
- [ ] Rotate old backups
- [ ] Update backup log

### Monthly Tasks
- [ ] Test restoration procedure
- [ ] Review backup strategy
- [ ] Update documentation
- [ ] Verify offsite backups

---

## 💾 Storage Locations

### Primary Backups
- **Location**: Hostinger server
- **Path**: `/backups/`
- **Access**: Via file manager

### Secondary Backups
- **Location**: Local machine
- **Path**: `~/backups/urmston-fixtures/`
- **Frequency**: Weekly download

### Tertiary Backups
- **Location**: Cloud storage
- **Service**: Google Drive / Dropbox
- **Encryption**: Required

---

## 📝 Recovery Log

| Date | Incident | Recovery Time | Notes |
|------|----------|---------------|-------|
| - | - | - | No incidents yet |
```

---

## 📊 Final README Update

The main README at `/fixtures-scraper/README.md` should now include:

1. ✅ System architecture overview
2. ✅ Directory structure
3. ✅ Deployment locations
4. ✅ Quick start guide
5. ✅ API endpoints summary
6. ✅ Monitoring URLs
7. ✅ Troubleshooting basics
8. ✅ Links to all documentation

---

## 🧪 Documentation Test

### Verification Checklist
- [ ] All file paths are correct
- [ ] Code examples work
- [ ] Commands are tested
- [ ] Links are valid
- [ ] Credentials masked appropriately
- [ ] Contact information current

---

## 🎯 Acceptance Criteria

| Criteria | Status | Notes |
|----------|--------|-------|
| API documentation complete | ⏳ | All endpoints documented |
| Maintenance guide useful | ⏳ | Common tasks covered |
| Credentials documented | ⏳ | Securely stored |
| Backup procedures clear | ⏳ | Tested and verified |
| README fully updated | ⏳ | Single source of truth |

---

## ✅ Definition of Done

- [ ] All documentation files created
- [ ] Reviewed for accuracy
- [ ] Sensitive data removed
- [ ] Uploaded to repository
- [ ] Team briefed on procedures
- [ ] Backup test performed
- [ ] Handover complete

---

## 🔗 Related Links

- [Main PRD](../FIXTURES_SCRAPING_PRD.md)
- [All Stories](../DEVELOPMENT_STORIES.md)
- [Project README](/fixtures-scraper/README.md)