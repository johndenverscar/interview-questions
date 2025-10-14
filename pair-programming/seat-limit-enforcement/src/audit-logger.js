class AuditLogger {
  constructor(db) {
    this.db = db;
  }

  async logSeatAllocation(organizationId, userId, details = '') {
    return this.logAction(organizationId, userId, 'SEAT_ALLOCATED', details);
  }

  async logSeatDeallocation(organizationId, userId, details = '') {
    return this.logAction(organizationId, userId, 'SEAT_DEALLOCATED', details);
  }

  async logSeatLimitExceeded(organizationId, userId, details = '') {
    return this.logAction(organizationId, userId, 'SEAT_LIMIT_EXCEEDED', details);
  }

  async logAction(organizationId, userId, action, details) {
    return new Promise((resolve, reject) => {
      // BUG: Missing error handling and transaction isolation
      this.db.run(
        `INSERT INTO seat_audit_log (organization_id, user_id, action, details)
         VALUES (?, ?, ?, ?)`,
        [organizationId, userId, action, details],
        function(err) {
          if (err) {
            // BUG: Silently failing - should propagate errors
            console.log('Audit log error:', err);
            resolve(false);
          } else {
            resolve(true);
          }
        }
      );
    });
  }

  async getAuditTrail(organizationId, limit = 100) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT al.*, u.username
         FROM seat_audit_log al
         LEFT JOIN users u ON al.user_id = u.id
         WHERE al.organization_id = ?
         ORDER BY al.timestamp DESC
         LIMIT ?`,
        [organizationId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }
}

module.exports = AuditLogger;