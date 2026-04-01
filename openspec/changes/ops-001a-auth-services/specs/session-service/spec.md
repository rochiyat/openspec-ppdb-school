## ADDED Requirements

### Requirement: User must select portal on login
The system SHALL require choosing applicant or admin portal, returns portal-specific token.

#### Scenario: Login to applicant portal
- **WHEN** user navigates /applicant/login and submits credentials
- **THEN** system authenticates, issues token with portal="applicant"

#### Scenario: Login to admin portal
- **WHEN** user navigates /admin/login and submits credentials
- **THEN** system authenticates, issues token with portal="admin"

### Requirement: Admin user must select active scope
The system SHALL auto-select scope if 1 available, show selector if multiple.

#### Scenario: Auto-select single scope
- **WHEN** admin user has role at only 1 school, logs in
- **THEN** system auto-selects that scope, issues token with active_scope set

#### Scenario: Manual scope selection
- **WHEN** admin user has roles at multiple schools, logs in
- **THEN** system prompts to select scope from available list

### Requirement: User can switch scope without re-login
The system SHALL allow scope switching by calling scope endpoint, returns new token.

#### Scenario: Scope switch
- **WHEN** admin user calls POST /session/scope with new school_id
- **THEN** system validates user has role at school, recomputes permissions, returns new token with updated scope

#### Scenario: Invalid scope switch
- **WHEN** user attempts to switch to school they don't have access to
- **THEN** system returns error "Access denied"

### Requirement: System must build token claims
The system SHALL include user_id, portal, scope, permissions, expiry in token.

#### Scenario: Access token claims
- **WHEN** system issues access token
- **THEN** token includes: sub, portal, active_scope, effective_permissions, exp, iat

### Requirement: System must extract and inject session context
The system SHALL parse token, inject user_id, scope, permissions into request context.

#### Scenario: Context injection
- **WHEN** request is authenticated, token is valid
- **THEN** middleware injects: {user_id, portal, active_scope, effective_permissions} into request context

### Requirement: Session must validate token size
The system SHALL warn if JWT exceeds 4KB to prevent performance issues.

#### Scenario: Large token warning
- **WHEN** token size exceeds 4KB
- **THEN** system logs warning "JWT token size approaching limit"
