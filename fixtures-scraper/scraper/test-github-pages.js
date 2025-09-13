const puppeteer = require('puppeteer');

async function test() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  console.log('Loading GitHub Pages widget page...');
  await page.goto('https://junksamiad.github.io/urmston-town-fixtures/', {
    waitUntil: 'domcontentloaded'
  });

  console.log('Waiting 5 seconds for widgets to load...');
  await new Promise(r => setTimeout(r, 5000));

  // Check if widget exists
  const widget = await page.$('#lrep783655865');
  console.log('Timperley widget found:', !!widget);

  if (widget) {
    // Check if it has content
    const hasTable = await page.$('#lrep783655865 table');
    console.log('Widget has table content:', !!hasTable);

    if (hasTable) {
      const fixtures = await page.evaluate(() => {
        const rows = document.querySelectorAll('#lrep783655865 table tr');
        return rows.length;
      });
      console.log('Number of table rows found:', fixtures);
    }
  }

  await browser.close();
}

test().catch(console.error);