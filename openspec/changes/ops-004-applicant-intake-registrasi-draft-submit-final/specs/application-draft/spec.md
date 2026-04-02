## ADDED Requirements

### Requirement: Save application draft

The system SHALL allow applicants to save partial application data as a draft linked to their account or session.

#### Scenario: Save draft

- **WHEN** applicant saves progress
- **THEN** system stores the draft and returns draft id

### Requirement: Resume draft

The system SHALL allow applicants to list and resume their saved drafts.

#### Scenario: Resume draft

- **WHEN** applicant requests to resume a draft
- **THEN** system returns the latest saved draft payload

### Requirement: Draft TTL and quota

The system SHALL enforce per-tenant draft storage quota and TTL policies.

#### Scenario: Draft expired

- **WHEN** a draft exceeds TTL
- **THEN** system marks draft as expired and excludes it from resume list
