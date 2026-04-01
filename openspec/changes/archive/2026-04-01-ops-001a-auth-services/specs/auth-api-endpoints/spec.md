## ADDED Requirements

### Requirement: Auth endpoints must follow REST conventions
The system SHALL provide POST/GET methods following standard REST patterns.

#### Scenario: POST register endpoint
- **WHEN** user calls POST /auth/register with email, password, full_name
- **THEN** system returns 201 Created with user profile and tokens

#### Scenario: POST login endpoint
- **WHEN** user calls POST /auth/login with email/phone, password
- **THEN** system returns 200 OK with user profile and tokens

### Requirement: Auth endpoints must return consistent response format
The system SHALL return all responses with status, data/error, timestamp.

#### Scenario: Success response format
- **WHEN** endpoint succeeds
- **THEN** response contains: {status: "success", data: {...}, timestamp, correlation_id}

#### Scenario: Error response format
- **WHEN** endpoint fails
- **THEN** response contains: {status: "error", error: {code, message}, timestamp, correlation_id}

### Requirement: Auth API must handle validation errors
The system SHALL validate request data, return 400 Bad Request with field errors.

#### Scenario: Missing required field
- **WHEN** user submits register without email or phone
- **THEN** system returns 400 with error "Either email or phone required"

#### Scenario: Invalid email format
- **WHEN** user submits malformed email
- **THEN** system returns 400 with error "Invalid email format"

### Requirement: Auth API must support password reset flow
The system SHALL provide endpoints: request reset, validate token, reset password.

#### Scenario: Request password reset
- **WHEN** user calls POST /auth/password-reset/request with email
- **THEN** system returns 200 OK (whether user exists or not)

#### Scenario: Validate reset token
- **WHEN** user calls GET /auth/password-reset/validate/{token}
- **THEN** system validates token, returns {valid: true/false, expires_at}

#### Scenario: Perform password reset
- **WHEN** user calls POST /auth/password-reset/confirm with token, new_password
- **THEN** system validates token, updates password, returns 200 OK

### Requirement: Auth API must support token refresh
The system SHALL provide refresh endpoint to get new access token.

#### Scenario: Refresh access token
- **WHEN** user calls POST /auth/refresh with refresh_token
- **THEN** system validates, issues new access_token, returns 200 OK

### Requirement: Auth API must support logout
The system SHALL provide logout endpoint to revoke tokens.

#### Scenario: Logout endpoint
- **WHEN** user calls POST /auth/logout with valid token
- **THEN** system revokes refresh token, returns 200 OK

### Requirement: Auth API must return session info
The system SHALL provide endpoint to get current session/scope info.

#### Scenario: Get session info
- **WHEN** user calls GET /auth/me with valid token
- **WHEN** system returns user profile, active_scope, portal, effective_permissions

### Requirement: Auth API must support scope switching for admins
The system SHALL provide endpoint to change active scope.

#### Scenario: Switch scope
- **WHEN** admin calls POST /session/scope with school_id
- **THEN** system validates access, returns new token with updated scope
