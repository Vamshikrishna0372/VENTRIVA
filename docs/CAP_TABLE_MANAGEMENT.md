# VENTRIVA — Cap Table Management Engine

## Overview
The Cap Table Management module maintains real-time equity shareholding breakdown, share class allocation, and immutable historical snapshot ledgers.

## Mathematical Engine Rules
- **Post-Money Valuation**: `Pre-Money Valuation + Investment Amount`
- **Ownership Percentage**: `(Investment Amount / Post-Money Valuation) * 100`
- **Share Price**: `Pre-Money Valuation / Total Shares Before`
- **Shares Issued**: `Math.round(Investment Amount / Share Price)`
- **Total Shares After**: `Total Shares Before + Shares Issued`

## Cap Table Snapshots
Upon transaction completion (`Closed`), an immutable `CapTableSnapshot` record is created, locking historical valuation, share prices, pre-transaction ownership, and post-transaction dilution.
