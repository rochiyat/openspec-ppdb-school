## 1. Database Schema & Migration

- [x] 1.1 Create users table (id, email, phone, password_hash, full_name, is_verified, is_active, created_at, updated_at)
- [x] 1.2 Create roles table (id, name, description, is_system_role, created_at)
- [x] 1.3 Create permissions table (id, code, resource, action, description, created_at)
- [x] 1.4 Create user_roles table (id, user_id, role_id, tenant_id, school_id, is_active, assigned_by, assigned_at, modified_by, modified_at)
- [x] 1.5 Create role_permissions table (id, role_id, permission_id, created_at)
- [x] 1.6 Create refresh_tokens table (id, user_id, token_hash, expires_at, revoked_at, created_at)
- [x] 1.7 Create password_reset_tokens table (id, user_id, token_hash, expires_at, used_at, created_at)
- [x] 1.8 Create verification_codes table (id, user_id, code, type, expires_at, verified_at, created_at)
- [x] 1.9 Add indexes: (tenant_id, school_id), (user_id, is_active), (token_hash, expires_at), (email), (phone)
- [x] 1.10 Seed system roles (applicant, verifier, reviewer, finance_admin, school_admin, principal, super_admin)
- [x] 1.11 Seed permissions following resource:action pattern
- [x] 1.12 Seed role-permission mappings according to PRD role matrix

## 2. Backend Core Services

- [x] 2.1 Implement password hashing service (bcrypt with cost factor 12)
- [x] 2.2 Implement JWT service (issue, verify, decode, refresh)
- [x] 2.3 Implement token generation utilities (reset token, verification code)
- [x] 2.4 Implement user repository (CRUD, findByEmail, findByPhone, updatePassword)
- [x] 2.5 Implement role repository (findById, findSystemRoles, findByName)
- [x] 2.6 Implement permission repository (findByRole, findByCode)
- [x] 2.7 Implement user_role repository (assignRole, deactivateRole, findByUser, findByScope)
- [x] 2.8 Implement refresh_token repository (create, findByToken, revoke, revokeAllForUser)
- [x] 2.9 Implement password_reset_token repository (create, findByToken, markUsed, invalidatePrevious)
- [x] 2.10 Implement verification_code repository (create, findByCode, markVerified)

## 3. Authentication Service

- [ ] 3.1 Implement register function (validate uniqueness, hash password, create user)
- [ ] 3.2 Implement login function (validate credentials, check active status, issue tokens)
- [ ] 3.3 Implement password reset request (generate token, store with expiry, trigger notification)
- [ ] 3.4 Implement password reset confirm (validate token, update password, revoke refresh tokens)
- [ ] 3.5 Implement refresh token flow (validate refresh token, issue new access token)
- [ ] 3.6 Implement logout (revoke refresh token)
- [ ] 3.7 Implement verification code send (generate code, store with expiry, trigger notification)
- [ ] 3.8 Implement verification code verify (validate code, mark email/phone as verified)
- [ ] 3.9 Add rate limiting logic (5/min for login/reset, 10/min for register)

## 4. RBAC Service

- [ ] 4.1 Implement effective permissions resolver (query user_roles by scope, union permissions)
- [ ] 4.2 Implement hasPermission check (validate permission in effective permissions list)
- [ ] 4.3 Implement isInScope check (validate resource tenant_id/school_id matches active scope)
- [ ] 4.4 Implement role assignment function (validate user/role/scope, create user_role)
- [ ] 4.5 Implement role deactivation function (set is_active = false, audit log)
- [ ] 4.6 Implement role-permission mapping management (add/remove permissions from role)
- [ ] 4.7 Implement query available scopes for user (return list of tenant/school pairs user has access to)

## 5. Session Management Service

- [ ] 5.1 Implement portal selection logic (validate user has role for portal)
- [ ] 5.2 Implement scope selection logic (validate user has role at scope, auto-select if single scope)
- [ ] 5.3 Implement scope switching function (validate new scope, recompute permissions, issue new token)
- [ ] 5.4 Implement token claims builder (user_id, portal, active_scope, effective_permissions, exp, iat)
- [ ] 5.5 Implement session context extractor (parse token, inject into request context)
- [ ] 5.6 Implement token size validation (warn if > 4KB)

