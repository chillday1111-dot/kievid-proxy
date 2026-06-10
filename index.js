const express = require('express');
const https = require('https');
const app = express();

app.use(express.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.sendStatus(204); return; }
  next();
});

app.all('/*', (req, res) => {
  const body = req.method === 'POST' ? JSON.stringify(req.body) : null;
  const qs = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
  const options = {
    hostname: 'api.kie.ai',
    path: req.path + qs,
    method: req.method,
    headers: {
      'Authorization': `Bearer ${process.env.KIEAI_API_KEY}`,
      'Content-Type': 'application/json',
    }
  };
  const proxy = https.request(options, apiRes => {
    res.status(apiRes.statusCode);
    res.setHeader('Access-Control-Allow-Origin', '*');
    apiRes.pipe(res);
  });
  proxy.on('error', e => res.status(500).json({ error: e.message }));
  if (body) proxy.write(body);
  proxy.end();
});

app.listen(process.env.PORT || 3000, () => console.log('Proxy running!'));
