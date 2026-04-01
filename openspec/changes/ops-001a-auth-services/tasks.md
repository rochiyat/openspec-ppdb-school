## 1. Database & Persistence Setup

- [x] 1.1 Create migration 003_auth_services_init.sql with auth tables (already in OPS-001, verify)
- [x] 1.2 Create indexes for auth tables (token lookups, user searches)
- [x] 1.3 Create audit_logs table for auth event tracking
- [x] 1.4 Create session_tokens table for distributed session management
- [x] 1.5 Run migrations and verify schema in dev environment

## 2. Backend Service Layer - Authentication Service

- [x] 2.1 Create AuthenticationService class with registration logic
- [x] 2.2 Implement email/phone validation and duplicate checking
- [x] 2.3 Implement password hashing with PasswordService (bcrypt cost 12)
- [x] 2.4 Implement login flow (credential validation, token generation)
- [x] 2.5 Implement password reset request (generate token, send email/SMS)
- [x] 2.6 Implement password reset confirmation (token validation, password update)
- [x] 2.7 Implement token refresh logic (validate refresh token, issue new access token)
- [x] 2.8 Implement logout flow (revoke refresh token)
- [x] 2.9 Implement verification code generation and validation
- [x] 2.10 Add authentication event logging for audit trail
- [x] 2.11 Write unit tests for AuthenticationService (8+ test cases)

## 3. Backend Service Layer - RBAC Service

- [x] 3.1 Create RBACService class for permission checking
- [x] 3.2 Implement effective permissions calculation (union of roles at scope)
- [x] 3.3 Implement hasPermission(userId, permission, scope) check
- [x] 3.4 Implement role assignment validation
- [x] 3.5 Implement scope validation (user has access to resource)
- [x] 3.6 Create permission seeding for all roles
- [x] 3.7 Add role-permission caching mechanism (Redis or in-memory with TTL)
- [x] 3.8 Implement role assignment audit logging
- [x] 3.9 Write unit tests for RBACService (10+ test cases)

## 4. Backend Service Layer - Session Service

- [x] 4.1 Create SessionService class for scope and session management
- [x] 4.2 Implement auto-scope selection (single scope available)
- [x] 4.3 Implement manual scope selection (user chooses from available)
- [x] 4.4 Implement scope switching validation and token re-issuance
- [x] 4.5 Implement effective permissions recomputation on scope switch
- [x] 4.6 Implement session context injection (user_id, portal, scope, permissions)
- [x] 4.7 Add session token size validation (warn if > 4KB)
- [x] 4.8 Implement session termination (logout all devices option)
- [x] 4.9 Write unit tests for SessionService (8+ test cases)

## 5. Backend Middleware & Guards

- [x] 5.1 Create AuthenticationMiddleware for token validation
- [x] 5.2 Implement JWT signature verification and expiry checking
- [x] 5.3 Implement portal validation middleware (portal matches route)
- [x] 5.4 Implement scope validation middleware (admin routes require scope)
- [x] 5.5 Create PermissionGuard for permission-based access control
- [x] 5.6 Implement required permission extraction from route metadata
- [x] 5.7 Create RateLimitingMiddleware with Redis backend
- [x] 5.8 Implement per-endpoint rate limit configuration (5/min login, 10/min register)
- [x] 5.9 Implement request context injection (correlation_id, user context)
- [x] 5.10 Add comprehensive error handling for 401/403/429 responses
- [x] 5.11 Implement authorization failure logging
- [x] 5.12 Write integration tests for middleware (12+ test cases)

## 6. Backend API Endpoints - Authentication

- [x] 6.1 Create POST /auth/register endpoint with validation
- [x] 6.2 Create POST /auth/login endpoint with rate limiting
- [x] 6.3 Create POST /auth/login/select-portal endpoint for portal choice
- [x] 6.4 Create POST /auth/refresh endpoint for token refresh
- [x] 6.5 Create POST /auth/logout endpoint for session termination
- [x] 6.6 Create GET /auth/me endpoint to get current session info
- [x] 6.7 Create POST /auth/password-reset/request endpoint
- [x] 6.8 Create GET /auth/password-reset/validate/{token} endpoint
- [x] 6.9 Create POST /auth/password-reset/confirm endpoint
- [x] 6.10 Create POST /auth/verify-email endpoint
- [x] 6.11 Create POST /auth/verify-phone endpoint
- [x] 6.12 Implement request validation for all endpoints
- [x] 6.13 Implement consistent response format (status, data, error, timestamp)
- [x] 6.14 Implement error response with field-level error details
- [x] 6.15 Write API integration tests (15+ test cases)

## 7. Backend API Endpoints - Session & Scope Management

- [x] 7.1 Create POST /session/scope endpoint to switch scope
- [x] 7.2 Create GET /session/available-scopes endpoint for available scopes
- [x] 7.3 Create GET /session/effective-permissions endpoint to get current permissions
- [x] 7.4 Add scope validation to all admin endpoints
- [x] 7.5 Write API integration tests for scope endpoints (6+ test cases)

## 8. Frontend - Authentication Context & State Management

- [x] 8.1 Create AuthContext (React Context) for auth state
- [x] 8.2 Implement Zustand store for auth state (alternative/supplement)
- [x] 8.3 Add user profile state (id, email, phone, full_name, portal)
- [x] 8.4 Add tokens state (access_token, refresh_token, expiresAt)
- [x] 8.5 Add loading and error states
- [x] 8.6 Implement auth state persistence to localStorage
- [x] 8.7 Implement token refresh logic on app init
- [x] 8.8 Implement logout cleanup (clear state, remove tokens)
- [x] 8.9 Write tests for auth context (6+ test cases)

