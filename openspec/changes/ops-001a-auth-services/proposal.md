## Why

OPS-001 Foundation menyediakan database schema, crypto services, dan repositories. Fase OPS-001A ("Auth Services") melanjutkan dengan implementasi authentication service layer, RBAC service, session management, middleware, dan API endpoints — sehingga sistem dapat menjalankan full auth flow dari registrasi hingga login dengan multi-role & scope management.

## What Changes

- Authentication service: register, login, password reset, refresh token, logout, verification
- RBAC service: effective permissions resolver, hasPermission check, isInScope check, role management
- Session management: portal selection, scope selection, scope switching, token claims builder, context extraction
- Middleware & guards: auth validation, portal validation, permission guards, rate limiting, request context injection
- Backend API endpoints: /auth/*, /session/*, /admin/users/*, /admin/roles/*, /admin/permissions/*
- Integration dengan notification system untuk auth events

## Capabilities

### New Capabilities

- `authentication-service`: Layanan lengkap untuk register, login, password reset, refresh, logout, verification dengan email/SMS
- `rbac-service`: Layanan untuk effective permissions calculation, permission checking, scope validation, role assignment
- `session-service`: Manajemen portal + scope + session context dengan JWT token builder
- `auth-middleware-guards`: Middleware untuk auth validation, portal matching, permission enforcement, rate limiting, context injection
- `auth-api-endpoints`: Semua endpoint REST untuk auth operations: register, login, reset password, session management, user management, role management

### Modified Capabilities

(Dependency pada OPS-001 Foundation — tidak modifikasi capability existing)

## Capabilities

### New Capabilities

- `authentication-service`: Layanan lengkap untuk register, login, password reset, refresh, logout, verification dengan email/SMS
- `rbac-service`: Layanan untuk effective permissions calculation, permission checking, scope validation, role assignment
- `session-service`: Manajemen portal + scope + session context dengan JWT token builder
- `auth-middleware-guards`: Middleware untuk auth validation, portal matching, permission enforcement, rate limiting, context injection
- `auth-api-endpoints`: Semua endpoint REST untuk auth operations: register, login, reset password, session management, user management, role management

### Modified Capabilities

(Dependency pada OPS-001 Foundation — tidak modifikasi capability existing)

## Impact

**Dependencies:**

- Requires: OPS-001 Foundation (database migrations, repositories, crypto services)
- Feeds into: OPS-002 (Org Setup uses auth for user management), OPS-003+ (all downstream modules need auth)

**Frontend Impact:**

- API consumers akan implement: AuthContext, useAuth hook, ProtectedRoute, token refresh interceptor

**Backend Impact:**

- Akan expose auth API endpoints yang dapat dikonsumsi frontend atau mobile
- Semua downstream modules akan depend pada middleware auth validation

**Database Impact:**

- No new tables; uses OPS-001 schema (users, roles, permissions, user_roles, etc.)

**Risks:**

- Jika endpoints tidak proper validate input, ada risk injection attack
- Jika rate limiting tidak implemented, brute force risk
- Jika permission logic salah, privilege escalation

## Dependencies

**Foundation Layer (OPS-001):**

- ✅ Database schema (users, roles, permissions, user_roles, refresh_tokens, password_reset_tokens, verification_codes)
- ✅ PasswordService (bcrypt hash/verify)
- ✅ JwtService (issue/verify tokens)
- ✅ TokenService (generate reset tokens, verification codes)
- ✅ 6 Repositories (UserRepository, RoleRepository, PermissionRepository, UserRoleRepository, RefreshTokenRepository, PasswordResetTokenRepository, VerificationCodeRepository)

**Remaining Tasks (OPS-001A):**

- 3.1–3.9: Authentication Service (register, login, password reset, refresh, logout, verification)
- 4.1–4.7: RBAC Service (effective permissions, hasPermission, isInScope, role assignment)
- 5.1–5.6: Session Management (portal selection, scope selection, scope switching, token builder, context extractor)
- 6.1–6.8: Middleware & Guards (auth validation, portal validation, permission guards, rate limiting, logging)
- 7.1–7.5: Scoped Access Control (scope filter builder, resource ownership, PII masking, scope auto-assignment)
- 8.1–8.12: Backend API Endpoints (/auth/*, /session/*)
- 9.1–9.8: Admin User Management API (/admin/users/*, /admin/roles/*, /admin/permissions/*)
- 10.1–10.9: Frontend Foundation (React Router, AuthContext, useAuth, ProtectedRoute, token storage)
- 11.1–11.6: Applicant Portal Pages (register, login, reset password, verify, dashboard, logout)
- 12.1–12.7: Admin Portal Pages (login, scope selector, ScopeSwitcher, dashboard, users, roles, logout)
- 13.1–13.5: Menu & Navigation (dynamic menu builder, permission-based menu)
- 14.1–14.5: Notification Integration (auth events, templates, email/SMS delivery)
- 15.1–15.13: Testing (unit, integration, E2E)
- 16.1–16.10: Security Hardening (input validation, SQL injection prevention, XSS, CSRF, CORS, rate limiting, security headers)
- 17.1–17.12: Documentation & Deployment (env vars, API docs, role matrix, migration scripts, CI/CD, smoke tests)

