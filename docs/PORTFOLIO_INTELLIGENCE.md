# VENTRIVA Portfolio Intelligence & Risk Architecture

## Overview
Ventriva Portfolio Intelligence provides automated, deterministic risk alert detection and concentration analytics across active venture capital holdings.

## Risk Alert Rules
1. **Runway Risk**:
   - `Runway < 3 months`: **CRITICAL** alert priority.
   - `Runway 3–6 months`: **High** alert priority.
2. **Health Status Risk**:
   - `Critical` status (Score < 35/100): Triggers urgent founder preservation check-in alert.
   - `At Risk` status (Score 35–54/100): Triggers monthly watchlist monitoring alert.
3. **Follow-On Opportunity Detection**:
   - `Health Score >= 85` AND `MOIC >= 1.2x`: Identifies high-growth pro-rata participation opportunity.

## Concentration Analysis
- **Top 1 Holding Weight**: >50% triggers Critical risk rating; >35% triggers High.
- **Top 3 Holding Weight**: >80% triggers Critical risk rating; >65% triggers High.
- **Sector Distribution**: Aggregates holdings by industry vertical.
