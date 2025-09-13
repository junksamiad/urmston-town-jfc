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
        'fixtures_new' => 0,
        'fixtures_updated' => 0,
        'errors' => []
    ];
    
    // Start transaction
    $db->beginTransaction();
    
    try {
        // Process each fixture
        foreach ($data['fixtures'] as $fixture) {
            $stats['fixtures_found']++;
            
            // Validate required fields
            if (empty($fixture['date']) || empty($fixture['home_team']) || empty($fixture['away_team'])) {
                $stats['errors'][] = 'Invalid fixture data';
                continue;
            }
            
            // Check if fixture exists
            $checkSql = "SELECT id FROM fixtures WHERE 
                         fixture_date = :date AND 
                         home_team = :home AND 
                         away_team = :away";
            
            $checkStmt = $db->prepare($checkSql);
            $checkStmt->execute([
                ':date' => $fixture['date'],
                ':home' => $fixture['home_team'],
                ':away' => $fixture['away_team']
            ]);
            
            $exists = $checkStmt->fetch();
            
            if ($exists) {
                // Update existing fixture
                $updateSql = "UPDATE fixtures SET 
                             venue = :venue,
                             competition = :competition,
                             home_score = :home_score,
                             away_score = :away_score,
                             status = :status,
                             age_group = :age_group,
                             raw_data = :raw_data,
                             updated_at = NOW()
                             WHERE id = :id";
                
                $updateStmt = $db->prepare($updateSql);
                $updateStmt->execute([
                    ':venue' => $fixture['venue'] ?? null,
                    ':competition' => $fixture['competition'] ?? null,
                    ':home_score' => $fixture['home_score'] ?? null,
                    ':away_score' => $fixture['away_score'] ?? null,
                    ':status' => $fixture['status'] ?? 'upcoming',
                    ':age_group' => $fixture['age_group'] ?? null,
                    ':raw_data' => json_encode($fixture),
                    ':id' => $exists['id']
                ]);
                
                $stats['fixtures_updated']++;
            } else {
                // Insert new fixture
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
                    ':competition' => $fixture['competition'] ?? null,
                    ':home_score' => $fixture['home_score'] ?? null,
                    ':away_score' => $fixture['away_score'] ?? null,
                    ':status' => $fixture['status'] ?? 'upcoming',
                    ':age_group' => $fixture['age_group'] ?? null,
                    ':raw_data' => json_encode($fixture)
                ]);
                
                $stats['fixtures_new']++;
            }
        }
        
        // Log the scrape
        $logSql = "INSERT INTO scrape_logs 
                   (fixtures_found, fixtures_updated, fixtures_new, success, raw_response)
                   VALUES 
                   (:found, :updated, :new, :success, :raw)";
        
        $logStmt = $db->prepare($logSql);
        $logStmt->execute([
            ':found' => $stats['fixtures_found'],
            ':updated' => $stats['fixtures_updated'],
            ':new' => $stats['fixtures_new'],
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