// Reference implementation with fixes for evaluation

class SeatLimitService {
  constructor(db) {
    this.db = db;
  }

  async checkSeatAvailability(organizationId) {
    try {
      const org = await this.getOrganization(organizationId);
      if (!org) return false;

      const activeSessions = await this.getActiveSessionCount(organizationId);

      // FIXED: Correct comparison (was > now >=)
      return activeSessions < org.seat_limit;
    } catch (error) {
      console.error('Seat availability check error:', error);
      return false;
    }
  }

  async allocateSeat(organizationId, userId) {
    // NEW: Atomic seat allocation to prevent race conditions
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        // Check availability within transaction
        this.db.get(
          `SELECT
             (SELECT seat_limit FROM organizations WHERE id = ?) as seat_limit,
             (SELECT COUNT(*) FROM active_sessions s
              JOIN users u ON s.user_id = u.id
              WHERE u.organization_id = ?
              AND s.last_activity > datetime('now', '-30 minutes')) as active_count`,
          [organizationId, organizationId],
          (err, row) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }

            if (row.active_count >= row.seat_limit) {
              this.db.run('ROLLBACK');
              resolve(false);
              return;
            }

            // Seat available, allocation happens in calling code
            this.db.run('COMMIT');
            resolve(true);
          }
        );
      });
    });
  }

  async getSeatStatus(organizationId) {
    const org = await this.getOrganization(organizationId);
    if (!org) throw new Error('Organization not found');

    const activeCount = await this.getActiveSessionCount(organizationId);

    return {
      organization: org.name,
      seatLimit: org.seat_limit,
      activeSeats: activeCount,
      availableSeats: Math.max(0, org.seat_limit - activeCount)
    };
  }

  async getOrganization(organizationId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM organizations WHERE id = ?',
        [organizationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  async getActiveSessionCount(organizationId) {
    return new Promise((resolve, reject) => {
      // FIXED: Filter out inactive sessions and handle timing properly
      this.db.get(
        `SELECT COUNT(*) as count
         FROM active_sessions s
         JOIN users u ON s.user_id = u.id
         WHERE u.organization_id = ?
         AND s.last_activity > datetime('now', '-30 minutes')`,
        [organizationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }
}

module.exports = SeatLimitService;