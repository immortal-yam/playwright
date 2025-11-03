const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runPlaywright(data) {
  console.log('[runPlaywright] Raw input:', data);

  // Safely unpack and normalize the input
  const {
    address: rawAddress,
    city: rawCity,
    state: rawState,
    zip: rawZip,
    amount: rawAmount,
  } = data || {};

  const address = (rawAddress ?? '').toString().trim();
  const city    = (rawCity ?? '').toString().trim();
  const state   = (rawState ?? '').toString().trim();
  const zip     = (rawZip ?? '').toString().trim();
  const amount  = (rawAmount ?? '').toString().trim();

  console.log('[runPlaywright] Normalized data:', {
    address,
    city,
    state,
    zip,
    amount,
  });

  // Validate required fields
  const missing = [];
  if (!address) missing.push('address');
  if (!city)    missing.push('city');
  if (!state)   missing.push('state');
  if (!zip)     missing.push('zip');
  if (!amount)  missing.push('amount');

  if (missing.length > 0) {
    throw new Error(
      `Missing or empty fields in runPlaywright: ${missing.join(', ')}`
    );
  }

  // Prepare downloads directory
  const downloadsDir = path.resolve(__dirname, 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  // Credentials from env vars
  const email = process.env.FLIPPING_EMAIL;
  const password = process.env.FLIPPING_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing FLIPPING_EMAIL or FLIPPING_PASSWORD env vars');
  }

  // For local debugging, you can temporarily switch to headless: false and add slowMo
  const browser = await chromium.launch({
    headless: true,
  });
  

  const context = await browser.newContext({
    acceptDownloads: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000); // 60s per action max

  try {
    // 1. Login
    console.log('[runPlaywright] Navigating to login page...');
    await page.goto('https://membersflippingmastery.com/', {
      waitUntil: 'domcontentloaded',
    });

    console.log('[runPlaywright] Filling login form...');
    await page.getByRole('textbox', { name: /email address/i }).fill(email);
    await page.getByRole('textbox', { name: /password/i }).fill(password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForLoadState('networkidle');

    // 2. Navigate to $10K Club
    console.log('[runPlaywright] Navigating to $10K Club...');
    try {
      await page.getByRole('link', { name: /10k club/i }).click();
    } catch (err) {
      console.log('[runPlaywright] getByRole 10K Club failed, trying getByText...');
      await page.getByText('10K Club', { exact: false }).click();
    }
    await page.waitForLoadState('networkidle');

    // 3. Navigate to Softwares
    console.log('[runPlaywright] Navigating to Softwares...');
    try {
      await page.getByRole('link', { name: /softwares/i }).click();
    } catch (err) {
      console.log('[runPlaywright] getByRole Softwares failed, trying getByText...');
      await page.getByText('Softwares', { exact: false }).click();
    }
    await page.waitForLoadState('networkidle');

    // 4. Open the letter tool (this locator is based on your original script)
    console.log('[runPlaywright] Opening letter tool panel button...');
    await page.locator('div:nth-child(5) > .panel > .panel-body > .btn').click();

    // Try closing any modal that might pop up
    try {
      console.log('[runPlaywright] Trying to close intro modal (if present)...');
      await page.getByRole('button', { name: /close/i }).click();
    } catch {
      console.log('[runPlaywright] No Close modal found, continuing');
    }

    // 5. Click "Add New Letter"
    console.log('[runPlaywright] Clicking "Add New Letter"...');
    try {
      await page.getByRole('link', { name: /add new letter/i }).click();
    } catch (err) {
      console.log('[runPlaywright] getByRole Add New Letter failed, trying getByText...');
      await page.getByText('Add New Letter', { exact: false }).click();
    }
    await page.waitForLoadState('networkidle');

    // 6. Fill form with dynamic data
    console.log('[runPlaywright] Filling form with dynamic data...');

    await page.getByRole('textbox', { name: /address/i }).fill(address);
    await page.getByRole('textbox', { name: /city/i }).fill(city);
    await page.getByRole('textbox', { name: /state/i }).fill(state);
    await page.getByRole('textbox', { name: /zip/i }).fill(zip);
    await page.getByRole('textbox', { name: /amount/i }).fill(amount);

    console.log('[runPlaywright] Saving letter...');
    await page.getByRole('button', { name: /save/i }).first().click();
    await page.waitForLoadState('networkidle');

  // 7. Trigger and wait for the PDF download (handle popup + download)
  console.log('[runPlaywright] Triggering download...');

  const popupPromise = page.waitForEvent('popup');
  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('link', { name: /download/i }).click();

  let popup;
  try {
    popup = await popupPromise;
    console.log('[runPlaywright] Download popup opened');
  } catch {
    console.log('[runPlaywright] No popup detected (might be inline download)');
  }

  const download = await downloadPromise;

  const filePath = path.join(
    downloadsDir,
    `proof-of-funds-${Date.now()}.pdf`,
  );

  await download.saveAs(filePath);
  console.log('[runPlaywright] Download saved to:', filePath);

  if (popup) {
    await popup.close();
    console.log('[runPlaywright] Download popup closed');
  }


    await browser.close();
    return filePath;
  } catch (err) {
    console.error('[runPlaywright] Error during automation:', err);
    await browser.close();
    throw err;
  }
}

module.exports = { runPlaywright };
