# VENTRIVA — Production Release Gate Checklist

## 1. Architecture & Core Readiness
- [x] Node.js Express server starts cleanly with production environment variables (`NODE_ENV=production`).
- [x] Vite React frontend compiles with 0 compilation errors or unresolved imports.
- [x] MongoDB database connection established with index creation enabled.
- [x] Correlation request tracing middleware (`X-Request-ID`) attached to all HTTP endpoints.

## 2. Security & Access Control
- [x] JWT authentication and password hashing (bcrypt) active.
- [x] Strict Role-Based Access Control (RBAC) enforced across `founder`, `investor`, and `admin` roles.
- [x] Resource ownership isolation verified (users cannot access cross-startup or cross-portfolio data by altering URL IDs).
- [x] Express Helmet security headers and CORS origin restrictions active.
- [x] NoSQL query injection protection and input validation active.
- [x] Sensitive data (passwords, JWTs, stack traces) redacted from production logs and error responses.

## 3. Financial & Cap Table Invariants
- [x] Ownership percentage strictly bounded (`0% <= ownership <= 100%`).
- [x] Mathematical calculations protected against division by zero (NaN and Infinity prevented).
- [x] Cap table changes trigger `OwnershipEvent`, `CapTableSnapshot`, and `Shareholding` rebalancing.
- [x] Idempotency middleware prevents duplicate financial submissions.

## 4. Workflows & Integrations
- [x] End-to-end workflows verified: Discovery -> Due Diligence -> Deal Rooms -> Term Sheets -> Fundraising -> Closing -> Cap Table -> Portfolio -> Governance.
- [x] Background job runner (`jobRunner`) executes scheduled cleanup tasks cleanly.
- [x] Health check endpoints (`/api/health`, `/api/health/ready`, `/api/health/version`, `/api/health/detailed`) operational.
