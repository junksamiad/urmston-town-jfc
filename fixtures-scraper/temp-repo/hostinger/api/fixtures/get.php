<?php
// Enable error reporting for debugging (disable in production)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// Set JSON content type
header('Content-Type: application/json');

// CORS headers for Next.js
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Cache headers (5 minutes)
header('Cache-Control: public, max-age=300');
header('Expires: ' . gmdate('D, d M Y H:i:s', time() + 300) . ' GMT');

// Handle OPTIONS request for CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    die(json_encode(['error' => 'Method not allowed. Use GET.']));
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

// Parse and validate date parameter
function parseDate($dateString) {
    if (empty($dateString)) {
        return null;
    }
    $date = DateTime::createFromFormat('Y-m-d', $dateString);
    if (!$date) {
        return null;
    }
    return $date->format('Y-m-d');
}

// Extract age group from team name
function extractAgeGroup($teamName) {
    if (preg_match('/U(\d+)s?/i', $teamName, $matches)) {
        return 'U' . $matches[1];
    }
    return null;
}

// Main query function
function getFixtures($params) {
    $db = getDB();
    
    // Build base query
    $sql = "SELECT 
            f.id,
            f.fixture_date,
            f.home_team,
            f.away_team,
            f.venue,
            f.competition,
            f.home_score,
            f.away_score,
            f.status,
            f.age_group,
            f.created_at,
            f.updated_at
        FROM fixtures f
        WHERE 1=1";
    
    $bindings = [];
    
    // Add team filter (matches either home or away team)
    if (!empty($params['team'])) {
        $teamFilter = $params['team'];
        // Handle both formats: "U10" or "U10s"
        if (!str_ends_with($teamFilter, 's')) {
            $teamFilter .= 's';
        }
        $sql .= " AND (f.home_team LIKE :team1 OR f.away_team LIKE :team2 OR f.age_group = :age_group)";
        $bindings[':team1'] = '%' . $teamFilter . '%';
        $bindings[':team2'] = '%' . $teamFilter . '%';
        $bindings[':age_group'] = str_replace('s', '', $teamFilter);
    }
    
    // Add status filter
    if (!empty($params['status'])) {
        $validStatuses = ['upcoming', 'completed', 'postponed', 'cancelled'];
        if (in_array($params['status'], $validStatuses)) {
            $sql .= " AND f.status = :status";
            $bindings[':status'] = $params['status'];
        }
    }
    
    // Add date range filters
    if (!empty($params['from'])) {
        $fromDate = parseDate($params['from']);
        if ($fromDate) {
            $sql .= " AND DATE(f.fixture_date) >= :from_date";
            $bindings[':from_date'] = $fromDate;
        }
    }
    
    if (!empty($params['to'])) {
        $toDate = parseDate($params['to']);
        if ($toDate) {
            $sql .= " AND DATE(f.fixture_date) <= :to_date";
            $bindings[':to_date'] = $toDate;
        }
    }
    
    // Add competition filter
    if (!empty($params['competition'])) {
        $sql .= " AND f.competition LIKE :competition";
        $bindings[':competition'] = '%' . $params['competition'] . '%';
    }
    
    // Add sorting
    $sql .= " ORDER BY f.fixture_date ASC, f.home_team ASC";
    
    // Add limit if specified
    if (!empty($params['limit']) && is_numeric($params['limit'])) {
        $limit = min(100, intval($params['limit'])); // Max 100 results
        $sql .= " LIMIT " . $limit;
    } else {
        $sql .= " LIMIT 50"; // Default limit
    }
    
    // Execute query
    try {
        $stmt = $db->prepare($sql);
        $stmt->execute($bindings);
        $fixtures = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process fixtures to ensure consistent format
        foreach ($fixtures as &$fixture) {
            // Convert date to ISO format
            $fixture['fixture_date'] = date('c', strtotime($fixture['fixture_date']));
            
            // Ensure scores are integers or null
            $fixture['home_score'] = $fixture['home_score'] !== null ? intval($fixture['home_score']) : null;
            $fixture['away_score'] = $fixture['away_score'] !== null ? intval($fixture['away_score']) : null;
            
            // Extract age group if not set
            if (empty($fixture['age_group'])) {
                $homeAgeGroup = extractAgeGroup($fixture['home_team']);
                $awayAgeGroup = extractAgeGroup($fixture['away_team']);
                
                // Use home team's age group if it's Urmston Town
                if (stripos($fixture['home_team'], 'Urmston') !== false && $homeAgeGroup) {
                    $fixture['age_group'] = $homeAgeGroup;
                } elseif (stripos($fixture['away_team'], 'Urmston') !== false && $awayAgeGroup) {
                    $fixture['age_group'] = $awayAgeGroup;
                }
            }
            
            // Determine if this is a home or away game for Urmston Town
            $fixture['is_home'] = stripos($fixture['home_team'], 'Urmston') !== false;
            
            // Add formatted date for display
            $fixture['formatted_date'] = date('D, j M Y', strtotime($fixture['fixture_date']));
            $fixture['formatted_time'] = date('H:i', strtotime($fixture['fixture_date']));
        }
        
        return $fixtures;
        
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['error' => 'Query execution failed']));
    }
}

// Get summary statistics
function getStats() {
    $db = getDB();
    
    try {
        // Get counts by status
        $statusSql = "SELECT status, COUNT(*) as count FROM fixtures GROUP BY status";
        $statusStmt = $db->query($statusSql);
        $statusCounts = $statusStmt->fetchAll(PDO::FETCH_KEY_PAIR);
        
        // Get counts by team
        $teamSql = "SELECT t.age_group, COUNT(DISTINCT f.id) as fixture_count
                    FROM teams t
                    LEFT JOIN fixtures f ON (
                        f.home_team LIKE CONCAT('%', t.team_name, '%') OR 
                        f.away_team LIKE CONCAT('%', t.team_name, '%')
                    )
                    WHERE t.active = TRUE
                    GROUP BY t.age_group
                    ORDER BY t.age_group";
        $teamStmt = $db->query($teamSql);
        $teamCounts = $teamStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Get last update time
        $lastUpdateSql = "SELECT MAX(updated_at) as last_update FROM fixtures";
        $lastUpdateStmt = $db->query($lastUpdateSql);
        $lastUpdate = $lastUpdateStmt->fetchColumn();
        
        return [
            'by_status' => $statusCounts,
            'by_team' => $teamCounts,
            'last_update' => $lastUpdate,
            'total_fixtures' => array_sum($statusCounts)
        ];
        
    } catch (PDOException $e) {
        return [
            'error' => 'Failed to get statistics'
        ];
    }
}

// Main execution
try {
    // Parse query parameters
    $params = $_GET;
    
    // Check if stats are requested
    if (isset($params['stats']) && $params['stats'] === 'true') {
        $response = [
            'success' => true,
            'stats' => getStats(),
            'timestamp' => date('c')
        ];
    } else {
        // Get fixtures
        $fixtures = getFixtures($params);
        
        $response = [
            'success' => true,
            'fixtures' => $fixtures,
            'count' => count($fixtures),
            'filters' => [
                'team' => $params['team'] ?? null,
                'status' => $params['status'] ?? null,
                'from' => $params['from'] ?? null,
                'to' => $params['to'] ?? null,
                'competition' => $params['competition'] ?? null
            ],
            'timestamp' => date('c')
        ];
    }
    
    // Output response
    echo json_encode($response, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'An unexpected error occurred',
        'timestamp' => date('c')
    ]);
}
?>