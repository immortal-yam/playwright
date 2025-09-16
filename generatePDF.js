const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runPlaywright(address) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Example navigation; replace with your flow if needed
  await page.goto('https://example.com');

  const outputDir = path.join(process.cwd(), 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
  const filePath = path.join(outputDir, `result-${Date.now()}.pdf`);
  await page.pdf({ path: filePath, format: 'A4' });

  await context.close();
  await browser.close();
  return filePath;
}

module.exports = { runPlaywright };