## 6. Middleware & Guards

- [ ] 6.1 Implement authentication middleware (validate token, extract claims, reject if invalid/expired)
- [ ] 6.2 Implement portal validation middleware (validate token portal matches route prefix)
- [ ] 6.3 Implement scope validation middleware (validate active_scope present for admin routes)
- [ ] 6.4 Implement permission guard decorator (@RequirePermission, @RequirePermissions)
- [ ] 6.5 Implement scope guard decorator (@RequireScope for tenant/school level)
- [ ] 6.6 Implement request context injection (user_id, portal, active_scope, effective_permissions, correlation_id)
- [ ] 6.7 Implement authorization failure logging (401/403 with context)
- [ ] 6.8 Implement rate limiting middleware (per IP, per endpoint)

## 7. Scoped Access Control Utilities

- [ ] 7.1 Implement scope filter builder (auto-add WHERE tenant_id/school_id to queries)
- [ ] 7.2 Implement resource ownership validator (for applicant portal)
- [ ] 7.3 Implement PII masking utility (mask email/phone for users without read_pii permission)
- [ ] 7.4 Implement scope auto-assignment on resource creation (set tenant_id/school_id from active scope)
- [ ] 7.5 Implement system context provider (bypass scope for background jobs with audit)

## 8. Backend API Endpoints

- [ ] 8.1 POST /auth/register (validate input, create user, return tokens)
- [ ] 8.2 POST /auth/login (validate credentials, issue tokens, return user profile)
- [ ] 8.3 POST /auth/refresh (validate refresh token, issue new access token)
- [ ] 8.4 POST /auth/logout (revoke refresh token)
- [ ] 8.5 POST /auth/reset-password/request (generate token, send email/SMS)
- [ ] 8.6 POST /auth/reset-password/confirm (validate token, update password)
- [ ] 8.7 POST /auth/verify/send (generate verification code, send email/SMS)
- [ ] 8.8 POST /auth/verify/confirm (validate code, mark verified)
- [ ] 8.9 POST /session/portal (set portal, issue token)
- [ ] 8.10 POST /session/scope (validate scope, recompute permissions, issue new token)
- [ ] 8.11 GET /session/profile (return user profile with roles and effective permissions)
- [ ] 8.12 GET /session/available-scopes (return list of scopes user can access)

## 9. Admin User Management API

