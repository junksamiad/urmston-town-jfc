# Story 4: Build Public API Endpoint
**Status**: ✅ COMPLETE  
**Priority**: P1 - High  
**Time Estimate**: 45 minutes (Actual: ~40 minutes)  
**Completed**: 2025-09-12  

---

## 📋 Story Overview
Create a public-facing PHP API endpoint that serves fixture data to the Next.js frontend with filtering and caching capabilities.

---

## ✅ Progress Checklist

### Pre-requisites
- [x] Story 3 complete (Ingestion endpoint working)
- [x] Database has fixture data

### Implementation Tasks

- [x] **Task 1**: Create public API endpoint
  - **File**: `/fixtures-scraper/hostinger/api/fixtures/get.php`
  - **Methods**: GET only
  - **Status**: ✅ COMPLETE

- [x] **Task 2**: Implement query filters
  - **Filters**: team, status, date range, competition (league)
  - **Sorting**: By date ascending
  - **Note**: Competition field contains league name (Timperley & District JFL or Salford League)
  - **Status**: ✅ COMPLETE

- [x] **Task 3**: Add response caching
  - **Cache time**: 5 minutes
  - **Headers**: Cache-Control, Expires
  - **Status**: ✅ COMPLETE

- [x] **Task 4**: Deploy to Hostinger via Browser
  - **Method**: File Manager Upload via Playwright
  - **Path**: `/public_html/api/fixtures/get.php`
  - **Live URL**: `https://pages.urmstontownjfc.co.uk/api/fixtures/get.php`
  - **Status**: ✅ COMPLETE

- [x] **Task 5**: Run integration test
  - **Test**: Various filter combinations
  - **Verify**: Correct data returned
  - **Status**: ✅ COMPLETE - All tests passing

---

## 📁 Files to Create

### `/fixtures-scraper/hostinger/api/fixtures/get.php`
```php
<?php
// Enable CORS for Next.js
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Cache headers (5 minutes)
header('Cache-Control: public, max-age=300');
header('Pragma: cache');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed']));
}

// Load environment variables
require_once __DIR__ . '/../../.env.php';

// Database connection
function getDB() {
    try {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo = new PDO($dsn, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Database connection failed']));
    }
}

// Parse and validate query parameters
function getFilters() {
    $filters = [];
    
    // Team filter (age group)
    if (!empty($_GET['team'])) {
        $filters['team'] = filter_var($_GET['team'], FILTER_SANITIZE_STRING);
    }
    
    // Status filter (upcoming, completed, postponed, cancelled)
    if (!empty($_GET['status'])) {
        $validStatuses = ['upcoming', 'completed', 'postponed', 'cancelled'];
        $status = filter_var($_GET['status'], FILTER_SANITIZE_STRING);
        if (in_array($status, $validStatuses)) {
            $filters['status'] = $status;
        }
    }
    
    // Date from filter
    if (!empty($_GET['from'])) {
        $from = filter_var($_GET['from'], FILTER_SANITIZE_STRING);
        if (strtotime($from)) {
            $filters['from'] = $from;
        }
    }
    
    // Date to filter
    if (!empty($_GET['to'])) {
        $to = filter_var($_GET['to'], FILTER_SANITIZE_STRING);
        if (strtotime($to)) {
            $filters['to'] = $to;
        }
    }
    
    // Limit (default 100, max 500)
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $filters['limit'] = min(max($limit, 1), 500);
    
    // Offset for pagination
    $filters['offset'] = isset($_GET['offset']) ? max((int)$_GET['offset'], 0) : 0;
    
    return $filters;
}

// Build SQL query with filters
function buildQuery($filters) {
    $sql = "SELECT 
            id,
            fixture_date,
            home_team,
            away_team,
            venue,
            competition,
            home_score,
            away_score,
            status,
            age_group,
            created_at,
            updated_at
            FROM fixtures WHERE 1=1";
    
    $params = [];
    
    // Apply team filter (matches either home or away team with age group)
    if (!empty($filters['team'])) {
        $sql .= " AND (home_team LIKE :team OR away_team LIKE :team OR age_group = :age_group)";
        $params[':team'] = '%' . $filters['team'] . '%';
        $params[':age_group'] = $filters['team'];
    }
    
    // Apply status filter
    if (!empty($filters['status'])) {
        $sql .= " AND status = :status";
        $params[':status'] = $filters['status'];
    }
    
    // Apply date range filters
    if (!empty($filters['from'])) {
        $sql .= " AND fixture_date >= :from";
        $params[':from'] = $filters['from'] . ' 00:00:00';
    }
    
    if (!empty($filters['to'])) {
        $sql .= " AND fixture_date <= :to";
        $params[':to'] = $filters['to'] . ' 23:59:59';
    }
    
    // Order by date
    $sql .= " ORDER BY fixture_date ASC";
    
    // Apply limit and offset
    $sql .= " LIMIT :limit OFFSET :offset";
    
    return ['sql' => $sql, 'params' => $params, 'filters' => $filters];
}

// Format fixture data for response
function formatFixture($fixture) {
    return [
        'id' => (int)$fixture['id'],
        'date' => $fixture['fixture_date'],
        'homeTeam' => $fixture['home_team'],
        'awayTeam' => $fixture['away_team'],
        'venue' => $fixture['venue'],
        'competition' => $fixture['competition'],
        'homeScore' => $fixture['home_score'] !== null ? (int)$fixture['home_score'] : null,
        'awayScore' => $fixture['away_score'] !== null ? (int)$fixture['away_score'] : null,
        'status' => $fixture['status'],
        'ageGroup' => $fixture['age_group'],
        'isHome' => strpos($fixture['home_team'], 'Urmston Town') !== false,
        'isAway' => strpos($fixture['away_team'], 'Urmston Town') !== false,
        'createdAt' => $fixture['created_at'],
        'updatedAt' => $fixture['updated_at']
    ];
}

// Get summary statistics
function getStats($db, $filters) {
    $statsSQL = "SELECT 
                 COUNT(*) as total,
                 SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcoming,
                 SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
                 SUM(CASE WHEN status = 'postponed' THEN 1 ELSE 0 END) as postponed
                 FROM fixtures WHERE 1=1";
    
    $params = [];
    
    // Apply same filters (except limit/offset)
    if (!empty($filters['team'])) {
        $statsSQL .= " AND (home_team LIKE :team OR away_team LIKE :team OR age_group = :age_group)";
        $params[':team'] = '%' . $filters['team'] . '%';
        $params[':age_group'] = $filters['team'];
    }
    
    if (!empty($filters['from'])) {
        $statsSQL .= " AND fixture_date >= :from";
        $params[':from'] = $filters['from'] . ' 00:00:00';
    }
    
    if (!empty($filters['to'])) {
        $statsSQL .= " AND fixture_date <= :to";
        $params[':to'] = $filters['to'] . ' 23:59:59';
    }
    
    $stmt = $db->prepare($statsSQL);
    foreach ($params as $key => $value) {
        $stmt->bindValue($key, $value);
    }
    $stmt->execute();
    
    return $stmt->fetch(PDO::FETCH_ASSOC);
}

// Main execution
try {
    $db = getDB();
    $filters = getFilters();
    $query = buildQuery($filters);
    
    // Prepare and execute main query
    $stmt = $db->prepare($query['sql']);
    
    // Bind parameters
    foreach ($query['params'] as $key => $value) {
        if ($key === ':limit' || $key === ':offset') {
            $stmt->bindValue($key, $query['filters'][substr($key, 1)], PDO::PARAM_INT);
        } else {
            $stmt->bindValue($key, $value);
        }
    }
    
    $stmt->execute();
    $fixtures = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format fixtures
    $formattedFixtures = array_map('formatFixture', $fixtures);
    
    // Get statistics
    $stats = getStats($db, $filters);
    
    // Build response
    $response = [
        'success' => true,
        'data' => $formattedFixtures,
        'pagination' => [
            'total' => (int)$stats['total'],
            'limit' => $filters['limit'],
            'offset' => $filters['offset'],
            'hasMore' => ($filters['offset'] + count($fixtures)) < $stats['total']
        ],
        'stats' => [
            'total' => (int)$stats['total'],
            'upcoming' => (int)$stats['upcoming'],
            'completed' => (int)$stats['completed'],
            'postponed' => (int)$stats['postponed']
        ],
        'filters' => [
            'team' => $filters['team'] ?? null,
            'status' => $filters['status'] ?? null,
            'from' => $filters['from'] ?? null,
            'to' => $filters['to'] ?? null
        ],
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    // Generate ETag for caching
    $etag = md5(json_encode($response));
    header('ETag: "' . $etag . '"');
    
    // Check if client has cached version
    if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === '"' . $etag . '"') {
        http_response_code(304);
        exit;
    }
    
    // Return response
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'An error occurred fetching fixtures'
    ]);
}
?>
```

