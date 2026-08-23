# VENTRIVA Investment Decision Engine

## Overview
Ventriva Investment Decision records capture private investment committee rationale, conviction scores (0–100), and key risk/upside factors.

## Decision State Machine
`Draft` $\rightarrow$ `Recommended` $\rightarrow$ `Approved` / `Rejected` $\rightarrow$ `Executed` / `Superseded`

## Privacy Rules
Decision rationale and conviction scores are 100% private to the investor. Unlisted users receive `HTTP 403 Forbidden`.
