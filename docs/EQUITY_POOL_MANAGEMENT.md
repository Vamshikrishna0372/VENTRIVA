# VENTRIVA — Equity Option Pool (ESOP) Administration

## Overview
Tracks ESOP equity option pools, allocated shares, available shares, and option grants.

## Validation Bounds
- `allocatedShares + availableShares == totalShares`
- Allocation fails if `sharesToAllocate > availableShares`.
- Option pool adjustments log audit activity events.
