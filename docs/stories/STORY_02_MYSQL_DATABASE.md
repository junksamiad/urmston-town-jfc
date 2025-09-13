# Story 2: Create MySQL Database Structure
**Status**: ✅ COMPLETE  
**Priority**: P0 - Blocker  
**Time Estimate**: 30 minutes (Actual: ~40 minutes)  
**Development Completed**: 2025-09-12  
**Deployment Completed**: 2025-09-12  

---

## 📋 Story Overview
Set up the MySQL database and tables on Hostinger to store fixture data scraped from FA Full-Time.

---

## ✅ Progress Checklist

### Pre-requisites
- [x] Story 1 complete (FA widget deployed)
- [x] Access to Hostinger MySQL management

### Implementation Tasks

- [x] **Task 1**: Create SQL schema file
  - **File**: `/fixtures-scraper/hostinger/database/schema.sql`
  - **Status**: ✅ COMPLETE (2025-09-12)

- [x] **Task 2**: Create setup instructions
  - **File**: `/fixtures-scraper/hostinger/database/setup-instructions.md`
  - **Status**: ✅ COMPLETE (2025-09-12)

- [x] **Task 3**: Create test queries
  - **File**: `/fixtures-scraper/hostinger/database/test-queries.sql`
  - **Status**: ✅ COMPLETE (2025-09-12)

- [x] **Task 4**: Create environment template
  - **File**: `/fixtures-scraper/hostinger/.env.example`
  - **Status**: ✅ COMPLETE (2025-09-12)

- [x] **Task 5**: Update project documentation
  - **Updated**: README.md with database file locations
  - **Status**: ✅ COMPLETE (2025-09-12)

### Deployment Tasks (Manual via Web Panel)

- [x] **Deploy Task 1**: Access Hostinger MySQL management
  - **Method**: Web hPanel → Databases → MySQL Databases
  - **URL**: https://hpanel.hostinger.com
  - **Note**: Following same approach as Story 1 (via web interface)
  - **Status**: ✅ COMPLETE (2025-09-12)

- [x] **Deploy Task 2**: Create database with credentials
  - **Database name**: `u790502142_fixtures`
  - **Username**: `u790502142_fixtures`
  - **Password**: Generated and stored securely
  - **Status**: ✅ COMPLETE (2025-09-12)

- [x] **Deploy Task 3**: Execute database schema via phpMyAdmin
  - **Access**: Click "phpMyAdmin" button in hPanel
  - **Execute**: `/fixtures-scraper/hostinger/database/schema.sql`
  - **Status**: ✅ COMPLETE (2025-09-12)

- [x] **Deploy Task 4**: Document credentials securely
  - **Store in**: Password manager
  - **Create**: Local .env file from template
  - **Status**: ✅ COMPLETE (2025-09-12)

- [x] **Deploy Task 5**: Run smoke test
  - **Execute**: Verified via phpMyAdmin queries
  - **Verify**: All tables created correctly, 8 teams inserted
  - **Status**: ✅ COMPLETE (2025-09-12)

---

## 📁 Files

### SQL Schema to Execute
```sql
-- Create database (if not using UI)
CREATE DATABASE IF NOT EXISTS u790502142_fixtures;
USE u790502142_fixtures;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Teams table (for our teams only)
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    age_group VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Scrape logs for monitoring
CREATE TABLE scrape_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scrape_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fixtures_found INT DEFAULT 0,
    fixtures_updated INT DEFAULT 0,
    fixtures_new INT DEFAULT 0,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    raw_response TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert our teams
INSERT INTO teams (team_name, age_group, active) VALUES
('Urmston Town U10s', 'U10', TRUE),
('Urmston Town U11s', 'U11', TRUE),
('Urmston Town U12s', 'U12', TRUE),
('Urmston Town U13s', 'U13', TRUE),
('Urmston Town U14s', 'U14', TRUE),
('Urmston Town U15s', 'U15', TRUE),
('Urmston Town U16s', 'U16', TRUE);
```

---

## 🧪 Smoke Test

### Test Procedure
1. After tables are created, run this test query:

```sql
-- Insert test fixture
INSERT INTO fixtures (
    fixture_date, 
    home_team, 
    away_team, 
    venue, 
    competition,
    status
) VALUES (
    '2025-01-15 10:30:00',
    'Urmston Town U10s',
    'Test Team FC',
    'Abbotsfield Park',
    'Test Competition',
    'upcoming'
);

-- Verify insertion
SELECT * FROM fixtures WHERE home_team = 'Urmston Town U10s';

-- Check teams table
SELECT * FROM teams;

-- Clean up test data
DELETE FROM fixtures WHERE away_team = 'Test Team FC';
```

### Expected Results
- ✅ Test fixture inserts successfully
- ✅ All 7 teams present in teams table
- ✅ Timestamp fields auto-populate
- ✅ Test data can be deleted

---

## 🎯 Acceptance Criteria

| Criteria | Status | Notes |
|----------|--------|-------|
| Database created with correct name | ✅ | `u790502142_fixtures` |
| All 3 tables created successfully | ✅ | fixtures, teams, scrape_logs |
| Unique constraints working | ✅ | Schema includes UNIQUE KEY |
| Teams data populated | ✅ | 8 teams inserted (U9s-U16s) |
| Credentials documented securely | ✅ | In HOSTINGER_DB_CREDENTIALS.md |

---

## 🔐 Security Notes

### Credentials Storage
- **DO NOT** commit credentials to Git
- **DO NOT** store in plain text files
- **DO** use password manager
- **DO** document in `.env.example` format

### Example .env Format
```env
# Save as /fixtures-scraper/hostinger/.env.example
DB_HOST=localhost
DB_NAME=u790502142_fixtures
DB_USER=u790502142_XXXXX
DB_PASS=XXXXXXXXXXXXX
```

---

## 📝 Notes

### Database Configuration
- **Character Set**: utf8mb4 (supports emojis)
- **Engine**: InnoDB (for foreign keys if needed later)
- **Timestamps**: Auto-managed by MySQL
- **Unique Constraint**: Prevents duplicate fixtures

### Future Considerations
- May need to add indexes for performance
- Could add foreign keys between fixtures and teams
- Might want match_id from FA Full-Time

---

## ✅ Definition of Done

### Development Complete ✅
- [x] SQL schema file created (`schema.sql`)
- [x] Setup instructions documented (`setup-instructions.md`)
- [x] Test queries prepared (`test-queries.sql`)
- [x] Environment template created (`.env.example`)
- [x] README.md updated with file locations

### Deployment Complete ✅
- [x] Database and user created in Hostinger
- [x] All 3 tables created with correct schema
- [x] Teams data populated (8 teams)
- [x] Smoke test passed
- [x] Credentials stored securely
- [x] Local .env file created from template
- [x] .gitignore updated to exclude .env files
- [x] Story deployment documented

---

## 🔗 Related Links

- [Story 1: FA Widget Setup](./STORY_01_FA_WIDGET_SETUP.md)
- [Story 3: PHP Ingestion Endpoint](./STORY_03_PHP_INGESTION.md)
- [Main PRD](/Users/leehayton/ai-apps/urmston-town/docs/FIXTURES_SCRAPING_PRD.md)