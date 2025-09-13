// Scraper using fetch instead of Playwright - testing alternative approach
export default async function handler(req, res) {
  const startTime = Date.now();
  
  // Configuration from environment variables
  const CONFIG = {
    widgetUrl: process.env.WIDGET_URL || 'https://pages.urmstontownjfc.co.uk/fa-widget.html',
    apiUrl: process.env.API_URL || 'https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php',
    apiToken: process.env.API_TOKEN,
    timeout: 120000
  };

  console.log('Starting fetch-based scraper...');
  
  try {
    // Only allow GET requests for now
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log(`Fetching: ${CONFIG.widgetUrl}`);
    
    // Try to fetch the widget page directly
    const response = await fetch(CONFIG.widgetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Urmston-Scraper/1.0)'
      },
      signal: AbortSignal.timeout(30000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const html = await response.text();
    console.log(`Received HTML content: ${html.length} characters`);
    
    // Basic check if we got the expected content
    const hasTimperleyWidget = html.includes('lrep783655865');
    const hasSalfordWidget = html.includes('lrep84363452');
    
    console.log(`Widget check - Timperley: ${hasTimperleyWidget}, Salford: ${hasSalfordWidget}`);
    
    // For now, return analysis without trying to parse fixtures
    const executionTime = Date.now() - startTime;
    
    return res.status(200).json({
      success: true,
      message: 'Fetch-based scraper test',
      stats: {
        html_length: html.length,
        has_timperley_widget: hasTimperleyWidget,
        has_salford_widget: hasSalfordWidget,
        execution_time: executionTime
      },
      config: {
        widget_url: CONFIG.widgetUrl,
        has_api_token: !!CONFIG.apiToken
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Fetch scraper error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
}