# Seat Limit Enforcement - Debugging Exercise

## Problem Description

Our SaaS application has a licensing system that limits the number of concurrent active users based on the customer's subscription plan. Recently, we've been getting reports that more users are active than the license allows, causing billing discrepancies and potential compliance issues.

## Symptoms Reported

1. **Customer A** (10-seat license): 15 users currently logged in and active
2. **Customer B** (50-seat license): Reports show 67 active sessions
3. **Customer C** (5-seat license): All seats "full" but only 2 users actually using the system

## Expected Behavior

- System should prevent new logins when seat limit is reached
- Inactive sessions should be cleaned up automatically after 30 minutes
- Seat count should accurately reflect truly active users
- Audit trail should track all seat allocation/deallocation events

## Your Task

Debug the system to identify and fix the issues causing incorrect seat counting. The codebase contains multiple layers of problems that compound the issue.

## Getting Started

1. Run `npm install` to set up dependencies
2. Run `npm run setup:db` to initialize the test database
3. Run `npm test` to see the current failing tests
4. Start with `src/app.js` to understand the system architecture

## Test Scenarios

The test suite includes scenarios for:
- Normal login/logout flows
- Session timeout handling
- Concurrent user management
- License limit enforcement

Look for patterns in the failing tests to guide your debugging approach.