// Liefert den fertigen Angular-Build aus (Heroku startet diese Datei über das Procfile)
const express = require('express');
const path = require('node:path');

const app = express();
const port = process.env.PORT || 4000;
const dist = path.join(__dirname, 'dist', 'tipprunde-spa', 'browser');

// Heroku leitet über einen Proxy weiter, daher Protokoll aus dem Header lesen
app.set('trust proxy', 1);

// Aufrufe über http auf https umleiten (nur live, lokal gibt es kein https)
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.originalUrl}`);
  }
  next();
});

// Gebaute Dateien haben einen Hash im Namen und dürfen lange im Cache bleiben
app.use(express.static(dist, { index: false, maxAge: '1y' }));

// Fehlende Dateien (Pfad mit Endung) ehrlich mit 404 beantworten
app.use((req, res, next) => {
  if (path.extname(req.path)) {
    return res.status(404).send('Nicht gefunden');
  }
  next();
});

// Alle anderen Pfade bekommen index.html, das Routing übernimmt Angular im Browser
app.use((req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.sendFile(path.join(dist, 'index.html'));
});

app.listen(port, () => {
  console.log(`[server] SPA läuft auf Port ${port}`);
});
