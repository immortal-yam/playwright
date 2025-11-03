const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runPlaywright(data) {
  console.log('[runPlaywright] Raw input:', data);

  const {
    address: rawAddress,
    city: rawCity,
    state: rawState,
    zip: rawZip,
    amount: rawAmount,
  } = data || {};

  // Normalize to trimmed strings
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

  const downloadsDir = path.resolve(__dirname, 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const email = process.env.FLIPPING_EMAIL;
  const password = process.env.FLIPPING_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing FLIPPING_EMAIL or FLIPPING_PASSWORD env vars');
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    acceptDownloads: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  try {
    console.log('[runPlaywright] Navigating to login page...');
    await page.goto('https://membersflippingmastery.com/', {
      waitUntil: 'domcontentloaded',
    });

    await page.getByRole('textbox', { name: 'Email Address' }).fill(email);
    await page.getByRole('textbox', { name: 'Password' }).fill(password);
    await page.getByRole('button', { name: 'SIGN IN' }).click();
    await page.waitForLoadState('networkidle');

    console.log('[runPlaywright] Navigating to $10K Club...');
    await page.getByRole('link', { name: ' $10K Club' }).click();
    await page.waitForLoadState('networkidle');

    console.log('[runPlaywright] Navigating to Softwares...');
    await page.getByRole('link', { name: ' Softwares' }).click();
    await page.waitForLoadState('networkidle');

    console.log('[runPlaywright] Opening letter tool...');
    await page.locator('div:nth-child(5) > .panel > .panel-body > .btn').click();

    try {
      await page.getByRole('button', { name: 'Close' }).click();
    } catch {
      console.log('[runPlaywright] No Close modal found, continuing');
    }

    console.log('[runPlaywright] Clicking "Add New Letter"...');
    await page.getByRole('link', { name: 'Add New Letter' }).click();
    await page.waitForLoadState('networkidle');

    console.log('[runPlaywright] Filling form with dynamic data...');

    await page.getByRole('textbox', { name: 'Address' }).fill(address);
    await page.getByRole('textbox', { name: 'City' }).fill(city);
    await page.getByRole('textbox', { name: 'State' }).fill(state);
    await page.getByRole('textbox', { name: 'Zip' }).fill(zip);
    await page.getByRole('textbox', { name: 'Amount' }).fill(amount);

    await page.getByRole('button', { name: 'Save' }).first().click();
    await page.waitForLoadState('networkidle');

    console.log('[runPlaywright] Triggering download...');
    const [download] = await Promise.all([
      context.waitForEvent('download'),
      page.getByRole('link', { name: 'Download' }).click(),
    ]);

    const filePath = path.join(
      downloadsDir,
      `proof-of-funds-${Date.now()}.pdf`,
    );

    await download.saveAs(filePath);
    console.log('[runPlaywright] Download saved to:', filePath);

    await browser.close();
    return filePath;
  } catch (err) {
    console.error('[runPlaywright] Error during automation:', err);
    await browser.close();
    throw err;
  }
}

module.exports = { runPlaywright };
