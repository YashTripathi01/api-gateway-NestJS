import bodyParser from 'body-parser';
import express from 'express';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/health', (_req, res) =>
  res.json({ status: 'ok', service: 'service1', ts: new Date().toISOString() }),
);

app.get('/hello', (req, res) => {
  res.json({
    service: 'service1',
    message: 'hello from service1',
    path: req.path,
  });
});

app.all('/echo', (req, res) => {
  res.json({
    service: 'service1',
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
    headers: req.headers,
  });
});

// For later RBAC tests
app.get('/resource', (_req, res) => res.json({ operation: 'read', ok: true }));

app.post('/resource', (req, res) =>
  res.json({ operation: 'write', ok: true, body: req.body }),
);

const PORT = Number(process.env.SVC1_PORT || 3001);

app.listen(PORT, () =>
  console.log(`service1 mock listening on http://localhost:${PORT}`),
);
