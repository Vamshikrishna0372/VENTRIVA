# VENTRIVA Exit & Realized Return Management

## Overview
Ventriva tracks venture exit events including Acquisitions, IPOs, Secondary Sales, Buybacks, Mergers, and Write-Offs.

## Realized Return Calculations
- **Realized Gain**: `Exit Value - Total Invested Capital`
- **Realized MOIC**: `Exit Value / Total Invested Capital`

## Exit Completion Execution (`POST /api/exits/:id/complete`)
1. `ExitEvent.exitStatus` transitions to `Completed`.
2. `Investment.investmentStatus` updates to `Exited` or `Written Off`.
3. `Investment.realizedValue` records total proceeds.
4. `Investment.currentValue` resets to `0`.
5. `Investment.ownershipPercentage` resets to `0`.
6. An `OwnershipEvent` (`Full Exit`) is published.
7. An immutable `PortfolioActivity` audit entry is created.
