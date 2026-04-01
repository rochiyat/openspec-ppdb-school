## MODIFIED Requirements

### Requirement: Authentication logging

The system SHALL log all authentication events.

#### Scenario: Successful authentication

- **WHEN** a user authenticates successfully
- **THEN** the system SHALL log the authentication event with a timestamp.

#### Scenario: Failed authentication

- **WHEN** a user fails to authenticate
- **THEN** the system SHALL log the failure reason and timestamp.
