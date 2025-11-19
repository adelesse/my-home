const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const session = require('express-session');

const path = require('path');

const app = express();
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));


app.use(express.json());
app.use(express.static(path.join(__dirname, '../dist/my-home')));

// ----------------------
// Session
// ----------------------
app.use(session({
  secret: 'google-oauth-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Note: In production, set secure: true
}));

// ----------------------
// Credentials Google
// ----------------------
const CREDENTIALS_PATH = path.join(process.cwd(), 'secret/google.config.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

const credentials = require(CREDENTIALS_PATH);
const { client_id, client_secret, redirect_uris } = credentials.installed;

// ----------------------
// 1. Endpoint pour initier OAuth
// ----------------------
app.get('/auth/google', (req, res) => {
  const redirectUrl = req.query.redirect || 'http://localhost:4200';

  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    state: encodeURIComponent(redirectUrl)
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
    const redirect = req.query.state ? decodeURIComponent(req.query.state) : 'http://localhost:4200';

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
      timeMin: (new Date()).toISOString(),
    });

    res.json(result.data.items ?? []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Fallback to index.html for Angular routing
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/my-home/browser/index.html'));
});


const PORT = 3000;
app.listen(PORT, () => console.log(`Backend started on http://localhost:${PORT}`));