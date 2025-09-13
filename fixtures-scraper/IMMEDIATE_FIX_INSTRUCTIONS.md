# IMMEDIATE FIX: Deploy Missing .env.php File

## Problem
The fixtures page shows "HTTP error status: 500" because the `.env.php` file with database credentials is missing from Hostinger.

## Solution (5 minutes)

### Step 1: Access Hostinger File Manager
1. Login to: https://hpanel.hostinger.com
2. Navigate to: **Files** → **File Manager**
3. Go to: `/public_html/`

### Step 2: Upload .env.php File
1. **Local file location**: `/Users/leehayton/ai-apps/urmston-town/fixtures-scraper/hostinger/.env.php`
2. **Upload to**: `/public_html/.env.php` (in the root directory)
3. **Method**: Use "Upload Files" button in File Manager
4. **Verify**: File should appear as `/public_html/.env.php`

### Step 3: Verify File Contents
The uploaded file should contain:
```php
<?php
// Database credentials
define('DB_HOST', 'localhost');
define('DB_NAME', 'u790502142_fixtures');
define('DB_USER', 'u790502142_fixtures');
define('DB_PASS', 'Fix#tures2024$DB!');

// API Authentication
define('API_AUTH_TOKEN', 'a8f3d2b1c9e4f7a6d5b8c3e2f1a9b4c7');
?>
```

### Step 4: Test Database Connection (Optional)
1. **Upload test file**: `/Users/leehayton/ai-apps/urmston-town/fixtures-scraper/hostinger/api/fixtures/db-test.php`
2. **Upload to**: `/public_html/api/fixtures/db-test.php`
3. **Visit**: https://pages.urmstontownjfc.co.uk/api/fixtures/db-test.php
4. **Expected**: Should show "✅ DATABASE CONNECTION SUCCESSFUL!"
5. **IMPORTANT**: Delete `db-test.php` after testing for security

### Step 5: Test API Endpoint
```bash
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get-enhanced.php?limit=1"
```
**Expected**: Should return JSON fixture data instead of 500 error

### Step 6: Test Frontend
Visit: https://pages.urmstontownjfc.co.uk/fixtures/
**Expected**: Should load fixtures or show "No upcoming fixtures" instead of error

## Why This Happened

1. **`.env.php` exists locally** ✅ (contains database credentials)
2. **`.env.php` was never deployed** ❌ (excluded from deployment scripts for security)
3. **API endpoints need `.env.php`** ❌ (fail without database credentials)
4. **Frontend calls failing APIs** ❌ (shows 500 error)

## File Structure After Fix
```
/public_html/
├── .env.php                    # ← THIS FILE WAS MISSING!
├── index.html
├── fixtures/
│   └── index.html
├── api/
│   └── fixtures/
│       ├── get-enhanced.php
│       └── ingest.php
└── fa-widget.html
```

## Alternative Method (If File Manager Fails)

1. **Copy file contents**: Open `/Users/leehayton/ai-apps/urmston-town/fixtures-scraper/hostinger/.env.php`
2. **Create new file**: In File Manager, create new file called `.env.php`
3. **Paste contents**: Copy the PHP code above
4. **Save**: Place in `/public_html/.env.php`

## Verification Commands

After deployment, all these should work:

```bash
# Test database connection
curl https://pages.urmstontownjfc.co.uk/api/fixtures/db-test.php

# Test API endpoint
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get-enhanced.php?limit=1"

# Test basic API
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php?limit=1"
```

## Security Notes

- ✅ `.env.php` is properly excluded from git (security)
- ✅ Contains real database credentials (necessary)
- ⚠️ Must be deployed manually (not in automated scripts)
- ⚠️ Delete any diagnostic files after testing

---

**This should resolve the 500 error immediately!** 🎯