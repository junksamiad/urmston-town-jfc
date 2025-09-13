const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const axios = require('axios');

// Configuration from environment variables
const CONFIG = {
  widgetUrl: process.env.WIDGET_URL || 'https://pages.urmstontownjfc.co.uk/fa-widget.html',
  apiUrl: process.env.API_URL || 'https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php',
  apiToken: process.env.API_TOKEN,
  timeout: 120000  // 2 minutes
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

// Lambda handler
exports.handler = async (event, context) => {
  console.log('Starting fixture scrape Lambda function');
  console.log('Event:', JSON.stringify(event));

  let browser = null;

  try {
    // Launch browser with Lambda-optimized settings
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });

    // Run the scraping process
    const fixtures = await scrapeFixtures(browser);

    if (fixtures.length === 0) {
      throw new Error('No fixtures found - widgets may be empty');
    }

    // Send to API
    const apiResult = await sendToAPI(fixtures);

    // Success response
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Fixtures scraped successfully',
        fixturesFound: fixtures.length,
        apiResponse: apiResult,
        timestamp: new Date().toISOString()
      })
    };

    console.log('Lambda execution successful:', response);
    return response;

  } catch (error) {
    console.error('Lambda execution failed:', error);

    // Error response
    const errorResponse = {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };

    return errorResponse;

  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Parse date from FA Full-Time format
function parseDate(dateStr, timeStr = '') {
  try {
    if (!dateStr || dateStr.trim() === '') {
      return null;
    }

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
      console.log(`Could not parse date format: "${dateStr}"`);
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
      console.log(`Invalid date constructed: ${isoDate} from "${dateStr}" "${timeStr}"`);
      return null;
    }

    return isoDate;
  } catch (error) {
    console.log(`Date parsing error: "${dateStr}" "${timeStr}" - ${error.message}`);
    return null;
  }
}

