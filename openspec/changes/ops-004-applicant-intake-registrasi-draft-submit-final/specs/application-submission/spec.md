## ADDED Requirements

### Requirement: Final submission validation

The system SHALL validate required fields and business rules when an applicant submits a final application.

#### Scenario: Submission with missing required fields

- **WHEN** applicant submits with required fields missing
- **THEN** system returns validation errors and does not transition to `submitted`

### Requirement: Audit logging on submission

The system SHALL record an audit event for each final submission including user id and timestamp.

#### Scenario: Successful submission logged

- **WHEN** an application is successfully submitted
- **THEN** an audit event `application.submitted` is recorded with details

### Requirement: Enqueue post-submission processing

The system SHALL enqueue background jobs for post-submission processing (e.g., document checks).

#### Scenario: Job enqueued

- **WHEN** application is submitted
- **THEN** a post-submission job is enqueued with application id
