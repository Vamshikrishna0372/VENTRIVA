# VENTRIVA — Production Rollback & Emergency Recovery Plan

## 1. Rollback Triggers
- Unhandled critical API failures (5xx error rate > 1%).
- Unresolved database index corruption or migration failure.
- Security incident or unauthorized data access flaw.

## 2. Emergency Recovery Steps
1. **Traffic Suspension**: Reroute ingress gateway traffic to static maintenance page.
2. **Backend Rollback**: Revert deployment container/process to previous release artifact version.
3. **Database Restore**:
   - Restore MongoDB backup snapshot using `mongorestore` if schema mutation occurred.
   - Run `node server/scripts/auditIndexes.js` to verify database index health.
   - Run `node server/scripts/auditDataIntegrity.js` to verify cap table and financial invariants.
4. **Verification**: Execute `node server/test_release_candidate.js` to confirm full recovery before reopening ingress traffic.
