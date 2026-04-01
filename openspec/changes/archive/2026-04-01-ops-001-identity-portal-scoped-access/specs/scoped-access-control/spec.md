## ADDED Requirements

### Requirement: All private endpoints must validate authentication
The system SHALL require valid access token for all private endpoints.

#### Scenario: Request with valid token allowed
- **WHEN** user makes request to private endpoint with valid unexpired access token
- **THEN** system validates token signature and expiry, extracts claims, and allows request

#### Scenario: Request without token rejected
- **WHEN** user makes request to private endpoint without Authorization header
- **THEN** system returns 401 Unauthorized with error "Authentication required"

#### Scenario: Request with invalid token rejected
- **WHEN** user makes request with token that has invalid signature
- **THEN** system returns 401 Unauthorized with error "Invalid token"

#### Scenario: Request with expired token rejected
- **WHEN** user makes request with token past expiry time
- **THEN** system returns 401 Unauthorized with error "Token has expired"

### Requirement: System must validate required permissions
The system SHALL check that user's effective permissions include the required permission for the endpoint.

#### Scenario: User with required permission allowed
- **WHEN** user with effective_permissions including "applications:read" accesses endpoint requiring that permission
- **THEN** system allows request

#### Scenario: User without required permission rejected
- **WHEN** user with effective_permissions NOT including "documents:verify" accesses endpoint requiring that permission
- **THEN** system returns 403 Forbidden with error "Insufficient permissions"

#### Scenario: Multiple required permissions all must be present
- **WHEN** endpoint requires ["applications:read", "applications:update"] and user has only "applications:read"
- **THEN** system returns 403 Forbidden with error "Insufficient permissions"

### Requirement: System must validate active scope matches resource scope
The system SHALL ensure user's active scope has access to the requested resource.

#### Scenario: User accessing resource in their active scope allowed
- **WHEN** user with active_scope school A accesses application belonging to school A
- **THEN** system allows request

#### Scenario: User accessing resource outside their active scope rejected
- **WHEN** user with active_scope school A attempts to access application belonging to school B
- **THEN** system returns 403 Forbidden with error "Access denied: resource not in your scope"

#### Scenario: Tenant-level scope can access all schools in tenant
- **WHEN** user with tenant-level scope (school_id = null) accesses resource in any school within tenant
- **THEN** system allows request

#### Scenario: User accessing resource from different tenant rejected
- **WHEN** user with active_scope tenant A attempts to access resource belonging to tenant B
- **THEN** system returns 403 Forbidden with error "Access denied: resource not in your scope"

### Requirement: All queries must filter by active scope
The system SHALL automatically filter database queries by tenant_id and school_id from active scope.

#### Scenario: School-scoped query filters by school
- **WHEN** user with active_scope school A queries applications
- **THEN** system adds WHERE clause: tenant_id = <active_tenant_id> AND school_id = <active_school_id>

#### Scenario: Tenant-scoped query filters by tenant only
- **WHEN** user with tenant-level scope queries applications
- **THEN** system adds WHERE clause: tenant_id = <active_tenant_id> (no school_id filter)

#### Scenario: Query without scope filter rejected
- **WHEN** developer writes query without scope filter
- **THEN** code review or automated test catches missing scope filter (defensive programming)

### Requirement: System must inject request context for audit
The system SHALL capture actor, role snapshot, portal, and active scope in request context for audit logging.

#### Scenario: Request context populated
- **WHEN** authenticated request passes through middleware
- **THEN** system injects context: { user_id, portal, active_scope, effective_permissions, timestamp, correlation_id }

#### Scenario: Audit log uses request context
- **WHEN** service layer performs auditable action
- **THEN** system reads actor and scope from request context and writes to audit log

#### Scenario: Request context isolated per request
- **WHEN** multiple concurrent requests from different users
- **THEN** each request has isolated context (no cross-contamination)

### Requirement: Middleware must enforce portal-route matching
The system SHALL validate that token portal claim matches the route prefix being accessed.

#### Scenario: Admin token on admin route allowed
- **WHEN** user with portal = "admin" accesses /admin/applications
- **THEN** system allows request

#### Scenario: Admin token on applicant route rejected
- **WHEN** user with portal = "admin" accesses /applicant/dashboard
- **THEN** system returns 403 Forbidden with error "Portal mismatch"

