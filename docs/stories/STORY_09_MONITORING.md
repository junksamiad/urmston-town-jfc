# Story 9: Monitoring & Alerts
**Status**: ⏳ Pending  
**Priority**: P2 - Medium  
**Time Estimate**: 30 minutes  

---

## 📋 Story Overview
Set up monitoring and alerting to ensure the fixture scraping system remains operational and notify of any failures.

---

## ✅ Progress Checklist

### Pre-requisites
- [ ] Story 8 complete (E2E tests passing)
- [ ] System in production

### Implementation Tasks

- [ ] **Task 1**: Configure AWS Lambda CloudWatch alarms
  - **Email**: On function failure/timeout
  - **Method**: SNS + CloudWatch alarms
  - **Status**: ⏳ PENDING

- [ ] **Task 2**: Create monitoring dashboard
  - **File**: `/fixtures-scraper/hostinger/monitor.php`
  - **Deploy via**: `scp -P 65002 monitor.php u790502142@82.29.186.226:~/public_html/`
  - **Shows**: System health status
  - **Status**: ⏳ PENDING

- [ ] **Task 3**: Implement health check endpoint
  - **File**: `/api/fixtures/health.php`
  - **Returns**: System status JSON
  - **Status**: ⏳ PENDING

- [ ] **Task 4**: Set up external monitoring
  - **Service**: UptimeRobot (free tier)
  - **Monitors**: Widget, API, Frontend
  - **Status**: ⏳ PENDING

- [ ] **Task 5**: Run smoke test
  - **Test**: All monitoring working
  - **Verify**: Alerts trigger correctly
  - **Status**: ⏳ PENDING

---

## 📁 Files to Create

### `/fixtures-scraper/hostinger/api/fixtures/health.php`
```php
<?php
// Health check endpoint for monitoring
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Load environment
require_once __DIR__ . '/../../.env.php';

// Check components
$health = [
    'status' => 'healthy',
    'timestamp' => date('Y-m-d H:i:s'),
    'checks' => []
];

// Check 1: Database connection
try {
    $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
    $pdo = new PDO($dsn, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Test query
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM fixtures");
    $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    $health['checks']['database'] = [
        'status' => 'healthy',
        'fixtures_count' => $count
    ];
} catch (Exception $e) {
    $health['status'] = 'unhealthy';
    $health['checks']['database'] = [
        'status' => 'unhealthy',
        'error' => 'Connection failed'
    ];
}

// Check 2: Last scrape time
try {
    $stmt = $pdo->query("
        SELECT 
            MAX(scrape_time) as last_scrape,
            TIMESTAMPDIFF(HOUR, MAX(scrape_time), NOW()) as hours_ago
        FROM scrape_logs 
        WHERE success = 1
    ");
    $lastScrape = $stmt->fetch(PDO::FETCH_ASSOC);
    
    $isStale = $lastScrape['hours_ago'] > 24;
    
    $health['checks']['scraper'] = [
        'status' => $isStale ? 'warning' : 'healthy',
        'last_success' => $lastScrape['last_scrape'],
        'hours_ago' => $lastScrape['hours_ago']
    ];
    
    if ($isStale) {
        $health['status'] = 'warning';
    }
} catch (Exception $e) {
    $health['checks']['scraper'] = [
        'status' => 'unknown',
        'error' => 'Could not check'
    ];
}

// Check 3: API endpoint
try {
    // Check if get.php exists
    $apiFile = __DIR__ . '/get.php';
    if (file_exists($apiFile)) {
        $health['checks']['api'] = [
            'status' => 'healthy',
            'endpoint' => 'available'
        ];
    } else {
        $health['status'] = 'unhealthy';
        $health['checks']['api'] = [
            'status' => 'unhealthy',
            'error' => 'Endpoint missing'
        ];
    }
} catch (Exception $e) {
    $health['checks']['api'] = [
        'status' => 'unknown'
    ];
}

// Check 4: Recent fixtures
try {
    $stmt = $pdo->query("
        SELECT COUNT(*) as upcoming
        FROM fixtures
        WHERE fixture_date > NOW()
        AND status = 'upcoming'
    ");
    $upcoming = $stmt->fetch(PDO::FETCH_ASSOC)['upcoming'];
    
    $health['checks']['fixtures'] = [
        'status' => $upcoming > 0 ? 'healthy' : 'warning',
        'upcoming_count' => $upcoming
    ];
} catch (Exception $e) {
    $health['checks']['fixtures'] = [
        'status' => 'unknown'
    ];
}

// Set HTTP status code
if ($health['status'] === 'unhealthy') {
    http_response_code(503);
} elseif ($health['status'] === 'warning') {
    http_response_code(200);
} else {
    http_response_code(200);
}

// Return health status
echo json_encode($health, JSON_PRETTY_PRINT);
?>
```