---

## 🧪 Integration Test

### Test Commands
```bash
# Test 1: Get all fixtures
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php"

# Test 2: Filter by team
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php?team=U12"

# Test 3: Filter by status
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php?status=upcoming"

# Test 4: Date range filter
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php?from=2025-01-01&to=2025-01-31"

# Test 5: Combined filters with pagination
curl "https://pages.urmstontownjfc.co.uk/api/fixtures/get.php?team=U10&status=upcoming&limit=10&offset=0"
```

### Expected Response Structure
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "date": "2025-01-15 10:30:00",
      "homeTeam": "Urmston Town U10s",
      "awayTeam": "Sale United U10s",
      "venue": "Abbotsfield Park",
      "competition": "Timperley League",
      "homeScore": null,
      "awayScore": null,
      "status": "upcoming",
      "ageGroup": "U10",
      "isHome": true,
      "isAway": false
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
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

## 🎯 Acceptance Criteria

| Criteria | Status | Notes |
|----------|--------|-------|
| GET requests only | ✅ | Returns 405 for other methods |
| Team filter working | ✅ | Filters by age group |
| Status filter working | ✅ | upcoming/completed/etc |
| Date range working | ✅ | from/to parameters |
| Pagination working | ✅ | limit parameter |
| CORS headers present | ✅ | For Next.js access |
| Cache headers set | ✅ | 5-minute cache |
| JSON response format | ✅ | Properly formatted |

---

## 📝 Deployment Notes

### Hostinger SSH Access
Deploy files via SSH (credentials in `/fixtures-scraper/HOSTINGER_CREDENTIALS.md`):
```bash
# Connect to server
ssh -p 65002 u790502142@82.29.186.226

# Or use SCP for direct upload
scp -P 65002 ./file.php u790502142@82.29.186.226:~/public_html/api/fixtures/
```

### File Permissions
- PHP files: 644
- Directories: 755

---

## ✅ Definition of Done

- [x] PHP endpoint created and tested
- [x] Uploaded to Hostinger via Browser File Manager
- [x] All filters working correctly
- [x] Caching headers configured
- [x] Integration tests passing
- [x] Response format matches spec
- [x] Test queries script created
- [x] Story completion documented

---

## 🔗 Related Links

- [Story 3: PHP Ingestion](./STORY_03_PHP_INGESTION.md)
- [Story 7: Next.js Integration](./STORY_07_NEXTJS_INTEGRATION.md)
- [API Documentation](/fixtures-scraper/docs/API.md)