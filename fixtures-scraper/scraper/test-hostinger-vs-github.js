const puppeteer = require('puppeteer');

async function testBothHosts() {
  console.log('Testing Hostinger vs GitHub Pages hosting...\n');

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

    // Test 1: Hostinger
    console.log('Test 1: Hostinger-hosted widget page');
    console.log('URL: https://pages.urmstontownjfc.co.uk/fa-widget.html');
    try {
      const start = Date.now();
      await page.goto('https://pages.urmstontownjfc.co.uk/fa-widget.html', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      const loadTime = Date.now() - start;
      console.log(`✅ Loaded in ${loadTime}ms`);

      const widgetExists = await page.$('#lrep783655865');
      if (widgetExists) {
        console.log('✅ Widget element found\n');
      } else {
        console.log('⚠️ Widget element not found\n');
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }

    // Test 2: GitHub Pages
    console.log('Test 2: GitHub Pages-hosted widget page');
    console.log('URL: https://junksamiad.github.io/urmston-town-fixtures/');
    try {
      const start = Date.now();
      await page.goto('https://junksamiad.github.io/urmston-town-fixtures/', {
        waitUntil: 'domcontentloaded',
        timeout: 30000
      });
      const loadTime = Date.now() - start;
      console.log(`✅ Loaded in ${loadTime}ms`);

      const widgetExists = await page.$('#lrep783655865');
      if (widgetExists) {
        console.log('✅ Widget element found\n');
      } else {
        console.log('⚠️ Widget element not found\n');
      }
    } catch (error) {
      console.log(`❌ Failed: ${error.message}\n`);
    }

    console.log('Summary:');
    console.log('If GitHub Pages works but Hostinger doesn\'t, then HOSTINGER IS BLOCKING.');
    console.log('If both fail, then it\'s the FA WIDGETS or GitHub Actions IP that\'s the issue.');

  } finally {
    await browser.close();
  }
}

testBothHosts().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});