const request = require('supertest');
const app = require('../src/app');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

describe('Seat Limit Enforcement', () => {
  let db;

  beforeAll(async () => {
    // Initialize test database
    const dbPath = path.join(__dirname, '..', 'database.db');
    db = new sqlite3.Database(dbPath);

    // Clean up any existing sessions
    await new Promise((resolve) => {
      db.run('DELETE FROM active_sessions', resolve);
    });
  });

  afterAll(async () => {
    if (db) {
      db.close();
    }
  });

  beforeEach(async () => {
    // Clean up sessions before each test
    await new Promise((resolve) => {
      db.run('DELETE FROM active_sessions', resolve);
    });
  });

  describe('Basic Seat Limiting', () => {
    test('should allow login when seats available', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'alice_brown', password: 'password' }); // Small Biz LLC (5 seats)

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
    });

    test('should reject login when seat limit exceeded', async () => {
      // Fill up all 5 seats for Small Biz LLC (org_id: 3)
      const users = ['alice_brown', 'charlie_davis'];

      // Create 5 active sessions manually to simulate full capacity
      for (let i = 1; i <= 5; i++) {
        await new Promise((resolve) => {
          db.run(
            'INSERT INTO active_sessions (user_id, session_token, last_activity) VALUES (?, ?, datetime("now"))',
            [4, `token-${i}`, ], // alice_brown's user_id is 4
            resolve
          );
        });
      }

      // This should fail
      const response = await request(app)
        .post('/api/login')
        .send({ username: 'charlie_davis', password: 'password' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('No seats available');
    });
  });

  describe('Session Cleanup', () => {
    test('should clean up inactive sessions automatically', async (done) => {
      // Create an old session (simulate 1 hour ago)
      await new Promise((resolve) => {
        db.run(
          'INSERT INTO active_sessions (user_id, session_token, last_activity) VALUES (?, ?, datetime("now", "-1 hour"))',
          [4, 'old-token'],
          resolve
        );
      });

      // Verify session exists
      const beforeCleanup = await new Promise((resolve) => {
        db.get(
          'SELECT COUNT(*) as count FROM active_sessions WHERE session_token = ?',
          ['old-token'],
          (err, row) => resolve(row.count)
        );
      });
      expect(beforeCleanup).toBe(1);

      // Wait for cleanup cycle (this test may be flaky due to timing)
      setTimeout(async () => {
        const afterCleanup = await new Promise((resolve) => {
          db.get(
            'SELECT COUNT(*) as count FROM active_sessions WHERE session_token = ?',
            ['old-token'],
            (err, row) => resolve(row.count)
          );
        });
        expect(afterCleanup).toBe(0);
        done();
      }, 1000);
    });
  });

  describe('Concurrent Users', () => {
    test('should handle multiple simultaneous logins correctly', async () => {
      // Simulate multiple users trying to login at the same time
      const loginPromises = [];
      for (let i = 0; i < 3; i++) {
        loginPromises.push(
          request(app)
            .post('/api/login')
            .send({ username: 'alice_brown', password: 'password' })
        );
      }

      const responses = await Promise.all(loginPromises);

      // All should succeed since we have 5 seats available
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // But check actual seat count
      const seatStatus = await request(app)
        .get('/api/organization/3/seats');

      expect(seatStatus.body.activeSeats).toBeLessThanOrEqual(5);
    });
  });

  describe('Audit Trail', () => {
    test('should log seat allocation events', async () => {
      await request(app)
        .post('/api/login')
        .send({ username: 'alice_brown', password: 'password' });

      // Check if audit log entry was created
      const auditEntries = await new Promise((resolve) => {
        db.all(
          'SELECT * FROM seat_audit_log WHERE organization_id = 3 AND action = "SEAT_ALLOCATED"',
          (err, rows) => resolve(rows)
        );
      });

      expect(auditEntries.length).toBeGreaterThan(0);
    });
  });
});