import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  console.log('Navigating to login...');
  await page.goto('http://127.0.0.1:3000/login', { waitUntil: 'networkidle0' });
  
  console.log('Logging in...');
  await page.type('input[type=email]', 'admin@ryb.com');
  await page.type('input[type=password]', 'admin123');
  await Promise.all([
    page.click('button[type=submit]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  console.log('Going to solicitudes...');
  await page.goto('http://127.0.0.1:3000/admin/solicitudes', { waitUntil: 'networkidle0' });
  await page.waitForSelector('button');
  
  const buttons = await page.$$('button');
  console.log(`Found ${buttons.length} buttons.`);
  
  let found = false;
  for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('cuotas')) {
          found = true;
          console.log('Clicking the request button...');
          await b.click();
          await new Promise(r => setTimeout(r, 2000));
          
          const modalRendered = await page.$('div[style*="position: fixed"]');
          console.log('MODAL RENDERED INITIALLY:', !!modalRendered);
          if (!modalRendered) {
              console.log('Modal is missing. Dumping inner HTML of the container...');
              const html = await page.evaluate(() => document.body.innerHTML);
              console.log(html.substring(0, 1500));
          } else {
              console.log('Modal found successfully with naked CSS.');
          }
          break;
      }
  }

  if (!found) {
      console.log('No pending requests to click in the test.');
  }

  await browser.close();
})();
