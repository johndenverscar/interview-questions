class SeatLimitService {
  constructor(db) {
    this.db = db;
  }

  async checkSeatAvailability(organizationId) {
    try {
      const org = await this.getOrganization(organizationId);
      if (!org) return false;

      const activeSessions = await this.getActiveSessionCount(organizationId);

      // BUG: Off-by-one error - should be >= not >
      return activeSessions > org.seat_limit;
    } catch (error) {
      console.error('Seat availability check error:', error);
      return false;
    }
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
      // BUG: This query doesn't filter out inactive sessions properly
      // and has a race condition with concurrent operations
      this.db.get(
        `SELECT COUNT(*) as count
         FROM active_sessions s
         JOIN users u ON s.user_id = u.id
         WHERE u.organization_id = ?`,
        [organizationId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count);
        }
      );
    });
  }

  // BUG: Missing method to handle seat allocation atomically
  // This should be a transaction to prevent race conditions
}

module.exports = SeatLimitService;