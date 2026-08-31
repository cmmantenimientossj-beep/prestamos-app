import puppeteer from 'puppeteer';

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  console.log('Navigating to login...');
  await page.goto('http://127.0.0.1:3000/login');
  
  console.log('Logging in...');
  await page.type('input[type=email]', 'admin@ryb.com');
  await page.type('input[type=password]', 'admin123');
  await Promise.all([
    page.click('button[type=submit]'),
    page.waitForNavigation({ waitUntil: 'networkidle0' })
  ]);
  
  console.log('Going to solicitudes...');
  await page.goto('http://127.0.0.1:3000/admin/solicitudes');
  await page.waitForSelector('button');
  
  const buttons = await page.$$('button');
  console.log(`Found ${buttons.length} buttons.`);
  
  // Find the button that represents a pending request card (has "cuotas" inside)
  let found = false;
  for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text && text.includes('cuotas')) {
          found = true;
          console.log('Clicking the primary request button...');
          await b.click();
          await new Promise(r => setTimeout(r, 2000));
          
          const htmlAfter = await page.content();
          const modalRendered = await page.$('.fixed.inset-0');
          console.log('MODAL VISUALIZED AND LOCATED:', !!modalRendered);
          
          if (!modalRendered) {
             console.log("FAILED MODAL CRASH DUMP:");
             console.log(htmlAfter.substring(0, 1000)); // dump sample
          }
          break;
      }
  }

  if (!found) {
      console.log('No pending requests found to click.');
  }

  await browser.close();
})();
