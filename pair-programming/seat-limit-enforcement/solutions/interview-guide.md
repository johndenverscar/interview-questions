# Seat Limit Enforcement - Interview Guide

## Interview Structure (60 minutes)

### Introduction (5 minutes)
- Explain the scenario and business context
- Show the failing tests and symptoms
- Set expectations for collaborative debugging

### Phase 1: Problem Discovery (15 minutes)
**Goal**: Assess candidate's debugging approach and problem identification skills

**Guided Questions**:
- "Let's start by understanding what's happening. What would you do first?"
- "What do you notice about these test failures?"
- "How would you investigate the seat counting discrepancy?"

**Look For**:
- Systematic approach to debugging
- Reading and understanding test failures
- Checking database state and logs
- Understanding the business logic

### Phase 2: Root Cause Analysis (20 minutes)
**Goal**: Evaluate technical depth and understanding of layered problems

**Guided Questions**:
- "What do you think is causing the seat count to be wrong?"
- "Are there any race conditions or timing issues you can identify?"
- "How does the session cleanup affect seat availability?"

**Look For**:
- Recognition of the off-by-one error
- Understanding of database query issues
- Awareness of concurrency problems
- Recognition of missing audit logging

### Phase 3: Solution Implementation (15 minutes)
**Goal**: Assess coding skills and solution quality

**Activities**:
- Fix the most critical bugs together
- Discuss approach for remaining issues
- Talk through testing strategy

**Look For**:
- Clean, correct code changes
- Understanding of transactions and atomicity
- Proper error handling
- Consideration of edge cases

### Phase 4: Architecture Discussion (5 minutes)
**Goal**: Evaluate system design thinking

**Questions**:
- "How would you prevent these issues in a production system?"
- "What monitoring would you add?"
- "How would you handle this at scale?"

## Scoring Framework

### Excellent (4/4)
- Identifies all major bug categories systematically
- Understands race conditions and proposes atomic solutions
- Writes clean, correct fixes with proper error handling
- Discusses monitoring and prevention strategies

### Good (3/4)
- Identifies most bugs with some guidance
- Recognizes concurrency issues but may need help with solutions
- Implements correct fixes but may miss edge cases
- Shows good understanding of system implications

### Satisfactory (2/4)
- Finds obvious bugs but misses deeper issues
- Fixes symptoms but may not address root causes
- Code works but may lack proper error handling
- Basic understanding of the problem domain

### Needs Improvement (1/4)
- Struggles to identify problems systematically
- Focuses on surface issues only
- Fixes create new bugs or don't address the core problems
- Limited understanding of concurrency or database issues

## Key Differentiators

### Strong Candidates
- Immediately look at tests and understand the business context
- Systematically trace through the code to understand data flow
- Recognize that multiple issues compound the problem
- Propose comprehensive solutions, not just patches

### Red Flags
- Jump to conclusions without investigation
- Only fix the first bug they find
- Don't consider concurrency or timing issues
- Suggest overly complex solutions for simple problems

## Follow-up Questions for Strong Candidates

1. "How would you implement this using a message queue or event-driven architecture?"
2. "What would a monitoring dashboard for this system look like?"
3. "How would you handle license upgrades/downgrades in real-time?"
4. "What database schema changes might improve performance at scale?"

## Adaptations for Different Experience Levels

### Junior Developers
- Provide more guidance on where to look
- Focus on basic debugging skills and code reading
- Help them understand the business context
- Emphasize learning from the experience

### Senior Developers
- Expect them to drive the investigation
- Ask about architecture and design patterns
- Discuss production deployment and monitoring
- Explore scalability and performance implications