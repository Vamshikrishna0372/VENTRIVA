# Ventriva Database Backup & Recovery Procedure

## Backup Strategy
- **Continuous Backups**: Enable MongoDB Atlas Point-in-Time Recovery (PITR).
- **Daily Snapshots**: Automated daily database dumps using `mongodump`.

## Backup Command Example
```bash
mongodump --uri="mongodb+srv://<user>:<password>@cluster.mongodb.net/ventriva" --out=/backups/ventriva-$(date +%Y%m%d)
```

## Restoration Command Example
```bash
mongorestore --uri="mongodb+srv://<user>:<password>@cluster.mongodb.net/ventriva" /backups/ventriva-20260819/ventriva
```

## Post-Restoration Verification
1. Run Index Audit: `node server/scripts/auditIndexes.js`
2. Run Data Integrity Audit: `node server/scripts/auditDataIntegrity.js`
3. Check Database Readiness Probe: `GET /api/health/ready`
