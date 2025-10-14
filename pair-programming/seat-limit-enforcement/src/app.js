const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const SessionManager = require('./session-manager');
const SeatLimitService = require('./seat-limit-service');
const AuditLogger = require('./audit-logger');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, '..', 'database.db');
const db = new sqlite3.Database(dbPath);

const sessionManager = new SessionManager(db);
const seatLimitService = new SeatLimitService(db);
const auditLogger = new AuditLogger(db);

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Get user info
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check seat availability - BUG: Not checking properly
    const canLogin = await seatLimitService.checkSeatAvailability(user.organization_id);
    if (!canLogin) {
      return res.status(403).json({ error: 'No seats available' });
    }

    // Create session
    const sessionToken = await sessionManager.createSession(user.id);

    // Log the seat allocation - BUG: Missing audit log

    res.json({
      token: sessionToken,
      user: { id: user.id, username: user.username }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Logout endpoint
app.post('/api/logout', async (req, res) => {
  const { token } = req.body;

  try {
    const session = await sessionManager.getSessionByToken(token);
    if (session) {
      await sessionManager.destroySession(token);
      // BUG: Not logging seat deallocation
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get organization seat status
app.get('/api/organization/:id/seats', async (req, res) => {
  const orgId = parseInt(req.params.id);

  try {
    const seatInfo = await seatLimitService.getSeatStatus(orgId);
    res.json(seatInfo);
  } catch (error) {
    console.error('Seat status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to get user by username
function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM users WHERE username = ?',
      [username],
      (err, row) => {
        if (err) reject(err);
        else resolve(row);
      }
    );
  });
}

// Start cleanup interval - BUG: Cleanup not working properly
setInterval(() => {
  sessionManager.cleanupInactiveSessions();
}, 5 * 60 * 1000); // Every 5 minutes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;