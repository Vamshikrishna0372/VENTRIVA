# VENTRIVA — Founder & Startup Discovery Platform

VENTRIVA is an enterprise-grade platform connecting visionary founders with venture capital investors. It provides an end-to-end investment lifecycle platform—from startup discovery and due diligence to term sheets, fundraising rounds, investment closings, cap-table management, portfolio intelligence, and corporate governance.

---

## Complete Lifecycle Architecture (Phases 1–20)

1. **Authentication & Identity**: JWT-backed authentication with bcrypt password hashing and Role-Based Access Control (`founder`, `investor`, `admin`).
2. **Founder & Startup Management**: Venture profile creation, sector metrics, valuation tracking, ARR/MRR metrics, and discovery publishing.
3. **Investor Discovery & Evaluation**: Advanced search filters, multi-vector startup evaluations, comparison matrix, and deal pipeline management.
4. **Virtual Data Room & Due Diligence**: Role-gated document storage, access permissions, document requests, and access logging.
5. **Messaging & Meetings**: In-app encrypted messaging, meeting scheduling, video link integration, and calendar availability.
6. **Deal Rooms & Term Sheets**: Negotiation workspaces, term sheet versioning, counter-proposals, and binding acceptance.
7. **Fundraising Rounds & Commitments**: Round target configuration, investor invitations, syndicate allocations, and commitment tracking.
8. **Investment Closing & Cap Table**: Closing conditions checklist, legal document signatures, wire payment verification, transaction closure validation, active `Shareholding` tracking, and immutable `CapTableSnapshot` records.
9. **Portfolio Intelligence & Exits**: Portfolio valuation tracking, follow-on investment conversions, exit completion math, MOIC/IRR metrics, and risk intelligence alerts.
10. **Investor Strategy & Capital Allocation**: Strategy configuration, capital allocation tracking, conviction scoring, opportunity ranking, and portfolio scenario modeling.
11. **Shareholder & Corporate Governance**: Board director seats, meeting quorum checks, resolution voting with server-derived voting power, secondary share transfers, ESOP option pool allocations, compliance scoring, and immutable audit logs (`GovernanceActivity`).
12. **Production Hardening & Telemetry**: Request correlation tracing (`X-Request-ID`), Helmet security headers, rate limiting, NoSQL injection protection, health probes (`/api/health`), and structured logging.

---

## Technology Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM)
- **Frontend**: React 18, Vite, Vanilla CSS design system, Lucide React icons
- **Security**: JWT, bcrypt, Helmet, express-rate-limit, mongo-sanitize
- **Testing**: Node.js test runner suites (`test_phase20_final.js`, `test_release_candidate.js`, `test_phase19.js`, `test_phase18.js`, `test_phase17.js`)

---

## Operational Endpoints & Health Probes

- `GET /api/health` — Basic liveness probe
- `GET /api/health/ready` — MongoDB readiness probe
- `GET /api/health/version` — Release version
- `GET /api/health/detailed` — Database status, memory usage, and uptime metrics
- `GET /api/admin/system/health` — System administrator health dashboard

---

## Quick Start & Testing

### Development Server
```bash
# Start backend server
cd server
npm start

# Start frontend application
cd client
npm run dev
```

### Automated Production Audit Test Execution
```bash
# Execute Phase 20 Final Audit Test Suite (44 tests)
node server/test_phase20_final.js

# Execute Release Candidate Test Suite (30 critical E2E tests)
node server/test_release_candidate.js

# Execute Phase 19 Regression Suite (29 tests)
node server/test_phase19.js

# Execute Phase 18 Regression Suite (36 tests)
node server/test_phase18.js
```

### Frontend Production Build
```bash
cd client
npm run build
```

---

## Documentation Index

- [`docs/GOVERNANCE.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/GOVERNANCE.md)
- [`docs/BOARD_MANAGEMENT.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/BOARD_MANAGEMENT.md)
- [`docs/RESOLUTION_AND_VOTING.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/RESOLUTION_AND_VOTING.md)
- [`docs/SHARE_TRANSFER_WORKFLOW.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/SHARE_TRANSFER_WORKFLOW.md)
- [`docs/EQUITY_POOL_MANAGEMENT.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/EQUITY_POOL_MANAGEMENT.md)
- [`docs/COMPLIANCE_MANAGEMENT.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/COMPLIANCE_MANAGEMENT.md)
- [`docs/PRODUCTION_RELEASE_CHECKLIST.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/PRODUCTION_RELEASE_CHECKLIST.md)
- [`docs/OPERATIONS_RUNBOOK.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/OPERATIONS_RUNBOOK.md)
- [`docs/ROLLBACK_PLAN.md`](file:///c:/Users/Vamshikrishna/Desktop/Ventriva/docs/ROLLBACK_PLAN.md)
