# Complete Deployment Workflow
## Urmston Town Fixtures System

This document outlines the complete deployment process for all components of the Urmston Town fixtures system.

## System Components

1. **Next.js Frontend** - Static React website
2. **PHP APIs** - Backend data endpoints
3. **MySQL Database** - Data storage
4. **FA Widget** - Hidden scraping page
5. **AWS Lambda** - Automated scraper
6. **Environment Config** - Credentials and settings

## SSH Access Credentials

**Server**: `82.29.186.226`
**Port**: `65002`
**Username**: `u790502142`
**Password**: `UrmstonSSH2025!`

```bash
# SSH Command
ssh -p 65002 u790502142@82.29.186.226

# SCP Commands
scp -P 65002 [local-file] u790502142@82.29.186.226:~/public_html/[remote-path]
```

**Note**: If SSH credentials fail, use Hostinger File Manager as backup method.

## Pre-Deployment Checklist

- [ ] Local development working (`npm run dev`)
- [ ] All tests passing
- [ ] Database credentials verified
- [ ] SSH access to Hostinger working (or File Manager access)
- [ ] AWS Lambda functioning (if needed)

## Complete Deployment Process

### 1. Build Frontend
```bash
cd /Users/leehayton/ai-apps/urmston-town/
npm run build
# Creates /out/ directory with static files
```

### 2. Deploy Environment Configuration
**Method A: SSH** (see SSH credentials section above)
```bash
cd fixtures-scraper/
scp -P 65002 hostinger/.env.php u790502142@82.29.186.226:~/public_html/.env.php
```

**Method B: File Manager**
1. Login to Hostinger File Manager
2. Navigate to `/public_html/`
3. Upload `fixtures-scraper/hostinger/.env.php`
4. Verify file permissions (should be readable by PHP)

### 3. Deploy PHP APIs
```bash
cd fixtures-scraper/
./deploy.sh api
```

This deploys:
- `ingest.php` - Data ingestion endpoint
- `get-enhanced.php` - Public API with Airtable integration
- `.htaccess` - Security rules

### 4. Deploy Frontend
```bash
cd fixtures-scraper/
./deploy.sh frontend
```

This will:
- Build Next.js app (`npm run build`)
- Create deployment archive
- Upload to Hostinger
- Extract files to `/public_html/`

### 5. Deploy FA Widget (if needed)
```bash
cd fixtures-scraper/
./deploy.sh widget
```

### 6. Verify Database Connection
Upload and run the database test:
1. Upload `db-test.php` to `/public_html/api/fixtures/`
2. Visit: `https://pages.urmstontownjfc.co.uk/api/fixtures/db-test.php`
3. Verify connection and data
4. **DELETE THE FILE** after testing for security

## Deployment Order (Critical)

When deploying after code changes, follow this order:

1. **Environment** first (`.env.php`)
2. **Database** changes (if any)
3. **APIs** (PHP endpoints)
4. **Frontend** (Next.js build)
5. **Widget** (if changed)

## Common Issues & Solutions

### 500 Internal Server Error
**Cause**: Missing `.env.php` file or database connection failure
**Solution**:
1. Ensure `.env.php` is uploaded to `/public_html/.env.php`
2. Test database connection with `db-test.php`
3. Check PHP error logs in Hostinger

### Frontend Shows Old Content
**Cause**: Browser caching or incomplete upload
**Solution**:
1. Clear browser cache (Ctrl+F5)
2. Verify `_next/` folder was uploaded completely
3. Check file modification dates on server

### API Returns Empty Response
**Cause**: PHP errors or missing dependencies
**Solution**:
1. Check `.env.php` file exists
2. Test database connection
3. Verify Airtable API key (if using enhanced endpoints)

### Fixtures Not Loading
**Cause**: Database empty or API endpoint issues
**Solution**:
1. Run AWS Lambda manually to populate data
2. Check scrape logs in database
3. Verify API endpoints respond correctly

## File Locations After Deployment

```
Hostinger /public_html/
├── .env.php                    # Environment variables
├── index.html                  # Next.js home page
├── fixtures/
│   └── index.html             # Next.js fixtures page
├── _next/                     # Next.js assets (CSS, JS)
│   ├── static/
│   └── ...
├── api/
│   └── fixtures/
│       ├── get-enhanced.php   # Main API endpoint
│       ├── ingest.php         # Data ingestion
│       └── .htaccess          # Security
├── fa-widget.html             # FA scraping widget
└── cache/                     # Airtable cache (auto-created)
    └── airtable_teams.json
```

## Testing Deployed System

### 1. Test Database
```bash
curl https://pages.urmstontownjfc.co.uk/api/fixtures/db-test.php
# Should show connection success and fixture counts
```

### 2. Test API
```bash
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get-enhanced.php?limit=1"
# Should return JSON fixture data
```

### 3. Test Frontend
- Visit: `https://pages.urmstontownjfc.co.uk/fixtures/`
- Should load with proper styling
- Should display fixtures or appropriate empty state

### 4. Test Full Pipeline
1. Trigger AWS Lambda manually
2. Check new fixtures appear in database
3. Verify API returns updated data
4. Confirm frontend displays new fixtures

## Rollback Procedure

If deployment fails:

1. **Backup Current State**:
   - Download current `/public_html/` via File Manager
   - Note current database state

2. **Restore Previous Version**:
   ```bash
   # Restore previous frontend build
   git checkout HEAD~1
   npm run build
   ./deploy.sh frontend
   ```

3. **Database Rollback** (if needed):
   - Restore from backup
   - Or manually delete problematic data

## Maintenance Schedule

### Weekly
- [ ] Check AWS Lambda execution logs
- [ ] Verify fixture data is updating
- [ ] Test frontend loads correctly

### Monthly
- [ ] Update npm dependencies
- [ ] Review database size and performance
- [ ] Check SSL certificate expiry
- [ ] Backup database

### As Needed
- [ ] Deploy code changes following this workflow
- [ ] Update API tokens if compromised
- [ ] Scale database if storage issues

## Security Notes

- Never commit `.env` or `.env.php` to git
- Delete diagnostic scripts after use
- Rotate API tokens periodically
- Monitor for unauthorized database access
- Keep PHP and server software updated

## Emergency Contacts

- **Hostinger Support**: Via hPanel
- **Database Issues**: Check `HOSTINGER_DB_CREDENTIALS.md`
- **AWS Lambda**: Check CloudWatch logs
- **Domain Issues**: Check DNS settings

---

**Generated**: 2025-09-14
**Version**: 1.0
**Next Review**: Monthly or after major changes