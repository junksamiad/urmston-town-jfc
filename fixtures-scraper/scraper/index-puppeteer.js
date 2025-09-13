const puppeteer = require('puppeteer');
const axios = require('axios');
require('dotenv').config();

// Configuration
const CONFIG = {
  widgetUrl: process.env.WIDGET_URL || 'https://junksamiad.github.io/urmston-town-fixtures/',
  apiUrl: process.env.API_URL || 'https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php',
  apiToken: process.env.API_TOKEN,
  isTest: process.argv.includes('--test'),
  timeout: 60000 // Increased timeout for CI environments
};

// League configurations
const LEAGUES = [
  {
    name: 'Timperley & District JFL',
    code: '783655865',
    selector: '#lrep783655865'
  },
  {
    name: 'Salford League',
    code: '84363452',
    selector: '#lrep84363452'
  }
];

// Logging helper
function log(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Parse date from FA Full-Time format
function parseDate(dateStr, timeStr = '') {
  try {
    if (!dateStr || dateStr.trim() === '') {
      return null;
    }

    // Clean the date string
    dateStr = dateStr.trim();

    const year = new Date().getFullYear();
    const months = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
      'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
      'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };

    let day, month, parsedYear = year;
    let hour = '00', minute = '00';

    // Pattern 1: "Sat 15 Jan" or "Sat 15 Jan 2025"
    let match = dateStr.match(/\w{3}\s+(\d{1,2})\s+(\w{3})(?:\s+(\d{4}))?/);
    if (match) {
      day = match[1].padStart(2, '0');
      month = months[match[2]] || '01';
      if (match[3]) parsedYear = match[3];
    }

    // Pattern 2: "15/01/2025" or "15/01"
    if (!day) {
      match = dateStr.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
      if (match) {
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        if (match[3]) {
          parsedYear = match[3].length === 2 ? '20' + match[3] : match[3];
        }
      }
    }

    // Pattern 3: "15-01-2025" or "15-01"
    if (!day) {
      match = dateStr.match(/(\d{1,2})-(\d{1,2})(?:-(\d{2,4}))?/);
      if (match) {
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        if (match[3]) {
          parsedYear = match[3].length === 2 ? '20' + match[3] : match[3];
        }
      }
    }

    // Pattern 4: "15 Jan" or "15 Jan 2025"
    if (!day) {
      match = dateStr.match(/(\d{1,2})\s+(\w{3})(?:\s+(\d{4}))?/);
      if (match) {
        day = match[1].padStart(2, '0');
        month = months[match[2]] || '01';
        if (match[3]) parsedYear = match[3];
      }
    }

    // Pattern 5: "Jan 15" or "Jan 15 2025" (US format)
    if (!day) {
      match = dateStr.match(/(\w{3})\s+(\d{1,2})(?:\s+(\d{4}))?/);
      if (match) {
        month = months[match[1]] || '01';
        day = match[2].padStart(2, '0');
        if (match[3]) parsedYear = match[3];
      }
    }

    if (!day || !month) {
      // If we still don't have a date, log for debugging
      log(`Could not parse date format: "${dateStr}"`);
      return null;
    }

    // Parse time if provided
    if (timeStr && timeStr.trim()) {
      const timeMatch = timeStr.trim().match(/(\d{1,2}):(\d{2})/);
      if (timeMatch) {
        hour = timeMatch[1].padStart(2, '0');
        minute = timeMatch[2].padStart(2, '0');
      }
    }

    // Construct ISO date
    const isoDate = `${parsedYear}-${month}-${day} ${hour}:${minute}:00`;

    // Validate date
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      log(`Invalid date constructed: ${isoDate} from "${dateStr}" "${timeStr}"`);
      return null;
    }

    return isoDate;
  } catch (error) {
    log(`Date parsing error: "${dateStr}" "${timeStr}" - ${error.message}`);
    return null;
  }
}

// Detect Urmston Town age group from team name
function detectAgeGroup(teamName) {
  const ageGroups = ['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16'];

  for (const age of ageGroups) {
    if (teamName.includes(age)) {
      return age;
    }
  }

  return null;
}

// Determine fixture status from score
function determineStatus(homeScore, awayScore) {
  if (homeScore !== null && awayScore !== null) {
    return 'completed';
  }
  return 'upcoming';
}