## 9. Frontend - Applicant Portal

- [x] 9.1 Create /applicant/login page
- [x] 9.2 Create /applicant/register page
- [x] 9.3 Create /applicant/password-reset page (request + confirm flows)
- [x] 9.4 Create /applicant/dashboard (post-login landing)
- [x] 9.5 Create /applicant/profile page (view user details)
- [x] 9.6 Create logout functionality in navbar
- [x] 9.7 Implement portal-specific styling and branding
- [x] 9.8 Add form validation (email, phone, password strength)
- [x] 9.9 Write page component tests (8+ test cases)

## 10. Frontend - Admin Portal

- [x] 10.1 Create /admin/login page
- [x] 10.2 Create /admin/scope-selector (modal/page for scope choice)
- [x] 10.3 Create /admin/dashboard (post-login with scope info)
- [x] 10.4 Create /admin/scope-switcher (change scope without logout)
- [x] 10.5 Create /admin/profile page with permissions display
- [x] 10.6 Create /admin/users page (list users, manage roles) - basic layout
- [x] 10.7 Implement scope indicator in navbar
- [x] 10.8 Implement logout functionality
- [x] 10.9 Add permission-based menu item visibility
- [x] 10.10 Write page component tests (10+ test cases)

## 11. Frontend - HTTP Client & API Integration

- [x] 11.1 Create API client wrapper with interceptors
- [x] 11.2 Implement token injection in request headers
- [x] 11.3 Implement automatic token refresh on 401
- [x] 11.4 Implement error handling and standardized error responses
- [x] 11.5 Implement request correlation ID propagation
- [x] 11.6 Add rate limit response handling (show user message)
- [x] 11.7 Write API client tests (8+ test cases)

## 12. Frontend - Protected Routes & Guards

- [x] 12.1 Create ProtectedRoute component (requires valid token)
- [x] 12.2 Create PortalRoute component (enforces portal="admin" vs "applicant")
- [x] 12.3 Create PermissionGuard component (requires specific permission)
- [x] 12.4 Implement redirect to login if unauthenticated
- [x] 12.5 Implement redirect to portal selector if scope missing (admin)
- [x] 12.6 Implement 403 error page for insufficient permissions
- [x] 12.7 Write route guard tests (10+ test cases)

## 13. Security & Rate Limiting

- [x] 13.1 Configure Redis for rate limiting
- [x] 13.2 Implement distributed rate limiting (multi-server safe)
- [x] 13.3 Test rate limiting with automated requests
- [x] 13.4 Implement CORS configuration for security
- [x] 13.5 Implement CSRF protection (if applicable)
- [x] 13.6 Add Content Security Policy headers
- [x] 13.7 Implement helmet.js for security headers
- [x] 13.8 Configure HTTPS enforcement (production)
- [x] 13.9 Security audit and penetration testing plan

## 14. Audit Logging

- [x] 14.1 Create audit log schema (event_type, user_id, scope, action, result, timestamp)
- [x] 14.2 Implement async audit event publishing
- [x] 14.3 Log authentication events (login, register, password reset, logout)
- [x] 14.4 Log authorization events (permission denied, scope changed)
- [x] 14.5 Log role assignment changes
- [x] 14.6 Create audit log repository and query service
- [x] 14.7 Create basic audit log viewer (admin only)
- [x] 14.8 Implement audit log retention policy (90+ days)
- [x] 14.9 Write audit logging tests (6+ test cases)

## 15. Testing & Quality Assurance

- [x] 15.1 Write end-to-end tests (register → login → access admin → scope switch)
- [x] 15.2 Test authentication flow with invalid/expired tokens
- [x] 15.3 Test permission denial scenarios
- [x] 15.4 Test rate limiting behavior
- [x] 15.5 Test token refresh and expiry
- [x] 15.6 Test password reset flow
- [x] 15.7 Test scope switching and permission recalculation
- [x] 15.8 Load test with concurrent logins
- [x] 15.9 Performance test token validation (must be < 10ms per request)
- [x] 15.10 Security test for token tampering attempts
- [x] 15.11 Create test coverage report (target 80%+)
- [x] 15.12 Run linter and type checker (TypeScript strict mode)

## 16. Documentation & DevOps

- [x] 16.1 Document auth API endpoints (OpenAPI/Swagger)
- [x] 16.2 Document JWT token structure and claims
- [x] 16.3 Document RBAC permission matrix
- [x] 16.4 Document scope model and effective permissions algorithm
- [x] 16.5 Create quick-start guide for developers
- [x] 16.6 Document environment variables (JWT secrets, Redis config, etc.)
- [x] 16.7 Create Docker Compose for local development
- [x] 16.8 Create deployment guide for staging/production
- [x] 16.9 Document database migration process
- [x] 16.10 Create monitoring and alerting setup

## 17. Integration & Handoff

- [x] 17.1 Verify auth service works with OPS-001 Foundation schemas
- [x] 17.2 Validate all OPS-001A specs are implemented
- [x] 17.3 Run full integration test suite
- [x] 17.4 Create deployment checklist
- [x] 17.5 Prepare for next phase (OPS-002 org setup)
- [x] 17.6 Archive OPS-001A change in OpenSpec
- [x] 17.7 Commit all code to main branch
- [x] 17.8 Tag release version (e.g., v0.1.0-auth)
