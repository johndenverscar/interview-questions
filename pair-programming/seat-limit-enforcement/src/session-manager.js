const { v4: uuidv4 } = require('uuid');

class SessionManager {
  constructor(db) {
    this.db = db;
  }

  async createSession(userId) {
    const sessionToken = uuidv4();

    return new Promise((resolve, reject) => {
      // BUG: Not checking for existing active sessions for the same user
      this.db.run(
        'INSERT INTO active_sessions (user_id, session_token, last_activity) VALUES (?, ?, datetime("now"))',
        [userId, sessionToken],
        function(err) {
          if (err) reject(err);
          else resolve(sessionToken);
        }
      );
    });
  }

  async destroySession(sessionToken) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM active_sessions WHERE session_token = ?',
        [sessionToken],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  async getSessionByToken(sessionToken) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM active_sessions WHERE session_token = ?',
        [sessionToken],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async updateLastActivity(sessionToken) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE active_sessions SET last_activity = datetime("now") WHERE session_token = ?',
        [sessionToken],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  async cleanupInactiveSessions() {
    // BUG: Incorrect timeout calculation - using wrong time comparison
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM active_sessions
         WHERE last_activity < datetime('now', '-30 minutes')`,
        function(err) {
          if (err) {
            console.error('Cleanup error:', err);
            reject(err);
          } else {
            console.log(`Cleaned up ${this.changes} inactive sessions`);
            resolve(this.changes);
          }
        }
      );
    });
  }

  async getActiveSessionsForOrganization(organizationId) {
    return new Promise((resolve, reject) => {
      // BUG: This query has a race condition and doesn't account for cleanup timing
      this.db.all(
        `SELECT s.*, u.organization_id
         FROM active_sessions s
         JOIN users u ON s.user_id = u.id
         WHERE u.organization_id = ?`,
        [organizationId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = SessionManager;