- [ ] 9.1 POST /admin/users/:id/roles (assign role to user with scope)
- [ ] 9.2 DELETE /admin/users/:id/roles/:roleId (deactivate role assignment)
- [ ] 9.3 GET /admin/users/:id/roles (list user's role assignments with scopes)
- [ ] 9.4 GET /admin/roles (list all roles)
- [ ] 9.5 GET /admin/roles/:id/permissions (list permissions for role)
- [ ] 9.6 POST /admin/roles/:id/permissions (add permission to role, super_admin only)
- [ ] 9.7 DELETE /admin/roles/:id/permissions/:permissionId (remove permission from role, super_admin only)
- [ ] 9.8 GET /admin/permissions (list all permissions)

## 10. Frontend Foundation

- [ ] 10.1 Setup React Router with portal-based routing (/applicant/*, /admin/*)
- [ ] 10.2 Create AuthContext provider (store token, user, active_scope, effective_permissions)
- [ ] 10.3 Create useAuth hook (login, logout, register, refresh, isAuthenticated)
- [ ] 10.4 Create ProtectedRoute component (redirect if not authenticated)
- [ ] 10.5 Create PortalRoute component (validate user has access to portal)
- [ ] 10.6 Create PermissionGate component (show/hide based on permission)
- [ ] 10.7 Implement token storage (localStorage with expiry check)
- [ ] 10.8 Implement token refresh interceptor (auto-refresh on 401)
- [ ] 10.9 Implement axios interceptor for Authorization header

## 11. Applicant Portal Pages

- [ ] 11.1 Create /applicant/register page (form with email/phone, password, validation)
- [ ] 11.2 Create /applicant/login page (form with email/phone, password)
- [ ] 11.3 Create /applicant/reset-password page (request and confirm flows)
- [ ] 11.4 Create /applicant/verify page (verification code input)
- [ ] 11.5 Create /applicant/dashboard page (placeholder with user profile)
- [ ] 11.6 Add logout button to applicant layout

## 12. Admin Portal Pages

- [ ] 12.1 Create /admin/login page (form with email/phone, password)
- [ ] 12.2 Create /admin/scope-selector page (dropdown of available scopes)
- [ ] 12.3 Create ScopeSwitcher component (dropdown in header, call POST /session/scope)
- [ ] 12.4 Create /admin/dashboard page (placeholder with user profile and active scope)
- [ ] 12.5 Create /admin/users page (list users, assign roles)
- [ ] 12.6 Create /admin/users/:id/roles page (manage user role assignments)
- [ ] 12.7 Add logout button to admin layout

## 13. Menu & Navigation

- [ ] 13.1 Implement dynamic menu builder (filter menu items by effective permissions)
- [ ] 13.2 Create applicant portal menu (dashboard, profile, applications placeholder)
- [ ] 13.3 Create admin portal menu (dashboard, users, config placeholder, reports placeholder)
- [ ] 13.4 Add permission checks to menu items (hide if user lacks permission)
- [ ] 13.5 Add active scope indicator in admin header

## 14. Integration with Notification System

- [ ] 14.1 Define notification events (user.registered, password.reset_requested, verification.code_sent)
- [ ] 14.2 Emit events from auth service (register, reset request, verification send)
- [ ] 14.3 Create notification templates for auth events
- [ ] 14.4 Test email delivery for password reset
- [ ] 14.5 Test SMS delivery for verification code

## 15. Testing

- [ ] 15.1 Unit test: password hashing service (hash, verify)
- [ ] 15.2 Unit test: JWT service (issue, verify, decode, expiry)
- [ ] 15.3 Unit test: effective permissions resolver (union, scope filtering)
- [ ] 15.4 Unit test: scope filter builder (tenant-level, school-level)
- [ ] 15.5 Integration test: register → login → access protected endpoint
- [ ] 15.6 Integration test: password reset flow (request → confirm → login)
- [ ] 15.7 Integration test: multi-role user effective permissions calculation
- [ ] 15.8 Integration test: scope switching (switch scope → new token → different permissions)
- [ ] 15.9 Integration test: scope isolation (user A cannot access user B's data)
- [ ] 15.10 Integration test: portal mismatch rejection (admin token on applicant route)
- [ ] 15.11 Integration test: rate limiting (exceed limit → 429 response)
- [ ] 15.12 E2E test: applicant full journey (register → verify → login → dashboard)
- [ ] 15.13 E2E test: admin full journey (login → select scope → switch scope → manage users)

## 16. Security & Validation

- [ ] 16.1 Add input validation for all auth endpoints (email format, phone format, password strength)
- [ ] 16.2 Add SQL injection prevention (parameterized queries, ORM validation)
- [ ] 16.3 Add XSS prevention (sanitize user input, CSP headers)
- [ ] 16.4 Add CSRF protection (SameSite cookies, CSRF tokens if needed)
- [ ] 16.5 Add CORS configuration (whitelist frontend origin)
- [ ] 16.6 Add rate limiting configuration (Redis-backed, per IP)
- [ ] 16.7 Add security headers (Helmet.js: HSTS, X-Frame-Options, etc.)
- [ ] 16.8 Add password strength validation (min 8 chars, complexity rules)
- [ ] 16.9 Audit all endpoints for scope filter enforcement
- [ ] 16.10 Audit all endpoints for permission enforcement

## 17. Documentation & Deployment

- [ ] 17.1 Document environment variables (JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL, REDIS_URL)
- [ ] 17.2 Document API endpoints (OpenAPI/Swagger spec)
- [ ] 17.3 Document role-permission matrix (which role has which permissions)
- [ ] 17.4 Document scope model (tenant-level vs school-level)
- [ ] 17.5 Document token structure (claims, expiry, refresh flow)
- [ ] 17.6 Create seed script for initial super_admin user
- [ ] 17.7 Create migration rollback script
- [ ] 17.8 Setup CI/CD pipeline for auth module tests
- [ ] 17.9 Deploy database migrations to staging
- [ ] 17.10 Deploy backend to staging
- [ ] 17.11 Deploy frontend to staging
- [ ] 17.12 Smoke test staging (register, login, scope switch)