// Scrape fixtures from a specific league widget
async function scrapeLeagueFixtures(page, league) {
  log(`Extracting fixtures for ${league.name}...`);

  // Check if widget exists
  const widgetExists = await page.$(league.selector);
  if (!widgetExists) {
    log(`Widget not found for ${league.name} (${league.selector})`);
    return [];
  }

  // Wait for table to load within the widget
  try {
    await page.waitForSelector(`${league.selector} table`, {
      timeout: 10000
    });
  } catch (error) {
    log(`No table found for ${league.name} - widget may be empty`);
    return [];
  }

  // Extract fixture data for this league
  const fixtures = await page.evaluate((leagueConfig) => {
    const results = [];

    // Find all tables within this specific widget (there might be multiple)
    const tables = document.querySelectorAll(`${leagueConfig.selector} table`);

    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      let currentDate = null; // Track current date for fixtures

      rows.forEach(row => {
        try {
          // Skip header rows
          if (row.querySelector('th')) return;

          const cells = row.querySelectorAll('td');
          if (cells.length === 0) return;

          const cellTexts = Array.from(cells).map(c => c.textContent.trim());

          // Check if this is a date row (single cell spanning table with date)
          if (cells.length === 1) {
            const dateText = cellTexts[0];
            // Check if it looks like a date (contains day/month patterns)
            if (dateText.match(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) ||
                dateText.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i)) {
              currentDate = dateText;
              console.log(`Found date row: ${currentDate}`);
              return; // Skip to next row
            }
          }

          // Check if this is a fixture row (5 columns expected)
          if (cells.length === 5) {
            const fixture = {
              date: currentDate, // Use current date from date row
              time: null,
              home_team: cellTexts[1], // Column 1: Home team
              away_team: cellTexts[3], // Column 3: Away team
              venue: cellTexts[4], // Column 4: Venue with time info
              league: leagueConfig.name, // League name
              home_score: null,
              away_score: null,
              fixture_type: cellTexts[0] || null, // Column 0: D/L/W or empty
              raw_cells: cellTexts // For debugging
            };

            // Extract time from date row if present (date rows like "Sat 13 Sep 2025 09:30")
            if (currentDate) {
              const dateTimeMatch = currentDate.match(/(\d{1,2}:\d{2})/);
              if (dateTimeMatch) {
                fixture.time = dateTimeMatch[1];
              }
            }

            // Check if we have valid team names and at least one involves Urmston
            if (fixture.home_team && fixture.away_team &&
                (fixture.home_team.toLowerCase().includes('urmston') ||
                 fixture.away_team.toLowerCase().includes('urmston'))) {
              results.push(fixture);
              console.log(`Found Urmston fixture: ${fixture.home_team} v ${fixture.away_team}`);
            }
          }

          // Handle "Postponed" rows or other single-cell status rows
          if (cells.length === 1 && cellTexts[0].toLowerCase().includes('postponed')) {
            // Could mark the last fixture as postponed, but for now we'll skip
            console.log('Found postponed notice');
          }

        } catch (error) {
          console.error('Error parsing row:', error);
        }
      });
    });

    return results;
  }, league);

  log(`Found ${fixtures.length} fixtures for ${league.name}`);

  // Log sample fixtures for debugging
  if (fixtures.length > 0 && CONFIG.isTest) {
    log('Sample fixtures:', fixtures.slice(0, 2));
  }

  return fixtures;
}

