import axios from 'axios';

// Configuration from environment variables
const CONFIG = {
  widgetUrl: process.env.WIDGET_URL || 'https://pages.urmstontownjfc.co.uk/fa-widget.html',
  apiUrl: process.env.API_URL || 'https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php',
  apiToken: process.env.API_TOKEN,
  timeout: 120000  // 2 minutes for Vercel
};

// Main Vercel serverless function
export default async function handler(req, res) {
  const startTime = Date.now();
  
  console.log('Starting simplified scraper...');
  
  try {
    // Only allow GET requests for now (no auth needed)
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Test basic functionality without browser
    const testFixtures = [
      {
        fixture_date: '2025-01-15 10:00:00',
        home_team: 'Urmston Town U12',
        away_team: 'Test Team FC U12',
        venue: 'Test Ground',
        league: 'Timperley & District JFL',
        status: 'upcoming',
        raw_data: 'Test fixture data'
      }
    ];
    
    console.log('Generated test fixtures:', testFixtures.length);
    
    // For now, just return the test data without sending to API
    const executionTime = Date.now() - startTime;
    console.log(`Simplified scrape completed in ${executionTime}ms`);
    
    return res.status(200).json({
      success: true,
      stats: { fixtures_found: testFixtures.length },
      executionTime,
      timestamp: new Date().toISOString(),
      config: {
        hasWidgetUrl: !!CONFIG.widgetUrl,
        hasApiUrl: !!CONFIG.apiUrl,  
        hasApiToken: !!CONFIG.apiToken
      },
      fixtures: testFixtures
    });
    
  } catch (error) {
    console.error('Simplified scraper error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
}