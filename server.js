const express = require('express');
const fs = require('fs');
const path = require('path');
const { runPlaywright } = require('./generatePDF');

const app = express();

// Parse JSON bodies, allow a bit of size for safety
app.use(express.json({ limit: '10mb' }));

// Simple health check so visiting "/" in the browser works
app.get('/', (req, res) => {
  res.json({
    ok: true,
    message: 'Playwright proof-of-funds bot is running',
    endpoints: ['/run-playwright (POST)'],
  });
});

// Main endpoint – n8n (or anything else) will call this
app.post('/run-playwright', async (req, res) => {
  try {
    const address = (req.body?.address || '').trim();

    if (!address) {
      return res.status(400).json({ error: 'Missing address' });
    }

    console.log('[/run-playwright] Received address:', address);

    const filePath = await runPlaywright(address);
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

// Use the PORT Railway gives us (it was 8080 in your logs), default for local dev
const PORT = Number(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
