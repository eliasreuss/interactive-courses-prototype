---
name: clean-code
description: Review and refactor code for quality, clarity, and maintainability. Use when asked to "clean up this code", "refactor", "code review", "improve code quality", "reduce complexity", "remove dead code", "make this more readable", or "code smell".
---

# Clean Code

Review the provided code for quality issues, then refactor. Apply all checks below. Output: findings first, then the refactored code.

## 1. Naming

- Variables, functions, and classes have names that describe what they are or do
- Boolean variables/functions use `is`, `has`, `can`, `should` prefix
- Functions do one thing; if the name includes "and", split it
- No single-letter variables except loop indices (`i`, `j`) and math (`x`, `y`)
- No abbreviations that aren't universally understood (`usr`, `proc`, `tmp`, `mgr`)

## 2. Function Quality

Ideal function:
- Does one thing
- Has ≤ 3 parameters (more = pass an object)
- Is ≤ 20 lines
- Has no side effects beyond what its name implies
- Returns a value or mutates state — not both

Flags:
- Functions over 30 lines — split them
- Boolean parameters that control behavior (`doThing(true)`) — split into two functions
- Output parameters (passing object to be mutated) — return instead
- Nested ternaries — use if/else or early returns

## 3. Conditionals

Prefer early returns over deep nesting:
```js
// Bad
function process(user) {
  if (user) {
    if (user.active) {
      if (user.role === 'admin') {
        // actual logic buried here
      }
    }
  }
}

// Good
function process(user) {
  if (!user) return
  if (!user.active) return
  if (user.role !== 'admin') return
  // actual logic at top level
}
```

Never use magic numbers — extract to named constants:
```js
// Bad
if (score > 750) ...
// Good
const CREDIT_APPROVAL_THRESHOLD = 750
if (score > CREDIT_APPROVAL_THRESHOLD) ...
```

## 4. DRY (Don't Repeat Yourself)

- Three identical code blocks = extract a function
- Repeated conditional logic = extract a predicate
- Repeated data structures = extract a type/schema
- But: don't abstract prematurely — wait for the third instance

## 5. Error Handling

- Handle errors where you can recover; let them propagate where you can't
- Don't catch an error and do nothing (`catch (e) {}`)
- Don't catch an error just to re-throw the same error
- Error messages include what failed and why, not just "Something went wrong"
- Validation happens at boundaries (user input, API responses), not inside business logic

## 6. Dead Code

Remove without mercy:
- Commented-out code (git history preserves it)
- Unreachable code after `return` / `throw`
- Unused imports, variables, parameters, exports
- Feature-flagged code where the flag is permanently on

## 7. Complexity Metrics

Target for each function:
- Cyclomatic complexity ≤ 10 (number of independent paths)
- Cognitive complexity ≤ 15 (how hard it is to understand)
- Nesting depth ≤ 3 levels

Any function exceeding these limits gets refactored: extract sub-functions, invert conditions, use polymorphism over switch statements.

## 8. SOLID Principles (object-oriented code)

- **S** — Single Responsibility: one class/module = one reason to change
- **O** — Open/Closed: extend behavior without modifying existing code
- **L** — Liskov: subclasses can replace base classes without breaking callers
- **I** — Interface Segregation: don't force classes to implement methods they don't use
- **D** — Dependency Inversion: depend on abstractions, not concretions

## 9. Comments

Write a comment only when the WHY is non-obvious. Delete all others.

```js
// Bad: restates what the code does
// increment counter
counter++

// Good: explains a non-obvious constraint
// offset by 1 because the API uses 1-based pagination
const page = requestedPage + 1
```

## Output Format

```
## Issues Found

### Naming
- [file:line] — [issue] → [suggestion]

### Complexity
- [function name] — cyclomatic complexity [N], target ≤ 10 → [refactoring approach]

### Dead Code
- [file:line] — [what to remove]

### DRY Violations
- [locations] — [what to extract]

## Refactored Code

[Full refactored version with no explanatory comments — clean code explains itself]

## What Changed
[3–5 bullet points: the meaningful changes only]
```

$ARGUMENTS
