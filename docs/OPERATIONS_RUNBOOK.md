# VENTRIVA — Production Operations & Monitoring Runbook

## 1. Operational Endpoints
- **Health Probe**: `GET /api/health` — Basic liveness probe.
- **Readiness Probe**: `GET /api/health/ready` — MongoDB readiness probe.
- **Version Info**: `GET /api/health/version` — Application release version.
- **Detailed System Telemetry**: `GET /api/health/detailed` — Database status, memory utilization, and uptime metrics.
- **Admin System Health**: `GET /api/admin/system/health` — Platform administrator health dashboard.

## 2. Background Jobs & Maintenance
- **Job Runner**: Background scheduled runner (`server/jobs/jobRunner.js`).
- **Notification Cleanup Job**: Periodically cleans up expired notifications (`notificationCleanupJob.js`).
- **Document Cleanup Job**: Removes orphaned temporary file uploads (`documentCleanupJob.js`).
- **Analytics Cache Cleanup**: Flushes expired analytics aggregation caches (`analyticsCacheCleanupJob.js`).

## 3. Log Management & Diagnostics
- Log format: JSON structured logging with correlation request ID (`X-Request-ID`).
- Log redaction: Passwords, JWT secrets, private notes, and raw documents are automatically redacted from server logs.
