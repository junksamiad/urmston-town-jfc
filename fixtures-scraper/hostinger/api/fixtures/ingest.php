<?php
// Enable error reporting for debugging (disable in production)
ini_set('display_errors', 0);
error_reporting(E_ALL);

// CORS headers (for testing)
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Authorization, Content-Type');

// Handle OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Load environment variables
require_once __DIR__ . '/../../.env.php';

// Authentication
function authenticate() {
    $headers = getallheaders();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
    
    if (empty($authHeader)) {
        http_response_code(401);
        die(json_encode(['error' => 'No authorization header']));
    }
    
    $token = str_replace('Bearer ', '', $authHeader);
    
    if ($token !== API_AUTH_TOKEN) {
        http_response_code(403);
        die(json_encode(['error' => 'Invalid token']));
    }
    
    return true;
}

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

// Main ingestion logic
function ingestFixtures($data) {
    $db = getDB();

    $stats = [
        'fixtures_found' => 0,
        'fixtures_inserted' => 0,
        'fixtures_deleted' => 0,
        'errors' => []
    ];

    // Start transaction
    $db->beginTransaction();

    try {
        // DELETE ALL FIXTURES FIRST (clean slate approach)
        $deleteSql = "DELETE FROM fixtures";
        $deleteStmt = $db->prepare($deleteSql);
        $deleteStmt->execute();
        $stats['fixtures_deleted'] = $deleteStmt->rowCount();

        // Process each fixture (simple INSERT only)
        foreach ($data['fixtures'] as $fixture) {
            $stats['fixtures_found']++;

            // Validate required fields
            if (empty($fixture['date']) || empty($fixture['home_team']) || empty($fixture['away_team'])) {
                $stats['errors'][] = 'Invalid fixture data';
                continue;
            }

            // Insert fixture (no need to check if exists since we deleted all)
            $insertSql = "INSERT INTO fixtures
                         (fixture_date, home_team, away_team, venue, competition,
                          home_score, away_score, status, age_group, raw_data)
                         VALUES
                         (:date, :home, :away, :venue, :competition,
                          :home_score, :away_score, :status, :age_group, :raw_data)";

            $insertStmt = $db->prepare($insertSql);
            $insertStmt->execute([
                ':date' => $fixture['date'],
                ':home' => $fixture['home_team'],
                ':away' => $fixture['away_team'],
                ':venue' => $fixture['venue'] ?? null,
                ':competition' => $fixture['league'] ?? $fixture['competition'] ?? null,
                ':home_score' => $fixture['home_score'] ?? null,
                ':away_score' => $fixture['away_score'] ?? null,
                ':status' => $fixture['status'] ?? 'upcoming',
                ':age_group' => $fixture['age_group'] ?? null,
                ':raw_data' => json_encode($fixture)
            ]);

            $stats['fixtures_inserted']++;
        }
        
        // Log the scrape
        $logSql = "INSERT INTO scrape_logs
                   (fixtures_found, fixtures_updated, fixtures_new, success, raw_response)
                   VALUES
                   (:found, :updated, :new, :success, :raw)";

        $logStmt = $db->prepare($logSql);
        $logStmt->execute([
            ':found' => $stats['fixtures_found'],
            ':updated' => 0,  // No updates in delete-first approach
            ':new' => $stats['fixtures_inserted'],
            ':success' => empty($stats['errors']),
            ':raw' => json_encode($data)
        ]);
        
        // Commit transaction
        $db->commit();
        
        return $stats;
        
    } catch (Exception $e) {
        $db->rollBack();
        throw $e;
    }
}

// Main execution
try {
    // Check method
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        die(json_encode(['error' => 'Method not allowed']));
    }
    
    // Authenticate
    authenticate();
    
    // Get JSON data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        die(json_encode(['error' => 'Invalid JSON']));
    }
    
    // Process fixtures
    $result = ingestFixtures($data);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'stats' => $result,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>