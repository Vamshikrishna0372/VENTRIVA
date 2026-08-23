# VENTRIVA - Fundraising Rounds Architecture

## Overview
The Fundraising Round module allows founders to define and structure equity or note capital raises (Pre-Seed, Seed, Series A, Series B, SAFE, Convertible Note).

## Controlled Enum Values
- **Round Types**: Pre-Seed, Seed, Series A, Series B, Series C, Bridge, SAFE, Convertible Note, Other
- **Round Statuses**: Draft, Open, Soft Commitments, In Due Diligence, Term Sheet Stage, Closing, Closed, Cancelled
- **Investor Roles**: Lead Investor, Co-Investor, Participant

## Financial Constraints & Bounds
- `targetAmount` must be > 0.
- `minimumTicketSize` <= `maximumTicketSize`.
- `preMoneyValuation` >= 0.
- `committedAmount` and `fundedAmount` automatically calculated via MongoDB aggregation.

## Access Rules
- **Founder**: Can create, update draft/open configuration, open, close, cancel, and view round analytics.
- **Investor**: Can view public open/closing rounds and rounds where explicitly invited.
- **Admin**: System-wide governance and audit access.
