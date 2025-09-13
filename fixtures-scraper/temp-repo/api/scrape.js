import { chromium } from 'playwright';
import axios from 'axios';

// Configuration from environment variables
const CONFIG = {
  widgetUrl: process.env.WIDGET_URL || 'https://pages.urmstontownjfc.co.uk/fa-widget.html',
  apiUrl: process.env.API_URL || 'https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php',
  apiToken: process.env.API_TOKEN,
  timeout: 120000  // 2 minutes for Vercel
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

// Parse date from FA Full-Time format (adapted from working version)
function parseDate(dateStr, timeStr = '') {
  try {
    if (!dateStr || dateStr.trim() === '') return null;
    
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
    let match = dateStr.match(/\\w{3}\\s+(\\d{1,2})\\s+(\\w{3})(?:\\s+(\\d{4}))?/);
    if (match) {
      day = match[1].padStart(2, '0');
      month = months[match[2]] || '01';
      if (match[3]) parsedYear = match[3];
    }
    
    // Pattern 2: "15/01/2025" or "15/01"
    if (!day) {
      match = dateStr.match(/(\\d{1,2})\\/(\\d{1,2})(?:\\/(\\d{2,4}))?/);
      if (match) {
        day = match[1].padStart(2, '0');
        month = match[2].padStart(2, '0');
        if (match[3]) {
          parsedYear = match[3].length === 2 ? '20' + match[3] : match[3];
        }
      }
    }
    
    if (!day || !month) {
      console.log(`Could not parse date format: "${dateStr}"`);
      return null;
    }
    
    // Parse time if provided
    if (timeStr && timeStr.trim()) {
      const timeMatch = timeStr.trim().match(/(\\d{1,2}):(\\d{2})/);
      if (timeMatch) {
        hour = timeMatch[1].padStart(2, '0');
        minute = timeMatch[2].padStart(2, '0');
      }
    }
    
    const isoDate = `${parsedYear}-${month}-${day} ${hour}:${minute}:00`;
    
    // Validate date
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) {
      console.log(`Invalid date constructed: ${isoDate}`);
      return null;
    }
    
    return isoDate;
  } catch (error) {
    console.log(`Date parsing error: ${error.message}`);
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

// Scrape fixtures from a specific league widget (adapted from working version)
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
      timeout: 15000
    });
  } catch (error) {
    console.log(`No table found for ${league.name} - widget may be empty`);
    return [];
  }
  
  // Extract fixture data for this league (simplified version for Vercel)
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
          
          // Check if this is a date row (single cell spanning table with date)
          if (cells.length === 1) {
            const dateText = cellTexts[0];
            if (dateText.match(/\\d{1,2}\\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i) ||
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
              const dateTimeMatch = currentDate.match(/(\\d{1,2}:\\d{2})/);
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

// Send fixtures to API
async function sendToAPI(fixtures) {
  if (!CONFIG.apiToken) {
    throw new Error('API_TOKEN not configured');
  }
  
  console.log(`Sending ${fixtures.length} fixtures to API...`);
  
  const payload = {
    fixtures: fixtures,
    source: 'vercel-scraper',
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
    
    // Handle malformed JSON response (PHP code mixed in)
    let responseData = response.data;
    if (typeof responseData === 'string') {
      const jsonMatch = responseData.match(/\\{.*\\}/);
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

// Main Vercel serverless function
export default async function handler(req, res) {
  const startTime = Date.now();
  
  // Only allow GET requests for cron and manual calls
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('Starting Vercel scraper...');
  
  let browser;
  try {
    // Launch browser with args optimized for serverless
    browser = await chromium.launch({
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-features=VizDisplayCompositor'
      ],
      // Try to use installed browsers
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
    });
    
    console.log('Browser launched successfully');
    
    const page = await browser.newPage();
    
    // Navigate to widget page
    console.log(`Navigating to: ${CONFIG.widgetUrl}`);
    await page.goto(CONFIG.widgetUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Wait for at least one widget to load
    console.log('Waiting for widgets to load...');
    await page.waitForSelector(`${LEAGUES[0].selector}, ${LEAGUES[1].selector}`, {
      timeout: 30000
    });
    
    // Additional wait for dynamic content
    await page.waitForTimeout(3000);
    
    // Scrape fixtures from all leagues
    let allFixtures = [];
    for (const league of LEAGUES) {
      const leagueFixtures = await scrapeLeagueFixtures(page, league);
      allFixtures = allFixtures.concat(leagueFixtures);
    }
    
    console.log(`Total fixtures found across all leagues: ${allFixtures.length}`);
    
    if (allFixtures.length === 0) {
      await browser.close();
      return res.status(200).json({
        success: false,
        error: 'No fixtures found',
        executionTime: Date.now() - startTime
      });
    }
    
    // Transform fixtures for API
    const transformedFixtures = allFixtures.map(fixture => {
      const parsedDate = parseDate(fixture.date, fixture.time);
      const ageGroup = detectAgeGroup(fixture.home_team || '') || detectAgeGroup(fixture.away_team || '');
      
      return {
        date: parsedDate || `${new Date().getFullYear()}-01-01 00:00:00`,
        home_team: fixture.home_team || '',
        away_team: fixture.away_team || '',
        venue: fixture.venue || 'TBC',
        league: fixture.league,
        home_score: fixture.home_score,
        away_score: fixture.away_score,
        status: 'upcoming',
        age_group: ageGroup,
        fixture_type: fixture.fixture_type,
        raw_data: JSON.stringify(fixture)
      };
    }).filter(f => f.date && f.home_team && f.away_team);
    
    console.log(`Transformed ${transformedFixtures.length} fixtures`);
    
    // Send to API
    console.log('Sending fixtures to API...');
    const result = await sendToAPI(transformedFixtures);
    
    await browser.close();
    
    const executionTime = Date.now() - startTime;
    console.log(`Scrape completed in ${executionTime}ms`);
    
    return res.status(200).json({
      success: true,
      stats: result.stats || { fixtures_found: transformedFixtures.length },
      executionTime,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scraper error:', error);
    
    if (browser) {
      await browser.close();
    }
    
    return res.status(500).json({
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
}