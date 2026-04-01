## ADDED Requirements

### Requirement: All private endpoints must require valid token
The system SHALL validate authentication before allowing access to protected endpoints.

#### Scenario: Valid token allowed
- **WHEN** request includes valid, unexpired access token
- **THEN** system validates signature, extracts claims, allows request

#### Scenario: Missing token rejected
- **WHEN** request to private endpoint has no Authorization header
- **THEN** system returns 401 Unauthorized

### Requirement: System must validate portal matches route
The system SHALL ensure token portal claim matches endpoint portal prefix.

#### Scenario: Admin token on admin route allowed
- **WHEN** user with portal="admin" token accesses /admin/applications
- **THEN** system allows request

#### Scenario: Portal mismatch rejected
- **WHEN** user with portal="admin" token accesses /applicant/dashboard
- **THEN** system returns 403 Forbidden

### Requirement: System must validate active scope for admin routes
The system SHALL require active_scope present for all admin endpoints.

#### Scenario: Scope present
- **WHEN** admin request includes valid active_scope in token
- **THEN** system allows request

#### Scenario: Scope missing
- **WHEN** admin request has no active_scope in token
- **THEN** system returns 401 Unauthorized

### Requirement: System must enforce permission-based access
The system SHALL validate required permission exists in effective_permissions.

#### Scenario: Required permission present
- **WHEN** endpoint requires documents:verify, user has permission
- **THEN** system allows request

#### Scenario: Permission missing
- **WHEN** endpoint requires documents:verify, user lacks permission
- **THEN** system returns 403 Forbidden

### Requirement: System must rate-limit endpoints
The system SHALL prevent brute-force attacks on sensitive endpoints.

#### Scenario: Rate limit exceeded
- **WHEN** user exceeds configured limit (5/min login, 10/min register)
- **THEN** system returns 429 Too Many Requests

### Requirement: System must inject request context
The system SHALL populate user_id, scope, permissions, correlation_id in context.

#### Scenario: Context available to handlers
- **WHEN** authenticated request reaches handler
- **THEN** request.context contains: {user_id, portal, active_scope, effective_permissions, correlation_id}

### Requirement: System must log authorization failures
The system SHALL record 401/403 responses for security monitoring.

#### Scenario: Failed auth logged
- **WHEN** request fails authentication (401)
- **THEN** system logs: timestamp, user_id, endpoint, reason

#### Scenario: Permission failure logged
- **WHEN** request fails authorization (403)
- **THEN** system logs: timestamp, user_id, required_permission, granted_permissions
