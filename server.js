require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const { runPlaywright } = require('./generatePDF');

const app = express();

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Playwright proof-of-funds bot is running',
    endpoint: '/run-playwright (POST)',
    expectedBody: ['address', 'city', 'state', 'zip', 'amount'],
  });
});

app.post('/run-playwright', async (req, res) => {
  try {
    console.log('[/run-playwright] Raw body:', req.body);

    const body = req.body || {};

    let address = (body.address ?? '').toString().trim();
    let city    = (body.city ?? '').toString().trim();
    let state   = (body.state ?? '').toString().trim();
    let zip     = (body.zip ?? '').toString().trim();
    let amount  = (body.amount ?? '').toString().trim();

    const letterData = { address, city, state, zip, amount };

    console.log('[/run-playwright] Normalized data:', letterData);

    const missing = [];
    if (!address) missing.push('address');
    if (!city)    missing.push('city');
    if (!state)   missing.push('state');
    if (!zip)     missing.push('zip');
    if (!amount)  missing.push('amount');

    if (missing.length > 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        missing,
        received: letterData,
      });
    }

    const filePath = await runPlaywright(letterData);
    console.log('[/run-playwright] PDF saved at:', filePath);

    const fileBuffer = fs.readFileSync(filePath);
    const base64 = fileBuffer.toString('base64');

    return res.status(200).json({
      filename: path.basename(filePath),
      base64,
    });
  } catch (err) {
    console.error('[/run-playwright] Error:', err);
    return res.status(500).json({ error: 'Playwright automation failed' });
  }
});

const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

