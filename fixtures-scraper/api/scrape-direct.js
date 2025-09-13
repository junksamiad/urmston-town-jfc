// Try direct FA API approach instead of scraping widgets
export default async function handler(req, res) {
  const startTime = Date.now();
  
  console.log('Starting direct FA API scraper...');
  
  // Configuration from environment variables
  const CONFIG = {
    apiUrl: process.env.API_URL || 'https://pages.urmstontownjfc.co.uk/api/fixtures/ingest.php',
    apiToken: process.env.API_TOKEN
  };

  // League configurations
  const LEAGUES = [
    {
      name: 'Timperley & District JFL',
      code: '783655865'
    },
    {
      name: 'Salford League', 
      code: '84363452'
    }
  ];

  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('Trying to access FA API directly...');
    
    // Try to fetch the FA API script to understand the structure
    let faApiResponse;
    try {
      faApiResponse = await fetch('https://fulltime.thefa.com/client/api/cs1.js', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Urmston-Scraper/1.0)',
          'Referer': 'https://pages.urmstontownjfc.co.uk/fa-widget.html'
        }
      });
      
      if (faApiResponse.ok) {
        const scriptContent = await faApiResponse.text();
        console.log('FA API script fetched, size:', scriptContent.length);
        
        // Look for API endpoints in the script
        const apiUrlMatches = scriptContent.match(/https?:\/\/[^\s'"]+/g);
        console.log('Found potential API URLs:', apiUrlMatches?.slice(0, 5));
      }
    } catch (apiError) {
      console.log('Could not fetch FA API script:', apiError.message);
    }

    // Try alternative approach - look for FA Full-Time API patterns
    const testUrls = [
      `https://fulltime.thefa.com/api/fixtures/league/${LEAGUES[0].code}`,
      `https://fulltime.thefa.com/client/api/fixtures?league=${LEAGUES[0].code}`,
      `https://api.thefa.com/v1/leagues/${LEAGUES[0].code}/fixtures`
    ];

    const apiTestResults = [];
    
    for (const url of testUrls) {
      try {
        console.log(`Testing API URL: ${url}`);
        const testResponse = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; Urmston-Scraper/1.0)',
            'Accept': 'application/json, text/javascript, */*'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        apiTestResults.push({
          url,
          status: testResponse.status,
          contentType: testResponse.headers.get('content-type'),
          accessible: testResponse.ok
        });
        
        if (testResponse.ok) {
          const content = await testResponse.text();
          console.log(`Success with ${url}: ${content.substring(0, 200)}`);
        }
        
      } catch (testError) {
        apiTestResults.push({
          url,
          error: testError.message
        });
      }
    }

    const executionTime = Date.now() - startTime;
    
    return res.status(200).json({
      success: true,
      message: 'Direct FA API exploration',
      stats: {
        fa_script_accessible: !!faApiResponse?.ok,
        api_tests: apiTestResults,
        execution_time: executionTime
      },
      leagues: LEAGUES,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Direct API scraper error:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      executionTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    });
  }
}