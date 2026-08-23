# VENTRIVA Follow-On Investment Workflow

## Overview
Ventriva supports pro-rata and follow-on investment tracking from proposal to capital deployment and cap table conversion.

## State Machine Workflow
`Proposed` $\rightarrow$ `Under Review` $\rightarrow$ `Approved` / `Declined` $\rightarrow$ `Completed`

## Conversion Engine
When an approved follow-on opportunity is converted via `POST /api/follow-on-investments/:id/convert`:
1. `Investment.followOnInvested` increases by follow-on amount.
2. `Investment.totalInvested` updates (`investmentAmount` + `followOnInvested`).
3. `Investment.ownershipPercentage` updates to new post-round stake.
4. An `OwnershipEvent` audit record is automatically logged.
5. A `PortfolioActivity` entry is published to the immutable audit timeline.
