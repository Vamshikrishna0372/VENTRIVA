# VENTRIVA — Legal Document Workflow & Signature Verification

## Overview
The Legal Workflow module manages legal agreement checklists, document approvals, and auditable digital signatures required before investment completion.

## Supported Document Types
- Share Subscription Agreement (SSA)
- Shareholders Agreement (SHA)
- Board & Shareholder Resolutions
- Founder Consent & Investor Consent
- KYC & AML Compliance Verification Documents

## Signature Auditing
Each signature produces an immutable `SignatureRecord` storing:
- Signer ID & Role (`Founder`, `Investor`, `Officer`)
- Unique Signature Reference Code (`SIG-XXXXXX-TIMESTAMP`)
- IP Address & Browser User-Agent Metadata
- Verification Timestamp
