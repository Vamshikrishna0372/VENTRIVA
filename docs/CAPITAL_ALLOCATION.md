# VENTRIVA Capital Allocation & Deployment Planning

## Overview
Ventriva Capital Allocation allows VCs and angels to plan quarterly deployment budgets across initial check sizes and follow-on reserves.

## Over-Allocation Protection
- Proposed check size allocations (`totalProposedCapital`) cannot exceed available capital (`totalAvailableCapital`).
- Violations return `HTTP 400 Bad Request`.
