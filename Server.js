const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

// Config
const ADMIN_PASS = process.env.ADMIN_PASS || "admin@2025";
const SESSION_SECRET = process.env.SESSION_SECRET || "supersecret";
const PORT = process.env.PORT || 4000;

// In-memory data (replace with DB for production)
const visitors = [];
const appointments = [];
const estimates = [];
const contacts = [];
const gallery = [];

// CORS for local development
app.use(cors({
  origin: 'http://localhost:5500', // adjust as needed
  credentials: true
}));
app.use(express.json());
app.use(cookieParser(SESSION_SECRET));

// --- Admin Auth ---
app.post('/api/admin-login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASS) {
    res.cookie('adminSession', 'yes', { httpOnly: true, sameSite: 'lax' });
    return res.json({ success: true });
  }
  res.status(401).json({ success: false, message: "Incorrect password" });
});
app.post('/api/admin-logout', (req, res) => {
  res.clearCookie('adminSession');
  res.json({ success: true });
});
function requireAdminAuth(req, res, next) {
  if (req.cookies.adminSession === 'yes') return next();
  res.status(401).json({ error: "Unauthorized" });
}

// --- Visitor Tracker ---
app.post('/api/visit', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const date = new Date().toISOString();
  const page = req.body.page || '-';
  visitors.push({ date, ip, page });
  res.json({ ok: true });
});
app.get('/api/visitors', (req, res) => {
  res.json(visitors);
});

// --- Admin Data APIs (protected) ---
app.get('/api/appointments', requireAdminAuth, (req, res) => res.json(appointments));
app.get('/api/estimates', requireAdminAuth, (req, res) => res.json(estimates));
app.get('/api/contacts', requireAdminAuth, (req, res) => res.json(contacts));

// --- Gallery APIs ---
app.get('/api/gallery', (req, res) => res.json(gallery));
// For real uploads use multer, here it's just a fake upload
app.post('/api/gallery/upload', requireAdminAuth, (req, res) => {
  // Simulate new gallery entry
  gallery.push({ url: "/gallery/fakeimg.jpg" });
  res.json({ gallery });
});

// --- Start Server ---
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
