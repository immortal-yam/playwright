const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://membersflippingmastery.com/');
  await page.getByRole('textbox', { name: 'Email Address' }).click();
  await page.getByRole('textbox', { name: 'Email Address' }).fill('john.gonzalez.exp@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'Password' }).fill('QGTM718$all');
  await page.getByRole('button', { name: 'SIGN IN' }).click();
  await page.getByRole('link', { name: ' $10K Club' }).click();
  await page.getByRole('link', { name: ' Softwares' }).click();
  await page.locator('div:nth-child(5) > .panel > .panel-body > .btn').click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('link', { name: 'Add New Letter' }).click();
  await page.getByRole('textbox', { name: 'Address' }).click();
  await page.getByRole('textbox', { name: 'Address' }).fill('123 e test ave');
  await page.getByRole('textbox', { name: 'City' }).click();
  await page.getByRole('textbox', { name: 'City' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'City' }).fill('Baltimore');
  await page.getByRole('textbox', { name: 'State' }).click();
  await page.getByRole('textbox', { name: 'State' }).press('CapsLock');
  await page.getByRole('textbox', { name: 'State' }).fill('MD');
  await page.getByRole('textbox', { name: 'Zip' }).click();
  await page.getByRole('textbox', { name: 'Zip' }).fill('21224');
  await page.getByRole('textbox', { name: 'Amount' }).click();
  await page.getByRole('textbox', { name: 'Amount' }).fill('150000');
  await page.getByRole('button', { name: 'Save' }).first().click();
  const page1Promise = page.waitForEvent('popup');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('link', { name: 'Download' }).click();
  const page1 = await page1Promise;
  const download = await downloadPromise;
  await page1.close();

  // ---------------------
  await context.close();
  await browser.close();
})();