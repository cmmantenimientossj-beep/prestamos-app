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
  await page.waitForSelector('button.w-full.bg-white.p-4', { timeout: 10000 }).catch(e => console.log('No buttons found!'));
  
  const htmlBefore = await page.content();
  const buttons = await page.$$('button.w-full.bg-white.p-4');
  console.log(`Found ${buttons.length} pending request buttons.`);
  
  if (buttons.length > 0) {
    console.log('Clicking the first request button...');
    await buttons[0].click();
    await new Promise(r => setTimeout(r, 2000));
    
    const htmlAfter = await page.content();
    const modal = await page.$('.fixed.inset-0');
    console.log('MODAL RENDERED:', !!modal);
    
    if (!modal) {
      console.log('FAILED TO RENDER MODAL! Dump:');
      console.log(htmlAfter);
    }
  } else {
    console.log('No requests to click. DB might be completely empty.');
  }
  
  await browser.close();
})();
