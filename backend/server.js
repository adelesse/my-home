const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const app = express();
app.use(
  cors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist/my-home/browser')));

// ----------------------
// Session
// ----------------------
app.use(
  session({
    secret: 'google-oauth-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Note: In production, set secure: true
  })
);

// ----------------------
// Credentials Google
// ----------------------
const CREDENTIALS_PATH = path.join(__dirname, 'secret/google.config.json');
const API_CONFIG_PATH = path.join(__dirname, 'secret/api.config.json');
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
];

const credentials = require(CREDENTIALS_PATH);
const apiConfig = require(API_CONFIG_PATH);
const { client_id, client_secret, redirect_uris } = credentials.installed;
const { FINANCE_KEY, LINKY_KEY, LINKY_PRM } = apiConfig;

// ----------------------
// 1. Endpoint pour initier OAuth
// ----------------------
app.get('/auth/google', (req, res) => {
  const redirectUrl = req.query.redirect || 'http://localhost:4200';

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: encodeURIComponent(redirectUrl),
  });

  res.redirect(authUrl);
});

// ----------------------
// 2. Callback Google
// ----------------------
app.get('/auth/google/callback', async (req, res) => {
  try {
    console.log('callback');

    const code = req.query.code;
    const redirect = req.query.state
      ? decodeURIComponent(req.query.state)
      : 'http://localhost:4200';

    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    const { tokens } = await oauth2Client.getToken(code);

    console.log('Obtained tokens:', tokens);

    // Stocker tokens dans la session
    req.session.tokens = tokens;

    res.redirect(redirect);
  } catch (err) {
    console.error(err);
    res.status(500).send('Authentication failed');
  }
});

// ----------------------
// 3. Endpoint pour récupérer les événements
// ----------------------
app.get('/calendar/events', async (req, res) => {
  try {
    console.log('Fetching calendar events');

    if (!req.session.tokens) {
      console.log('No tokens found in session');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    console.log('Tokens in session:', req.session.tokens);
    oauth2Client.setCredentials(req.session.tokens);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const result = await calendar.events.list({
      calendarId: 'primary',
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
      timeMin: new Date().toISOString(),
    });

    res.json(result.data.items ?? []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/mail/count', async (req, res) => {
  try {
    console.log('Fetching Gmail messages');

    if (!req.session.tokens) {
      console.log('No tokens found in session');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    console.log('Tokens in session:', req.session.tokens);
    oauth2Client.setCredentials(req.session.tokens);

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const label = await gmail.users.labels.get({
      userId: 'me',
      id: 'INBOX',
    });

    res.json(label.data.messagesUnread ?? 0);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// 4. Endpoint Finance (MarketStack API)
// ----------------------
app.get('/api/finance', async (req, res) => {
  try {
    const url = `https://api.marketstack.com/v2/eod?access_key=${FINANCE_KEY}&symbols=HO.PA`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);
  } catch (err) {
    console.error('Finance API error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ----------------------
// 5. Endpoint Linky (Enedis API)
// ----------------------
app.get('/api/linky', async (req, res) => {
  try {
    const now = new Date();
    const dateMoins7Jours = new Date();
    dateMoins7Jours.setDate(dateMoins7Jours.getDate() - 7);

    const formattedEndDate = dateMoins7Jours.toISOString().split('T')[0];
    const formattedStartDate = now.toISOString().split('T')[0];

    const url = `https://conso.boris.sh/api/daily_consumption?prm=${LINKY_PRM}&start=${formattedEndDate}&end=${formattedStartDate}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${LINKY_KEY}`,
      },
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Linky API error:', err);
    res.status(500).json({ error: err.message });
  }
});

const VIDEO_FOLDER = 'D:/Films';
app.get('/api/videos', (req, res) => {
  fs.readdir(VIDEO_FOLDER, (err, files) => {
    if (err) return res.status(500).send(err);

    const videoFiles = files.filter((f) => f.toLowerCase().match(/\.(mp4|mkv|avi|mov)$/));

    const results = videoFiles.map((file) => ({
      name: file,
      url: `/videos/${encodeURIComponent(file)}`,
    }));

    res.json(results);
  });
});
app.use('/videos', express.static(VIDEO_FOLDER));

// Fallback to index.html for Angular routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/my-home/browser/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Backend started on http://localhost:${PORT}`));