### `/fixtures-scraper/hostinger/monitor.php`
```php
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fixture System Monitor - Urmston Town</title>
    <meta http-equiv="refresh" content="60">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            color: #244cbc;
            border-bottom: 3px solid #244cbc;
            padding-bottom: 10px;
        }
        .status-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .status-card {
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-card h3 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-healthy { background: #4CAF50; }
        .status-warning { background: #FF9800; }
        .status-unhealthy { background: #F44336; }
        .metric {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
        }
        .metric:last-child {
            border-bottom: none;
        }
        .metric-label {
            color: #666;
        }
        .metric-value {
            font-weight: bold;
        }
        .refresh-notice {
            text-align: center;
            color: #666;
            margin-top: 20px;
            font-size: 14px;
        }
        .logs-section {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }
        .log-entry {
            padding: 10px;
            margin: 5px 0;
            border-left: 4px solid #244cbc;
            background: #f9f9f9;
        }
        .log-success {
            border-left-color: #4CAF50;
        }
        .log-failure {
            border-left-color: #F44336;
        }
    </style>
</head>
<body>
    <h1>🔍 Fixture System Monitor</h1>
    
    <div id="health-status">Loading...</div>
    
    <div class="refresh-notice">
        Auto-refreshes every 60 seconds | Last check: <span id="last-check"></span>
    </div>

    <script>
        async function checkHealth() {
            const lastCheck = document.getElementById('last-check');
            lastCheck.textContent = new Date().toLocaleTimeString();
            
            try {
                const response = await fetch('/api/fixtures/health.php');
                const health = await response.json();
                
                displayHealth(health);
            } catch (error) {
                displayError(error);
            }
        }
        
        function displayHealth(health) {
            const container = document.getElementById('health-status');
            
            const statusClass = `status-${health.status}`;
            const statusIcon = health.status === 'healthy' ? '✅' : 
                             health.status === 'warning' ? '⚠️' : '❌';
            
            let html = `
                <div class="status-grid">
                    <div class="status-card">
                        <h3>
                            <span class="status-indicator ${statusClass}"></span>
                            Overall Status
                        </h3>
                        <div class="metric">
                            <span class="metric-label">Status:</span>
                            <span class="metric-value">${statusIcon} ${health.status.toUpperCase()}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Checked:</span>
                            <span class="metric-value">${health.timestamp}</span>
                        </div>
                    </div>
            `;
            
            // Database status
            if (health.checks.database) {
                const db = health.checks.database;
                html += `
                    <div class="status-card">
                        <h3>
                            <span class="status-indicator status-${db.status}"></span>
                            Database
                        </h3>
                        <div class="metric">
                            <span class="metric-label">Status:</span>
                            <span class="metric-value">${db.status}</span>
                        </div>
                        ${db.fixtures_count !== undefined ? `
                        <div class="metric">
                            <span class="metric-label">Total Fixtures:</span>
                            <span class="metric-value">${db.fixtures_count}</span>
                        </div>
                        ` : ''}
                    </div>
                `;
            }
            
            // Scraper status
            if (health.checks.scraper) {
                const scraper = health.checks.scraper;
                html += `
                    <div class="status-card">
                        <h3>
                            <span class="status-indicator status-${scraper.status}"></span>
                            Scraper
                        </h3>
                        <div class="metric">
                            <span class="metric-label">Last Success:</span>
                            <span class="metric-value">${scraper.last_success || 'Never'}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">Hours Ago:</span>
                            <span class="metric-value">${scraper.hours_ago || 'N/A'}</span>
                        </div>
                    </div>
                `;
            }
            
            // Fixtures status
            if (health.checks.fixtures) {
                const fixtures = health.checks.fixtures;
                html += `
                    <div class="status-card">
                        <h3>
                            <span class="status-indicator status-${fixtures.status}"></span>
                            Fixtures
                        </h3>
                        <div class="metric">
                            <span class="metric-label">Upcoming:</span>
                            <span class="metric-value">${fixtures.upcoming_count}</span>
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
            
            // Recent logs
            html += await fetchRecentLogs();
            
            container.innerHTML = html;
        }
        
        function displayError(error) {
            const container = document.getElementById('health-status');
            container.innerHTML = `
                <div class="status-card">
                    <h3>❌ Error</h3>
                    <p>Could not fetch health status: ${error.message}</p>
                </div>
            `;
        }
        
        async function fetchRecentLogs() {
            // This would fetch from a logs endpoint
            // For now, returning placeholder
            return `
                <div class="logs-section">
                    <h3>Recent Scrape Activity</h3>
                    <div class="log-entry log-success">
                        <strong>Success</strong> - ${new Date().toLocaleDateString()} 15:00
                        <br>Found: 25 | New: 2 | Updated: 23
                    </div>
                    <div class="log-entry log-success">
                        <strong>Success</strong> - ${new Date().toLocaleDateString()} 09:00
                        <br>Found: 25 | New: 0 | Updated: 25
                    </div>
                </div>
            `;
        }
        
        // Check health on load and every 60 seconds
        checkHealth();
        setInterval(checkHealth, 60000);
    </script>
