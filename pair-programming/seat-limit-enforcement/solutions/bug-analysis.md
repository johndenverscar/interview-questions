# Seat Limit Enforcement - Bug Analysis & Solutions

## Identified Issues (Layered Problems)

### Layer 1: Concurrent User Counting Errors

**Location**: `src/seat-limit-service.js:13`
**Problem**: Off-by-one error in seat availability check
```javascript
// BUG: Should be >= not >
return activeSessions > org.seat_limit;
```
**Solution**: Change to `activeSessions >= org.seat_limit`

**Location**: `src/seat-limit-service.js:37-44`
**Problem**: Query doesn't filter out inactive sessions
```javascript
// Missing WHERE clause to filter inactive sessions
SELECT COUNT(*) as count
FROM active_sessions s
JOIN users u ON s.user_id = u.id
WHERE u.organization_id = ?
```
**Solution**: Add time-based filtering for active sessions

### Layer 2: Race Conditions in Seat Allocation

**Location**: `src/session-manager.js:8-18`
**Problem**: Not checking for existing sessions before creating new ones
```javascript
// BUG: Not checking for existing active sessions for the same user
this.db.run('INSERT INTO active_sessions...')
```
**Solution**: Check for existing sessions and implement atomic operations

**Location**: `src/seat-limit-service.js` (missing method)
**Problem**: Missing atomic seat allocation method
**Solution**: Implement transaction-based seat allocation to prevent race conditions

### Layer 3: Cleanup of Inactive Sessions

**Location**: `src/session-manager.js:55-68`
**Problem**: Cleanup query timing and execution
```javascript
// BUG: Cleanup may not run frequently enough or consistently
WHERE last_activity < datetime('now', '-30 minutes')
```
**Solution**: Improve cleanup frequency and add proper error handling

**Location**: `src/session-manager.js:70-84`
**Problem**: Race condition between seat checking and cleanup
**Solution**: Coordinate cleanup with seat availability checks

### Layer 4: Audit Trail Inconsistencies

**Location**: `src/app.js:27` and `src/app.js:47`
**Problem**: Missing audit logging for seat allocation/deallocation
```javascript
// BUG: Missing audit log
// Log the seat allocation - BUG: Missing audit log
```
**Solution**: Add proper audit logging for all seat operations

**Location**: `src/audit-logger.js:32-40`
**Problem**: Silently failing audit logs
```javascript
// BUG: Silently failing - should propagate errors
console.log('Audit log error:', err);
resolve(false);
```
**Solution**: Proper error handling and transaction rollback

## Expected Debugging Approach

### Step 1: Identify the Core Issue
- Run tests to see failing scenarios
- Check seat count discrepancies
- Review current session data

### Step 2: Fix the Logic Errors
- Correct the off-by-one error in seat checking
- Fix the session counting query
- Add proper session deduplication

### Step 3: Address Race Conditions
- Implement atomic operations for seat allocation
- Add proper locking mechanisms
- Coordinate cleanup with allocation checks

### Step 4: Fix Audit and Monitoring
- Add comprehensive audit logging
- Implement proper error handling
- Ensure transaction consistency

## Evaluation Criteria

### Technical Skills
- **Problem Identification**: Can candidate spot the layered issues?
- **Debugging Approach**: Systematic vs. random debugging
- **SQL Knowledge**: Understanding of database queries and transactions
- **Concurrency Awareness**: Recognition of race conditions

### Communication Skills
- **Problem Explanation**: Can clearly articulate what they found
- **Solution Rationale**: Explains why their fixes address the root cause
- **Testing Strategy**: Describes how to verify fixes

### Code Quality
- **Fix Implementation**: Clean, maintainable solutions
- **Error Handling**: Proper error handling and logging
- **Performance Considerations**: Understands impact of changes

## Red Flags
- Only fixes surface-level issues without understanding underlying problems
- Doesn't recognize race conditions or concurrency issues
- Suggests band-aid solutions instead of systematic fixes
- Poor communication about their debugging process