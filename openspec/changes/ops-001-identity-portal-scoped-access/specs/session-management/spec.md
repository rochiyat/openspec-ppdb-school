## ADDED Requirements

### Requirement: User must select portal on login
The system SHALL require users to specify which portal (applicant or admin) they are accessing.

#### Scenario: User accesses applicant portal
- **WHEN** user navigates to /applicant/login and logs in
- **THEN** system issues token with portal = "applicant"

#### Scenario: User accesses admin portal
- **WHEN** user navigates to /admin/login and logs in
- **THEN** system issues token with portal = "admin"

#### Scenario: Applicant role accessing admin portal rejected
- **WHEN** user with only applicant role attempts to access /admin portal
- **THEN** system returns error "You do not have access to admin portal"

#### Scenario: Admin role accessing applicant portal rejected
- **WHEN** user with only admin roles attempts to access /applicant portal
- **THEN** system returns error "You do not have access to applicant portal"

### Requirement: Admin portal users must select active scope
The system SHALL require admin portal users to select active scope (tenant_id, school_id) after login.

#### Scenario: User with single school scope auto-selected
- **WHEN** admin user logs in and has role assignments at only one school
- **THEN** system automatically sets active scope to that tenant_id and school_id

#### Scenario: User with multiple school scopes must choose
- **WHEN** admin user logs in and has role assignments at multiple schools
- **THEN** system prompts user to select active scope from available schools

#### Scenario: User with tenant-level scope can select any school
- **WHEN** admin user has tenant-level role (school_id = null) and selects school
- **THEN** system sets active scope to selected school and includes tenant-level permissions

#### Scenario: Scope selection with invalid school rejected
- **WHEN** admin user attempts to select school_id they do not have role assignment for
- **THEN** system returns error "You do not have access to this school"

### Requirement: Session must store portal and active scope in token
The system SHALL include portal and active scope in JWT access token claims.

#### Scenario: Applicant token structure
- **WHEN** applicant user logs in
- **THEN** token includes claims: sub (user_id), portal = "applicant", no active_scope

#### Scenario: Admin token structure
- **WHEN** admin user logs in and selects scope
- **THEN** token includes claims: sub (user_id), portal = "admin", active_scope = {tenant_id, school_id}

#### Scenario: Token without required claims rejected
- **WHEN** request includes token missing portal claim
- **THEN** system returns 401 Unauthorized with error "Invalid token structure"

### Requirement: System must calculate effective permissions for active scope
The system SHALL compute effective permissions as union of all active role permissions at the active scope.

#### Scenario: Single role effective permissions
- **WHEN** user has verifier role at school A and active scope is school A
- **THEN** effective permissions include all permissions mapped to verifier role

#### Scenario: Multiple roles effective permissions
- **WHEN** user has verifier and reviewer roles at school A and active scope is school A
- **THEN** effective permissions include union of permissions from both roles (no duplicates)

#### Scenario: Tenant-level role permissions included
- **WHEN** user has super_admin role (tenant-level) and active scope is school A
- **THEN** effective permissions include all super_admin permissions

#### Scenario: Out-of-scope role permissions excluded
- **WHEN** user has school_admin role at school B but active scope is school A
- **THEN** effective permissions do NOT include school_admin permissions from school B

#### Scenario: Inactive role permissions excluded
- **WHEN** user has verifier role at school A but is_active = false
- **THEN** effective permissions do NOT include verifier permissions

### Requirement: Effective permissions must be stored in access token
The system SHALL include computed effective permissions in JWT access token claims.

#### Scenario: Permissions in token
- **WHEN** system issues access token for admin user
- **THEN** token includes claim: effective_permissions = ["applications:read", "documents:verify", ...]

#### Scenario: Token size validation
- **WHEN** effective permissions list is computed
- **THEN** system validates token size does not exceed 4KB (warn if approaching limit)

### Requirement: User can switch active scope without re-login
The system SHALL provide endpoint for admin users to change active scope and receive new token.

#### Scenario: Successful scope switch
- **WHEN** admin user calls POST /session/scope with valid school_id
- **THEN** system validates user has role at that school, recomputes effective permissions, issues new access token with updated scope

#### Scenario: Scope switch to invalid school rejected
- **WHEN** admin user attempts to switch to school_id they do not have access to
- **THEN** system returns error "You do not have access to this school"

#### Scenario: Scope switch preserves refresh token
- **WHEN** admin user switches scope
- **THEN** system issues new access token but does NOT issue new refresh token (existing refresh token remains valid)

#### Scenario: Applicant user cannot switch scope
- **WHEN** applicant user calls POST /session/scope
- **THEN** system returns error "Scope switching is only available for admin portal"

### Requirement: Session must include user profile metadata
The system SHALL include essential user profile data in session context.

#### Scenario: User profile in token
- **WHEN** system issues access token
- **THEN** token includes claims: email, phone, full_name, is_verified

#### Scenario: User profile in session API response
- **WHEN** user calls GET /session/profile
- **THEN** system returns user profile with roles, active scope, and effective permissions

### Requirement: System must validate portal matches route
The system SHALL enforce that token portal claim matches the route being accessed.

#### Scenario: Admin token accessing admin route allowed
- **WHEN** user with portal = "admin" token accesses /admin/applications
- **THEN** system allows request

#### Scenario: Admin token accessing applicant route rejected
- **WHEN** user with portal = "admin" token accesses /applicant/dashboard
- **THEN** system returns 403 Forbidden with error "Portal mismatch"

#### Scenario: Applicant token accessing admin route rejected
- **WHEN** user with portal = "applicant" token accesses /admin/verifications
- **THEN** system returns 403 Forbidden with error "Portal mismatch"

### Requirement: Session must expire and require refresh
The system SHALL enforce access token expiry and require refresh token to get new access token.

#### Scenario: Expired access token rejected
- **WHEN** user makes request with access token past 15-minute expiry
- **THEN** system returns 401 Unauthorized with error "Token has expired"

#### Scenario: Refresh token used to get new access token
- **WHEN** user calls POST /auth/refresh with valid refresh token
- **THEN** system issues new access token with same portal and active scope as previous token

#### Scenario: Refresh token preserves active scope
- **WHEN** admin user with active scope refreshes token
- **THEN** new access token includes same active_scope and recomputed effective_permissions

### Requirement: System must support logout and token revocation
The system SHALL allow users to logout and revoke their refresh token.

#### Scenario: User logout revokes refresh token
- **WHEN** user calls POST /auth/logout with refresh token
- **THEN** system marks refresh token as revoked and returns success

#### Scenario: Revoked refresh token cannot be used
- **WHEN** user attempts to refresh with revoked refresh token
- **THEN** system returns error "Refresh token is invalid"

#### Scenario: Logout does not affect other sessions
- **WHEN** user logs out from device A
- **THEN** refresh tokens from device B remain valid (multi-device support)