// Detect Urmston Town age group from team name
function detectAgeGroup(teamName) {
  const ageGroups = ['U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16'];

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
  console.log(`Extracting fixtures for ${league.name}...`);

  // Check if widget exists
  const widgetExists = await page.$(league.selector);
  if (!widgetExists) {
    console.log(`Widget not found for ${league.name} (${league.selector})`);
    return [];
  }

  // Wait for table to load within the widget
  try {
    await page.waitForSelector(`${league.selector} table`, {
      timeout: 10000
    });
  } catch (error) {
    console.log(`No table found for ${league.name} - widget may be empty`);
    return [];
  }

  // Extract fixture data for this league
  const fixtures = await page.evaluate((leagueConfig) => {
    const results = [];

    // Find all tables within this specific widget
    const tables = document.querySelectorAll(`${leagueConfig.selector} table`);

    tables.forEach(table => {
      const rows = table.querySelectorAll('tr');
      let currentDate = null;

      rows.forEach(row => {
        try {
          // Skip header rows
          if (row.querySelector('th')) return;

          const cells = row.querySelectorAll('td');
          if (cells.length === 0) return;

          const cellTexts = Array.from(cells).map(c => c.textContent.trim());

          // Check if this is a date row
          if (cells.length === 1) {
            const dateText = cellTexts[0];
            if (dateText.match(/\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) ||
                dateText.match(/(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i)) {
              currentDate = dateText;
              console.log(`Found date row: ${currentDate}`);
              return;
            }
          }

          // Check if this is a fixture row (5 columns expected)
          if (cells.length === 5) {
            const fixture = {
              date: currentDate,
              time: null,
              home_team: cellTexts[1],
              away_team: cellTexts[3],
              venue: cellTexts[4],
              league: leagueConfig.name,
              home_score: null,
              away_score: null,
              fixture_type: cellTexts[0] || null,
              raw_cells: cellTexts
            };

            // Extract time from date row if present
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

          // Handle "Postponed" rows
          if (cells.length === 1 && cellTexts[0].toLowerCase().includes('postponed')) {
            console.log('Found postponed notice');
          }

        } catch (error) {
          console.error('Error parsing row:', error);
        }
      });
    });

    return results;
  }, league);

  console.log(`Found ${fixtures.length} fixtures for ${league.name}`);
  return fixtures;
}

// Main scraping function
async function scrapeFixtures(browser) {
  console.log('Starting fixture scrape...');

  const page = await browser.newPage();

  try {
    // Navigate to widget page
    console.log(`Navigating to: ${CONFIG.widgetUrl}`);
    await page.goto(CONFIG.widgetUrl, {
      waitUntil: 'networkidle0',
      timeout: CONFIG.timeout
    });

    // Wait for at least one widget to load
    console.log('Waiting for widgets to load...');
    await page.waitForSelector(`${LEAGUES[0].selector}, ${LEAGUES[1].selector}`, {
      timeout: CONFIG.timeout
    });

    // Additional wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Scrape fixtures from all leagues
    let allFixtures = [];
    for (const league of LEAGUES) {
      const leagueFixtures = await scrapeLeagueFixtures(page, league);
      allFixtures = allFixtures.concat(leagueFixtures);
    }

    console.log(`Total fixtures found across all leagues: ${allFixtures.length}`);

    // Transform fixtures for API
    const transformedFixtures = allFixtures.map(fixture => {
      const parsedDate = parseDate(fixture.date, fixture.time);
      const ageGroup = detectAgeGroup(fixture.home_team || '') || detectAgeGroup(fixture.away_team || '');
      const status = determineStatus(fixture.home_score, fixture.away_score);

      const fullVenue = fixture.venue || 'TBC';

      return {
        date: parsedDate || `${new Date().getFullYear()}-01-01 00:00:00`,
        home_team: fixture.home_team || '',
        away_team: fixture.away_team || '',
        venue: fullVenue,
        league: fixture.league,
        home_score: fixture.home_score,
        away_score: fixture.away_score,
        status: status,
        age_group: ageGroup,
        fixture_type: fixture.fixture_type,
        raw_data: JSON.stringify(fixture)
      };
    }).filter(f => f.date && f.home_team && f.away_team);

    // Filter to only include fixtures within the next 7 days (today + 6 days)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7); // End of 7th day

    const filteredFixtures = transformedFixtures.filter(fixture => {
      const fixtureDate = new Date(fixture.date);
      return fixtureDate >= today && fixtureDate < sevenDaysFromNow;
    });

    console.log(`Filtered from ${transformedFixtures.length} to ${filteredFixtures.length} fixtures (7-day window)`);

    // Log fixture breakdown by league (for filtered fixtures)
    LEAGUES.forEach(league => {
      const leagueFixtureCount = filteredFixtures.filter(f => f.league === league.name).length;
      console.log(`  ${league.name}: ${leagueFixtureCount} fixtures`);
    });

    return filteredFixtures;

  } finally {
    await page.close();
  }
}

// Send fixtures to API
async function sendToAPI(fixtures) {
  if (!CONFIG.apiToken) {
    throw new Error('API_TOKEN not configured');
  }

  console.log(`Sending ${fixtures.length} fixtures to API...`);

  // Log fixture breakdown by league
  LEAGUES.forEach(league => {
    const count = fixtures.filter(f => f.league === league.name).length;
    console.log(`  ${league.name}: ${count} fixtures`);
  });

  const payload = {
    fixtures: fixtures,
    source: 'lambda-scraper',
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

    console.log('API response:', response.data);

    // Handle malformed JSON response
    let responseData = response.data;
    if (typeof responseData === 'string') {
      const jsonMatch = responseData.match(/\{.*\}/);
      if (jsonMatch) {
        try {
          responseData = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.log('Failed to parse JSON response:', parseError.message);
          return { success: false, error: 'Invalid JSON response' };
        }
      }
    }

    return responseData;

  } catch (error) {
    if (error.response) {
      console.log('API error response:', error.response.data);
      throw new Error(`API error: ${error.response.status}`);
    } else {
      console.log('Network error:', error.message);
      throw error;
    }
  }
}