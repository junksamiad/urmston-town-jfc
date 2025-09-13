const puppeteer = require('puppeteer');

async function testPuppeteer() {
  console.log('Testing Puppeteer in CI environment...');

  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();

    // Test 1: Basic navigation
    console.log('Test 1: Navigating to example.com...');
    await page.goto('https://example.com', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    console.log('✅ Successfully loaded example.com');

    // Test 2: Check our widget page
    console.log('Test 2: Navigating to FA widget page...');
    try {
      await page.goto('https://pages.urmstontownjfc.co.uk/fa-widget.html', {
        waitUntil: 'domcontentloaded', // Less strict than networkidle
        timeout: 30000
      });
      console.log('✅ Successfully loaded FA widget page');

      // Test 3: Check if widgets exist
      console.log('Test 3: Checking for widget elements...');
      const widgetExists = await page.$('#lrep783655865');
      if (widgetExists) {
        console.log('✅ Found Timperley widget');
      } else {
        console.log('❌ Timperley widget not found');
      }
    } catch (error) {
      console.log('❌ Failed to load FA widget page:', error.message);
    }

  } finally {
    await browser.close();
  }

  console.log('Test complete');
}

testPuppeteer().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});