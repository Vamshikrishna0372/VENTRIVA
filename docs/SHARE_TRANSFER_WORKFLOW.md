# VENTRIVA — Secondary Share Transfer Workflow

## Overview
Manages secondary share sales and transfers between shareholders, ensuring seller ownership validation and automatic cap-table synchronization.

## Transfer Lifecycle & Automation
1. Proposal created with transferor, buyer, share count, and price per share.
2. Validation checks seller ownership balance (`sharesOwned >= transferShares`).
3. Upon execution:
   - Updates `Shareholder` balances.
   - Rebalances active `Shareholding` equity percentages.
   - Creates Phase 15 `OwnershipEvent` record (`Secondary Purchase`).
   - Generates Phase 18 `CapTableSnapshot`.
   - Logs immutable `GovernanceActivity` record.
