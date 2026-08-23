# VENTRIVA — Board Resolutions & Voting Engine

## Overview
The Voting Engine calculates voting power server-side from persisted shareholder ownership and board rights, preventing unauthorized or duplicate votes.

## Resolution Lifecycle
1. `Draft` -> `Proposed` -> `Voting` -> `Approved` / `Rejected` / `Withdrawn` / `Expired`.

## Security Rules
- Voting power is strictly derived on the backend; client-supplied voting power values are ignored.
- Compound unique MongoDB index `(resolution, voter)` prevents duplicate votes.
- Votes submitted after `votingEndDate` or on closed resolutions are rejected.
