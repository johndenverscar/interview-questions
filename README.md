# Interview Repository

A structured repository for technical interview materials including take-home assignments and pair programming exercises.

## Overview

This repository contains two types of interview scenarios:

- **Take-Home Interviews**: Full-stack assignments where candidates implement solutions from scratch
- **Pair Programming Interviews**: Debugging exercises focused on systematic problem-solving in existing codebases

## Repository Structure

### Take-Home Interviews

```
take-home/
├── <assignment-name>/
│   ├── README.md          # Assignment description and requirements
│   ├── solution/          # Candidate's implementation
│   └── evaluation/        # Assessment criteria and notes
```

Candidates have full autonomy over:
- Technology stack and framework choices
- Project architecture and design patterns
- Testing strategies and tooling

Evaluation focuses on:
- Code quality and maintainability
- Testing coverage and practices
- Documentation and clarity
- Production-readiness

### Pair Programming Interviews

```
pair-programming/
├── <problem-scenario>/
│   ├── README.md          # Problem description and debugging context
│   ├── src/               # Existing codebase with layered issues
│   ├── tests/             # Test suite (may be failing)
│   ├── setup/             # Environment setup scripts
│   └── solutions/         # Reference solutions and fixes
```

Focus areas:
- User permissions and role-based access control
- Licensing systems (expiration, seat limits, enforcement)
- Systematic debugging of layered problems
- Communication and collaborative problem-solving

## Scenario Examples

### Permission System Debugging
- Role inheritance calculation issues
- Circular dependency resolution
- Permission caching inconsistencies

### Licensing System Debugging
- License expiration and timezone handling
- Seat limit enforcement and race conditions
- Graceful degradation when limits exceeded

## Getting Started

Each interview scenario includes its own README with:
- Problem description and context
- Setup instructions
- Requirements and success criteria
- Expected deliverables (for take-home) or debugging goals (for pair programming)

## Technology Stacks

Common stacks used across scenarios:
- Node.js/TypeScript with Express or NestJS
- Python with Flask or FastAPI
- Java with Spring Boot
- Go with standard library or Gin

Specific requirements are documented in each scenario's README.
