# VENTRIVA - Fundraising Security & Data Isolation Architecture

## RBAC & Data Privacy Rules
1. **Founder Isolation**: Founders can only access fundraising rounds for startups they own. Founders CANNOT view private investor strategy calculations, allocation plans, or internal notes.
2. **Investor Isolation**: Investors can only view commitments they submitted unless authorized as round participants. Investors CANNOT view other investors' private notes or allocation limits.
3. **Idempotency Protection**: All write POST endpoints require `idempotency-key` protection to prevent duplicate rounds, commitments, or invitations.
4. **NoSQL Sanitization**: Input parameters pass through express NoSQL parameter sanitizers.
5. **Financial Precision**: Validation prevents negative check sizes, valuations, or ticket size bounds errors.