// Scrape fixtures from all leagues
async function scrapeFixtures() {
  log('Starting fixture scrape...');

  // Puppeteer launch configuration optimized for CI/CD
  const browserConfig = {
    headless: "new", // Use new headless mode like in Replit
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Overcome limited resource problems
      '--disable-gpu', // Disable GPU hardware acceleration
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ],
    timeout: CONFIG.timeout
  };

  // In GitHub Actions, we might need to use the installed Chrome path
  if (process.env.CHROME_PATH) {
    browserConfig.executablePath = process.env.CHROME_PATH;
    log(`Using Chrome from: ${process.env.CHROME_PATH}`);
  }

  const browser = await puppeteer.launch(browserConfig);

  try {
    const page = await browser.newPage();

    // Set a reasonable viewport
    await page.setViewport({ width: 1280, height: 800 });

    // Enable console logging for debugging
    page.on('console', msg => {
      if (CONFIG.isTest || process.env.DEBUG === 'true') {
        log(`Browser console: ${msg.text()}`);
      }
    });

    // Log page errors
    page.on('pageerror', error => {
      log(`Page error: ${error.message}`);
    });

    // Navigate to widget page
    log(`Navigating to: ${CONFIG.widgetUrl}`);
    await page.goto(CONFIG.widgetUrl, {
      waitUntil: 'domcontentloaded',  // Changed from networkidle0 to domcontentloaded
      timeout: CONFIG.timeout
    });

    // Wait for at least one widget to load
    log('Waiting for widgets to load...');
    try {
      await page.waitForSelector(`${LEAGUES[0].selector}, ${LEAGUES[1].selector}`, {
        timeout: 30000  // 30 seconds for widget to appear
      });
    } catch (selectorError) {
      log(`Failed to find widget selectors: ${selectorError.message}`);
      // Take a screenshot for debugging
      const screenshot = await page.screenshot({ encoding: 'base64' });
      log(`Page content at failure: ${await page.content().then(c => c.substring(0, 500))}`);
      throw selectorError;
    }

    // Additional wait for dynamic content
    log('Waiting for dynamic content to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Scrape fixtures from all leagues
    let allFixtures = [];
    for (const league of LEAGUES) {
      const leagueFixtures = await scrapeLeagueFixtures(page, league);
      allFixtures = allFixtures.concat(leagueFixtures);
    }

    log(`Total fixtures found across all leagues: ${allFixtures.length}`);

    // Transform fixtures for API
    const transformedFixtures = allFixtures.map(fixture => {
      const parsedDate = parseDate(fixture.date, fixture.time);
      const ageGroup = detectAgeGroup(fixture.home_team || '') || detectAgeGroup(fixture.away_team || '');
      const status = determineStatus(fixture.home_score, fixture.away_score);

      // Keep full venue data (don't clean time info - we need it for Salford league analysis)
      const fullVenue = fixture.venue || 'TBC';

      return {
        date: parsedDate || `${new Date().getFullYear()}-01-01 00:00:00`,
        home_team: fixture.home_team || '',
        away_team: fixture.away_team || '',
        venue: fullVenue,
        league: fixture.league, // League name
        home_score: fixture.home_score,
        away_score: fixture.away_score,
        status: status,
        age_group: ageGroup,
        fixture_type: fixture.fixture_type, // D/L/W or null
        raw_data: JSON.stringify(fixture)
      };
    }).filter(f => f.date && f.home_team && f.away_team); // Only include fixtures with valid data

    log(`Transformed ${transformedFixtures.length} fixtures`);

    if (CONFIG.isTest) {
      log('Test mode - fixtures by league:');
      LEAGUES.forEach(league => {
        const leagueFixtureCount = transformedFixtures.filter(f => f.league === league.name).length;
        log(`  ${league.name}: ${leagueFixtureCount} fixtures`);
      });
    }

    return transformedFixtures;

  } finally {
    await browser.close();
  }
}

// Send fixtures to API
async function sendToAPI(fixtures) {
  if (!CONFIG.apiToken) {
    throw new Error('API_TOKEN not configured');
  }

  log(`Sending ${fixtures.length} fixtures to API...`);

  // Log fixture breakdown by league
  LEAGUES.forEach(league => {
    const count = fixtures.filter(f => f.league === league.name).length;
    log(`  ${league.name}: ${count} fixtures`);
  });

  const payload = {
    fixtures: fixtures,
    source: 'puppeteer-scraper',
    timestamp: new Date().toISOString()
  };

  try {
    const response = await axios.post(CONFIG.apiUrl, payload, {
      headers: {
        'Authorization': `Bearer ${CONFIG.apiToken}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    log('API response:', response.data);
    return response.data;

  } catch (error) {
    if (error.response) {
      log('API error response:', error.response.data);
      throw new Error(`API error: ${error.response.status}`);
    } else {
      log('Network error:', error.message);
      throw error;
    }
  }
}

// Main execution with retry logic
async function main() {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;

    try {
      log(`Attempt ${attempt} of ${maxRetries}`);

      // Scrape fixtures
      const fixtures = await scrapeFixtures();

      if (fixtures.length === 0) {
        log('No fixtures found - widgets may be empty');
        process.exit(1);
      }

      // Send to API (skip in test mode)
      if (CONFIG.isTest) {
        log('Test mode - skipping API call');
        log('Test completed successfully');
      } else {
        const result = await sendToAPI(fixtures);
        log('Scrape completed successfully');
        log(`Stats: ${result.stats.fixtures_new} new, ${result.stats.fixtures_updated} updated`);
      }

      process.exit(0);

    } catch (error) {
      log(`Attempt ${attempt} failed:`, error.message);

      if (attempt === maxRetries) {
        log('Max retries reached - scrape failed');
        process.exit(1);
      }

      // Wait before retry
      log('Waiting 10 seconds before retry...');
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }
}

// Run scraper
main().catch(error => {
  log('Fatal error:', error);
  process.exit(1);
});