</body>
</html>
```

### AWS Lambda CloudWatch Alarms

```bash
# Create SNS topic for alerts
aws sns create-topic \
  --name urmston-fixtures-alerts \
  --region eu-north-1 \
  --profile footballclub

# Subscribe email to topic
aws sns subscribe \
  --topic-arn arn:aws:sns:eu-north-1:650251723700:urmston-fixtures-alerts \
  --protocol email \
  --notification-endpoint junksamiad@gmail.com \
  --region eu-north-1 \
  --profile footballclub

# Create CloudWatch alarm for function errors
aws cloudwatch put-metric-alarm \
  --alarm-name "urmston-fixtures-errors" \
  --alarm-description "Alert on Lambda function errors" \
  --metric-name Errors \
  --namespace AWS/Lambda \
  --statistic Sum \
  --period 300 \
  --threshold 1 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=urmston-fixtures-scraper \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:eu-north-1:650251723700:urmston-fixtures-alerts \
  --region eu-north-1 \
  --profile footballclub

# Create alarm for function duration (timeout)
aws cloudwatch put-metric-alarm \
  --alarm-name "urmston-fixtures-timeout" \
  --alarm-description "Alert on Lambda function timeouts" \
  --metric-name Duration \
  --namespace AWS/Lambda \
  --statistic Average \
  --period 300 \
  --threshold 100000 \
  --comparison-operator GreaterThanThreshold \
  --dimensions Name=FunctionName,Value=urmston-fixtures-scraper \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:eu-north-1:650251723700:urmston-fixtures-alerts \
  --region eu-north-1 \
  --profile footballclub
```

---

## 🧪 Smoke Test

### Test Commands
```bash
# Test health endpoint
curl https://pages.urmstontownjfc.co.uk/api/fixtures/health.php | jq '.'

# Expected response
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
    },
    "api": {
      "status": "healthy",
      "endpoint": "available"
    },
    "fixtures": {
      "status": "healthy",
      "upcoming_count": 12
    }
  }
}
```

### Test Monitoring Page
1. Visit: `https://pages.urmstontownjfc.co.uk/monitor.php`
2. Verify all status cards show
3. Check auto-refresh works
4. Simulate failure by blocking database

---

## 📊 External Monitoring Setup

### UptimeRobot Configuration (Free)
1. Sign up at https://uptimerobot.com
2. Add monitors:

**Monitor 1: Health Check**
- Type: HTTP(s)
- URL: `https://pages.urmstontownjfc.co.uk/api/fixtures/health.php`
- Interval: 5 minutes
- Alert: Email when down

**Monitor 2: FA Widget**
- Type: HTTP(s)
- URL: `https://pages.urmstontownjfc.co.uk/fa-widget.html`
- Interval: 30 minutes
- Alert: Email when down

**Monitor 3: Public API**
- Type: HTTP(s)
- URL: `https://pages.urmstontownjfc.co.uk/api/fixtures/get.php`
- Interval: 15 minutes
- Alert: Email when down

---

## 🎯 Acceptance Criteria

| Criteria | Status | Notes |
|----------|--------|-------|
| Health endpoint working | ⏳ | Returns JSON status |
| Monitor page displays | ⏳ | Shows all checks |
| CloudWatch alarms | ⏳ | On function errors |
| External monitoring | ⏳ | UptimeRobot configured |
| Auto-refresh works | ⏳ | Every 60 seconds |
| Alerts trigger | ⏳ | Within 5 minutes |

---

## 📈 Monitoring Metrics

### Key Indicators
- **Scrape Success Rate**: Should be >95%
- **Data Freshness**: <24 hours old
- **API Response Time**: <500ms
- **Uptime**: >99%

### Alert Thresholds
- No successful scrape in 24 hours
- Database connection failures
- API response time >2 seconds
- More than 2 consecutive scrape failures

---

## ✅ Definition of Done

- [ ] Health endpoint deployed via SSH
- [ ] Monitor page accessible
- [ ] CloudWatch alarms configured
- [ ] External monitoring active
- [ ] Alert testing complete
- [ ] Documentation updated
- [ ] README includes monitoring info
- [ ] HOSTINGER_CREDENTIALS.md updated with monitoring URLs
- [ ] Story completion documented in DEVELOPMENT_STORIES.md

---

## 🔗 Related Links

- [Story 8: E2E Testing](./STORY_08_E2E_TESTING.md)
- [Story 10: Documentation](./STORY_10_DOCUMENTATION.md)
- [UptimeRobot](https://uptimerobot.com)