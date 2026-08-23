# Ventriva Disaster Recovery Plan

## Target Operational Parameters
- **Recovery Point Objective (RPO)**: < 1 hour
- **Recovery Time Objective (RTO)**: < 4 hours

## Failure Scenarios & Action Protocols

### 1. MongoDB Database Outage
1. Inspect MongoDB Atlas cluster state or local service logs.
2. If primary cluster fails, trigger failover to secondary replica set node.
3. Verify readiness probe: `GET /api/health/ready` returns HTTP 200.

### 2. Application Server Crash
1. Node.js process manager (PM2 / Systemd) auto-restarts failed instance.
2. Review structured error logs (`loggerService.js`).
3. Check system metrics endpoint (`GET /api/admin/system/metrics`).

### 3. File Storage Corruption
1. Run orphaned storage detector: `node server/jobs/documentCleanupJob.js` (with `DRY_RUN=true`).
2. Restore missing files from object storage backup snapshots.
