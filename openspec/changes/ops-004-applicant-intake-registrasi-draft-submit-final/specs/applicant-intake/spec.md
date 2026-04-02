## ADDED Requirements

### Requirement: Applicant can register a new application

The system SHALL allow an applicant to begin a new application by providing basic registration details and receiving an application identifier.

#### Scenario: Successful registration

- **WHEN** applicant submits registration details
- **THEN** system creates a new application record and returns its identifier

### Requirement: Application lifecycle states

The system SHALL represent application state transitions: draft → submitted → review.

#### Scenario: State transition to submitted

- **WHEN** applicant submits a final application
- **THEN** application state SHALL change to `submitted` and timestamp recorded
