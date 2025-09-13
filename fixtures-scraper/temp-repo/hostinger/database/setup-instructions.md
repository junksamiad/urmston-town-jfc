# MySQL Database Setup Instructions

## Quick Setup Guide for Hostinger

### Step 1: Access Hostinger MySQL Management

Choose one of these methods:

#### Option A: Via Web Panel (Easiest)
1. Log into Hostinger hPanel at https://hpanel.hostinger.com
2. Navigate to **Databases** → **MySQL Databases**
3. Click **Create New Database**

#### Option B: Via SSH (Advanced)
```bash
# Connect via SSH
ssh -p 65002 u790502142@82.29.186.226

# Access MySQL
mysql -u u790502142 -p
```

### Step 2: Create Database and User

#### Via Web Panel:
1. **Database Name**: `u790502142_fixtures`
2. **Username**: `u790502142_fixtures` (or your choice)
3. **Password**: Generate a strong password (save it securely!)
4. **Permissions**: Grant ALL privileges

#### Via SSH:
```bash
# This may already be done via hPanel
CREATE DATABASE u790502142_fixtures;
CREATE USER 'u790502142_fixtures'@'localhost' IDENTIFIED BY 'YOUR_STRONG_PASSWORD';
GRANT ALL PRIVILEGES ON u790502142_fixtures.* TO 'u790502142_fixtures'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Execute Schema

#### Via phpMyAdmin (Recommended):
1. In hPanel, click **phpMyAdmin** button next to your database
2. Select `u790502142_fixtures` database
3. Click **SQL** tab
4. Copy contents of `schema.sql` file
5. Paste and click **Go**
6. You should see "Database created successfully!" message

#### Via SSH:
```bash
# Upload schema file first
scp -P 65002 schema.sql u790502142@82.29.186.226:~/

# Then execute it
ssh -p 65002 u790502142@82.29.186.226
mysql -u u790502142_fixtures -p u790502142_fixtures < schema.sql
```

### Step 4: Verify Installation

Run these checks in phpMyAdmin SQL tab:

```sql
-- Check tables exist
SHOW TABLES;
-- Expected: fixtures, teams, scrape_logs, upcoming_fixtures, recent_results

-- Check teams are populated
SELECT * FROM teams;
-- Expected: 8 teams (U9s through U16s)

-- Check table structure
DESCRIBE fixtures;
-- Should show all columns with correct types
```

### Step 5: Save Credentials

Create `.env` file locally (DO NOT commit to git):

```env
# Save as /fixtures-scraper/hostinger/.env
DB_HOST=localhost
DB_NAME=u790502142_fixtures
DB_USER=u790502142_fixtures
DB_PASS=YOUR_PASSWORD_HERE
DB_PORT=3306
```

Also save in your password manager with these details:
- **Service**: Hostinger MySQL - Fixtures Database
- **Database**: u790502142_fixtures
- **Username**: u790502142_fixtures
- **Password**: [your password]
- **Host**: localhost (when connecting from PHP)
- **External Host**: 82.29.186.226 (if connecting remotely)

## Troubleshooting

### Common Issues:

1. **"Access denied" error**
   - Check username/password are correct
   - Ensure user has privileges on the database
   
2. **"Database already exists" error**
   - This is OK - the schema uses `IF NOT EXISTS` clauses
   - Continue with table creation

3. **"Duplicate entry" error on teams**
   - This is OK - teams use `ON DUPLICATE KEY UPDATE`
   - Means teams already exist

4. **Can't connect via SSH**
   - Ensure using port 65002
   - Check SSH is enabled in hPanel

### Test Connection from PHP

Create a test file `test-db.php`:

```php
<?php
$host = 'localhost';
$db = 'u790502142_fixtures';
$user = 'u790502142_fixtures';
$pass = 'YOUR_PASSWORD';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass);
    echo "✅ Database connection successful!\n";
    
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM teams");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "✅ Teams in database: " . $result['count'] . "\n";
} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "\n";
}
?>
```

## Security Checklist

- [ ] Strong password (16+ characters, mixed case, numbers, symbols)
- [ ] Password saved in password manager
- [ ] `.env` file created locally
- [ ] `.env` added to `.gitignore`
- [ ] Database user has minimal required privileges
- [ ] No credentials in any committed files

## Next Steps

Once database is set up:
1. Continue to Story 3: Build PHP Ingestion Endpoint
2. Update README.md with completion status
3. Mark Story 2 as complete in DEVELOPMENT_STORIES.md