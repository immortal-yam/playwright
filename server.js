const express = require('express');
const { runPlaywright } = require('./generatePDF');
const fs = require('fs');

const app = express();
app.use(express.json());

app.post('/run-playwright', async (req, res) => {
  const { address } = req.body;

  if (!address) return res.status(400).json({ error: 'Missing address' });

  try {
    const filePath = await runPlaywright(address);
    const file = fs.readFileSync(filePath);
    const base64 = file.toString('base64');

    res.status(200).json({
      filename: filePath.split('/').pop(),
      base64,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Playwright automation failed' });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
