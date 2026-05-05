---
name: security-guard
description: Security review and vulnerability scan of code. Use when asked to "security review", "find vulnerabilities", "check for security issues", "OWASP audit", "is this code safe", "security scan", "check for injection", "secrets scan", or "pen test this code".
---

# Security Guard

Perform a thorough security review. Work through each category systematically, flag every finding with severity, and provide a fix for each.

## OWASP Top 10 Checklist (2025)

### A01 — Broken Access Control
- Does every endpoint verify the caller is authorized (not just authenticated)?
- Are object-level checks done (user can only access their own resources)?
- Are admin routes protected separately from user routes?
- Is directory traversal possible via file path parameters?

### A02 — Cryptographic Failures
- No hardcoded secrets, API keys, passwords, or tokens in source
- No MD5/SHA1 for passwords — only bcrypt, argon2id, or scrypt
- Sensitive data encrypted at rest and in transit (TLS 1.2+ minimum)
- No `Math.random()` for security-sensitive randomness — use `crypto.randomBytes()`

### A03 — Injection
SQL: parameterized queries only — no string concatenation with user input
```js
// UNSAFE
db.query(`SELECT * FROM users WHERE id = ${userId}`)
// SAFE
db.query('SELECT * FROM users WHERE id = ?', [userId])
```
Command injection: never pass user input to `exec()`, `spawn()`, `eval()`
XSS: all user content escaped before rendering; use `textContent` not `innerHTML`
SSRF: validate and allowlist URLs before making server-side requests

### A04 — Insecure Design
- Error messages don't leak stack traces, file paths, or internal details to users
- Rate limiting on auth endpoints, search, and any expensive operations
- Brute force protection on login (lockout or CAPTCHA after N failures)

### A05 — Security Misconfiguration
- No default credentials in any configuration
- Debug mode disabled in production
- Security headers present: `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- CORS is restrictive — not `Access-Control-Allow-Origin: *` on authenticated endpoints

### A06 — Vulnerable Components
- Dependencies pinned to specific versions (not `^` or `*` ranges in prod)
- No packages with known CVEs (check with `npm audit` / `pip-audit` / `cargo audit`)
- No abandoned packages (last update > 2 years with no maintainer)

### A07 — Authentication Failures
- Session tokens are long (128-bit+ entropy), random, and invalidated on logout
- Passwords stored with adaptive hashing (bcrypt cost ≥ 12)
- JWT tokens: verify signature, check `exp`, don't store sensitive data in payload
- No predictable tokens or sequential IDs for password resets

### A08 — Software & Data Integrity
- No `eval()` or `new Function()` on user-controlled strings
- Serialized objects validated before deserialization
- Dependency integrity verified (use `integrity` attribute for CDN scripts)

### A09 — Logging & Monitoring
- Auth failures, permission denials, and validation errors are logged
- Logs don't contain passwords, tokens, or PII
- Critical operations have an audit trail (who did what, when)

### A10 — Server-Side Request Forgery (SSRF)
- URLs from user input are validated against an allowlist
- Internal IP ranges blocked: 10.x, 172.16–31.x, 192.168.x, 127.x, 169.254.x
- Response bodies from external requests are not reflected to users verbatim

## Secrets Detection Patterns

Flag any of these patterns in code:
```
sk-[a-zA-Z0-9]{40,}           # OpenAI API key
ghp_[a-zA-Z0-9]{36}           # GitHub token
AKIA[0-9A-Z]{16}              # AWS access key
-----BEGIN (RSA|EC) PRIVATE KEY # Private keys
password\s*=\s*["'][^"']+["'] # Hardcoded passwords
api[_-]?key\s*=\s*["'][^"']+ # API keys
```

## LLM / AI-Specific Security (if applicable)

- Prompt injection: user input is never directly concatenated into system prompts
- Tool calls: validate and sanitize all arguments before execution
- Excessive agency: LLM cannot call destructive operations without human confirmation
- Output is escaped before rendering (LLM output treated as untrusted user input)

## Output Format

```
## Critical (exploitable now)
- [Vulnerability] in [file:line]
  Risk: [what an attacker can do]
  Fix: [code snippet]

## High (exploitable with effort)
- [same format]

## Medium (defense in depth)
- [same format]

## Secrets Found
- [pattern] at [file:line] — rotate immediately

## Passed
- [checks that are clean]
```

$ARGUMENTS
