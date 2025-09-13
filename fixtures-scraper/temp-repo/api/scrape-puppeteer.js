// Scraper using Puppeteer for better serverless compatibility
export default async function handler(req, res) {
  const startTime = Date.now();
  
  console.log('Starting Puppeteer scraper...');
  
  // Configuration from environment variables
  const CONFIG = {
    widgetUrl: process.env.WIDGET_URL || 'https://pages.urmstontownjfc.co.uk/fa-widget.html',
    apiUrl: process.env.API_URL || 'https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php',
    apiToken: process.env.API_TOKEN,
    timeout: 120000
  };

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Import Puppeteer dynamically
    let puppeteer;
    let chromium;
    
    try {
      puppeteer = await import('puppeteer-core');
      chromium = await import('chrome-aws-lambda');
      console.log('Puppeteer and Chrome AWS Lambda imported successfully');
    } catch (importError) {
      console.error('Failed to import Puppeteer:', importError);
      throw new Error('Puppeteer not available in this environment');
    }

    let browser;
    try {
      // Launch browser with chrome-aws-lambda for better Vercel compatibility
      browser = await puppeteer.default.launch({
        args: chromium.default.args,
        defaultViewport: chromium.default.defaultViewport,
        executablePath: await chromium.default.executablePath,
        headless: chromium.default.headless,
        ignoreHTTPSErrors: true,
      });
      
      console.log('Browser launched successfully');
      
      const page = await browser.newPage();
      
      // Navigate to widget page
      console.log(`Navigating to: ${CONFIG.widgetUrl}`);
      await page.goto(CONFIG.widgetUrl, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      // Wait for widgets to load - looking for actual table content
      console.log('Waiting for widget content to load...');
      try {
        await page.waitForFunction(
          () => {
            const timperleyTables = document.querySelectorAll('#lrep783655865 table').length;
            const salfordTables = document.querySelectorAll('#lrep84363452 table').length;
            return timperleyTables > 0 || salfordTables > 0;
          },
          { timeout: 20000 }
        );
        console.log('Widget content loaded');
      } catch (waitError) {
        console.log('Timeout waiting for widgets, proceeding anyway');
      }
      
      // Extract basic info to test scraping
      const widgetInfo = await page.evaluate(() => {
        const timperleyDiv = document.querySelector('#lrep783655865');
        const salfordDiv = document.querySelector('#lrep84363452');
        
        return {
          timperley: {
            exists: !!timperleyDiv,
            content: timperleyDiv ? timperleyDiv.innerHTML.substring(0, 200) : null,
            tables: timperleyDiv ? timperleyDiv.querySelectorAll('table').length : 0
          },
          salford: {
            exists: !!salfordDiv,
            content: salfordDiv ? salfordDiv.innerHTML.substring(0, 200) : null,
            tables: salfordDiv ? salfordDiv.querySelectorAll('table').length : 0
          }
        };
      });
      
      console.log('Widget info extracted:', widgetInfo);
      
      await browser.close();
      
      const executionTime = Date.now() - startTime;
      console.log(`Scrape completed in ${executionTime}ms`);
      
      return res.status(200).json({
        success: true,
        message: 'Puppeteer scraper test successful',
        stats: {
          widget_info: widgetInfo,
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
    console.error('Puppeteer scraper error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
}