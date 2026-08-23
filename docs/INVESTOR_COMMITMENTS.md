# VENTRIVA - Investor Commitments & Capital Validation

## Overview
The Investor Commitment system records soft and firm investment check commitments submitted by investors during a startup's active fundraising round.

## Workflow Statuses
- **Interested**
- **Invited**
- **Soft Committed**
- **Due Diligence**
- **Term Sheet Proposed**
- **Committed**
- **Declined**
- **Withdrawn**
- **Funded**

## Integration with Phase 16 Strategy & Capital Allocation
Before accepting or creating a commitment:
1. Validates against investor's active `InvestorStrategy` check size limits.
2. Validates against investor's `CapitalAllocationPlan` remaining available capital.
3. Prevents over-allocation errors with clear HTTP 400 validation responses.
4. Commitment records do NOT mutate deployed investment capital directly until Deal Room execution.