#### Scenario: Applicant token on admin route rejected
- **WHEN** user with portal = "applicant" accesses /admin/verifications
- **THEN** system returns 403 Forbidden with error "Portal mismatch"

#### Scenario: Public routes bypass portal check
- **WHEN** user accesses public route like /health or /docs
- **THEN** system allows request without portal validation

### Requirement: System must provide decorator for permission enforcement
The system SHALL provide decorator/guard syntax for declaring required permissions on endpoints.

#### Scenario: Decorator syntax for single permission
- **WHEN** endpoint is decorated with @RequirePermission("applications:read")
- **THEN** middleware validates user has that permission before allowing request

#### Scenario: Decorator syntax for multiple permissions
- **WHEN** endpoint is decorated with @RequirePermissions(["applications:read", "applications:update"])
- **THEN** middleware validates user has ALL listed permissions before allowing request

#### Scenario: Decorator syntax for scope level
- **WHEN** endpoint is decorated with @RequireScope("school")
- **THEN** middleware validates user's active scope includes school_id (not tenant-level)

#### Scenario: Decorator syntax for tenant-level access
- **WHEN** endpoint is decorated with @RequireScope("tenant")
- **THEN** middleware validates user has tenant-level scope (school_id = null)

### Requirement: System must validate resource ownership for applicant portal
The system SHALL ensure applicant users can only access their own resources.

#### Scenario: Applicant accessing own application allowed
- **WHEN** applicant user accesses their own application
- **THEN** system validates application.applicant_id matches token user_id and allows request

#### Scenario: Applicant accessing other user's application rejected
- **WHEN** applicant user attempts to access application belonging to different applicant
- **THEN** system returns 403 Forbidden with error "Access denied"

#### Scenario: Applicant listing only shows own resources
- **WHEN** applicant user queries applications list
- **THEN** system adds WHERE clause: applicant_id = <user_id>

### Requirement: System must log all authorization failures
The system SHALL log all 401 and 403 responses with context for security monitoring.

#### Scenario: Failed authentication logged
- **WHEN** request fails authentication (401)
- **THEN** system logs: timestamp, IP address, requested endpoint, error reason

#### Scenario: Failed authorization logged
- **WHEN** request fails authorization (403)
- **THEN** system logs: timestamp, user_id, requested endpoint, required permission, user's effective permissions, error reason

#### Scenario: Suspicious activity flagged
- **WHEN** user has multiple 403 failures within short time
- **THEN** system flags for security review (potential privilege escalation attempt)

### Requirement: System must support permission check in service layer
The system SHALL provide utility function for checking permissions in service layer (not just middleware).

#### Scenario: Service layer permission check
- **WHEN** service method needs to verify user has permission before executing logic
- **THEN** service calls hasPermission(user, "applications:update") and proceeds only if true

#### Scenario: Service layer scope check
- **WHEN** service method needs to verify resource belongs to user's scope
- **THEN** service calls isInScope(resource, activeScope) and proceeds only if true

#### Scenario: Service layer bypasses check for system operations
- **WHEN** background job or system process needs to access data
- **THEN** service uses system context (bypass user scope) with audit trail

### Requirement: System must enforce row-level security for sensitive data
The system SHALL restrict access to PII (Personally Identifiable Information) based on permissions.

#### Scenario: User with PII permission sees full data
- **WHEN** user with "applicants:read_pii" permission queries applicant data
- **THEN** system returns full data including email, phone, address

#### Scenario: User without PII permission sees masked data
- **WHEN** user with "applicants:read" but NOT "applicants:read_pii" queries applicant data
- **THEN** system returns data with email/phone masked (e.g., "j***@example.com", "08**********")

#### Scenario: PII permission required for export
- **WHEN** user attempts to export applicant data with PII fields
- **THEN** system validates user has "applicants:read_pii" permission before allowing export

### Requirement: System must validate scope on resource creation
The system SHALL automatically set tenant_id and school_id on new resources based on active scope.

#### Scenario: Resource created with active scope
- **WHEN** user creates new application
- **THEN** system automatically sets application.tenant_id and application.school_id from active scope

#### Scenario: User cannot override scope on creation
- **WHEN** user attempts to create resource with tenant_id or school_id different from active scope
- **THEN** system ignores provided values and uses active scope (prevent scope bypass)

#### Scenario: Tenant-level user must specify school on creation
- **WHEN** user with tenant-level scope creates school-specific resource
- **THEN** system requires school_id in request body and validates it belongs to tenant
