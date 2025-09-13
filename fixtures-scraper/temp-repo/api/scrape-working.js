// Working scraper using Playwright with proper error handling
export default async function handler(req, res) {
  const startTime = Date.now();
  
  console.log('Starting Vercel scraper...');
  
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

  try {
    // Only allow GET requests (no auth required)
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Import Playwright dynamically to avoid module issues
    let chromium;
    try {
      const playwright = await import('playwright');
      chromium = playwright.chromium;
      console.log('Playwright imported successfully');
    } catch (importError) {
      console.error('Failed to import Playwright:', importError);
      throw new Error('Playwright not available in this environment');
    }

    let browser;
    try {
      // Launch browser with minimal configuration for Vercel
      browser = await chromium.launch({
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
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
      
      // Give extra time for dynamic content
      await page.waitForTimeout(3000);
      
      // Test basic scraping - just count tables for now
      const tableCount = await page.evaluate(() => {
        const timperleyTables = document.querySelectorAll('#lrep783655865 table').length;
        const salfordTables = document.querySelectorAll('#lrep84363452 table').length;
        return { timperley: timperleyTables, salford: salfordTables };
      });
      
      console.log(`Found tables - Timperley: ${tableCount.timperley}, Salford: ${tableCount.salford}`);
      
      await browser.close();
      
      const executionTime = Date.now() - startTime;
      console.log(`Scrape completed in ${executionTime}ms`);
      
      return res.status(200).json({
        success: true,
        message: 'Playwright scraper test successful',
        stats: {
          tables_found: tableCount,
          execution_time: executionTime
        },
        timestamp: new Date().toISOString()
      });
      
    } finally {
      if (browser) {
        await browser.close();
      }
    }
    
  } catch (error) {
    console.error('Scraper error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
}