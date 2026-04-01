## Context

OPS-001 Foundation menyediakan:
- Database schema (users, roles, permissions, user_roles, dll)
- Crypto services (PasswordService, JwtService, TokenService)
- Repositories (UserRepository, RoleRepository, dll)

OPS-001A Auth Services membangun di atas foundation ini untuk menyediakan:
- Authentication service layer (register, login, password reset, verification)
- RBAC service (effective permissions, role assignment, scope checking)
- Session management (portal/scope selection, token building)
- Middleware & guards (auth validation, rate limiting, permission checking)
- API endpoints (REST endpoints untuk semua auth operations)
- Frontend foundation (React hooks, context, protections)

## Goals / Non-Goals

**Goals:**
- Implementasi authentication service yang aman dengan bcrypt + JWT
- Manajemen multi-role dengan scope awareness (tenant-level vs school-level)
- Session management dengan portal separation (applicant vs admin)
- Middleware untuk enforce authentication, authorization, rate limiting
- REST API endpoints untuk full auth flow
- React foundation untuk consuming auth API
- Integration dengan notification system untuk auth events

**Non-Goals:**
- OAuth/SSO eksternal (future enhancement)
- 2FA/MFA di MVP (future enhancement)
- Mobile SDK (hanya web untuk MVP)
- Payment gateway integration (out of scope untuk auth)

## Decisions

### 1. Service-Oriented Architecture (SOA)

**Decision:** Pisahkan concern menjadi 5 service layers yang clear

**Rationale:**
- AuthenticationService: register, login, token management, password reset
- RBACService: permission calculation, role assignment, scope checking
- SessionService: portal/scope management, token builder, context extractor
- Middleware layer: validation, guards, context injection
- API controller layer: REST endpoint mapping

**Benefits:**
- Testable masing-masing service independently
- Reusable di different contexts (REST API, gRPC, event handlers)
- Clear separation of concern

**Alternatives Considered:**
- Monolithic auth controller → ditolak karena sulit test, reuse
- Per-endpoint services → ditolak karena too granular, hard to maintain

### 2. Rate Limiting Strategy

**Decision:** Gunakan Redis untuk distributed rate limiting dengan sliding window

**Rationale:**
- 5 request/menit untuk login/reset password (per IP address)
- 10 request/menit untuk register (per IP address)
- Simple rule: increment counter dengan TTL, fail jika exceed

**Implementation:**
- Middleware check Redis sebelum process request
- Key format: `rate_limit:{endpoint}:{ip_address}`
- Value: counter (increment each request, reset after 1 minute)

**Alternatives Considered:**
- Token bucket → ditolak karena more complex untuk MVP
- Fixed window → ditolak karena vulnerable ke burst at boundary

### 3. Token Refresh Flow

**Decision:** Access token 15m (stateless), Refresh token 7d (stateful di DB)

**Rationale:**
- Access token short-lived → if leaked, exposure window small
- Refresh token long-lived + stored DB → can revoke immediately
- User tidak perlu re-login sering, tapi security tetap maintained

**Flow:**
1. Login → issue access token (15m) + refresh token (stored DB)
2. Access token expired → call /auth/refresh dengan refresh token
3. Server validate refresh token di DB, issue new access token
4. Logout → mark refresh token as revoked di DB

**Alternatives Considered:**
- Both tokens stateless → ditolak karena can't revoke
- Both tokens stateful → ditolak karena performance impact, tidak scalable

### 4. Effective Permissions Calculation

**Decision:** Calculate once at login/scope-switch, store in JWT token

**Rationale:**
- User dengan role `verifier + reviewer` di school A → union permissions
- Calculated at auth time, tidak perlu query permission table per request
- Middleware extract permissions dari token claim

**Performance:**
- Login: 1 query user_roles + 1 query role_permissions → cache hasil di token
- Per-request: 0 DB query, only JWT decode
- Permission check: O(1) array lookup in token claim

**Trade-off:**
- Token size besar jika banyak permissions (mitigated: permission codes singkat, max 4KB)
- If permission change, user permission tidak update sampai token refresh (15m max lag)

**Alternatives Considered:**
- Recalculate per request → ditolak karena performance
- Only check role, calculate permission per request → ditolak karena slow

### 5. Scope Auto-Selection

**Decision:** Admin portal: auto-select scope jika user punya hanya 1 scope, show selector jika > 1

**Rationale:**
- Most users punya 1 school scope (verifier, reviewer, finance_admin di sekolah A)
- Super admin punya tenant-level scope
- UX: auto-select single scope, manual select multiple scope

**Flow:**
1. Admin login → backend query user_roles
2. If 1 scope → auto-select, issue token dengan scope tersebut
3. If > 1 scope → return list available scopes, frontend show dropdown
4. User select scope → call POST /session/scope, issue new token

**Alternatives Considered:**
- Always show selector → ditolak karena overhead untuk 90% users
- Always auto-select first → ditolak karena bisa wrong scope

### 6. Frontend Auth Context

**Decision:** Gunakan React Context + Zustand untuk auth state management

**Rationale:**
- Context untuk prop drilling avoidance
- Zustand untuk centralized state (token, user, scope, permissions)
- localStorage untuk persistence (dengan expiry check)
- Auto-refresh token sebelum expire via interceptor

**Structure:**
```
AuthContext
  ├── useAuth hook
  │   ├── login(email/phone, password) → token + user
  │   ├── logout() → clear token
  │   ├── refreshToken() → new access token
  │   └── switchScope(school_id) → new token
  └── Zustand store
      ├── token, refreshToken
      ├── user, activeScope
      ├── effectivePermissions
      └── isAuthenticated, isLoading
```

**Alternatives Considered:**
- Redux → ditolak karena overkill untuk auth-only
- Local state di App.tsx → ditolak karena tidak reusable, hard to sync

### 7. API Endpoint Grouping

**Decision:** Group endpoints by domain + responsibility

**Rationale:**
- `/auth/*` — public auth operations (register, login, reset password)
- `/session/*` — authenticated session operations (portal, scope switching, profile)
- `/admin/users/*` — user management (only super_admin/school_admin)
- `/admin/roles/*` — role management (only super_admin)
- `/admin/permissions/*` — permission management (only super_admin)

**Alternatives Considered:**
- Single `/api/*` with auth type parameter → ditolak karena unclear
- Microservice per endpoint → ditolak karena MVP complexity

### 8. Error Handling & Validation

**Decision:** Centralized error handler middleware + validation at service layer

**Rationale:**
- Service layer validate input (email format, password strength, etc.)
- Throw custom exceptions (AuthenticationError, AuthorizationError, ValidationError)
- Middleware catch exceptions, return standardized error response

**Response Format:**
```json
{
  "status": "error",
  "code": "INVALID_CREDENTIALS",
  "message": "Email atau password salah",
  "details": null
}
```

**Alternatives Considered:**
- Validate di controller → ditolak karena code duplication
- Inline error response → ditolak karena inconsistent format

### 9. Audit Logging

**Decision:** Log semua auth events ke audit log table (via event/async)

**Rationale:**
- Track login attempts (success/failed)
- Track password reset requests
- Track role assignments
- Track permission changes
- Non-blocking: emit event, let audit service handle async

**Events:**
- `auth.user_registered`, `auth.user_logged_in`, `auth.user_logged_out`
- `auth.password_reset_requested`, `auth.password_reset_completed`
- `auth.role_assigned`, `auth.role_removed`

**Alternatives Considered:**
- Synchronous logging → ditolak karena blocks request
- No logging → ditolak karena compliance risk

## Risks / Trade-offs

### 1. Token Leakage
**Risk:** Access token stored in localStorage, vulnerable to XSS attack.
**Mitigation:** 
- Short-lived token (15m) limits exposure window
- Implement Content Security Policy (CSP) headers
- Sanitize user input everywhere
- Use httpOnly cookie for refresh token (future)

### 2. Permission Cache Staleness
**Risk:** User permission change (e.g., role removed), but token still valid for 15 minutes.
**Mitigation:**
- 15m max lag acceptable for MVP
- Admin can force user logout by invalidating refresh tokens
- Implement permission invalidation event (future)

### 3. Rate Limiting Bypass
**Risk:** Attacker spoof IP or use distributed attack (botnet).
**Mitigation:**
- Rate limit by IP + username (combined strategy)
- Monitor failed login patterns
- Implement CAPTCHA after N failures (future)

### 4. Session Fixation
**Risk:** Attacker fix user's session by stealing/predicting token.
**Mitigation:**
- JWT signed with secret key (can't be forged)
- Short access token expiry (15m)
- Bind token to user_agent + IP (optional, adds complexity)

### 5. Database Query N+1
**Risk:** Per-request permission check queries permission table.
**Mitigation:**
- Permissions cached in JWT token
- Minimal DB queries per request (auth validation only checks token, not DB)

### 6. Scaling: Single Redis Instance
**Risk:** Redis bottleneck for rate limiting at scale.
**Mitigation:**
- Redis cluster deployment (operational, not code concern)
- Consider distributed counter library if needed

## Migration Plan

**Phase 1: Service Layer (Week 1)**
1. Implement AuthenticationService (register, login, refresh, logout, password reset)
2. Implement RBACService (permission resolver, role assignment)
3. Implement SessionService (portal/scope manager, token builder)
4. Unit test all services

**Phase 2: Middleware & Guards (Week 1-2)**
1. Implement auth middleware (validate token, extract claims)
2. Implement permission guards (@RequirePermission decorator)
3. Implement rate limiting middleware
4. Implement request context injection

**Phase 3: API Endpoints (Week 2)**
1. Implement /auth/* endpoints
2. Implement /session/* endpoints
3. Implement /admin/users/*, /admin/roles/*, /admin/permissions/* endpoints
4. Integration test full flow

**Phase 4: Frontend Foundation (Week 2-3)**
1. Create AuthContext + Zustand store
2. Create useAuth hook
3. Create ProtectedRoute, PortalRoute, PermissionGate components
4. Implement token storage + refresh interceptor

**Phase 5: Integration & Testing (Week 3)**
1. E2E test full auth flow (register → verify → login → scope switch → logout)
2. Load test rate limiting
3. Security audit
4. Deployment

**Rollback Strategy:**
- Keep OPS-001 Foundation schema stable (no breaking changes to tables)
- If endpoints broken, fallback to previous API version (versioning: /v1/auth/*)
- If migrations fail, rollback SQL changes (maintain down migration scripts)

## Open Questions

1. **Email verification mandatory?** Can user login before email verified (current design allows)?
   - **Recommendation:** Verification optional for MVP, can enforced later

2. **Phone SMS provider finalized?** Use Fonnte or another?
   - **Recommendation:** Use Fonnte as per PRD, but make provider pluggable

3. **Permission granularity:** Per-resource or per-field?
   - **Recommendation:** Per-resource for MVP (e.g., `applications:read`), per-field later if needed

4. **Multi-device logout:** When user logs out from device A, should device B also logout?
   - **Recommendation:** No (multi-device support), each refresh token independent

5. **API versioning:** Use /v1/ prefix or header versioning?
   - **Recommendation:** Path versioning (/v1/) for clarity and easier testing

6. **CORS configuration:** Which origins allowed for frontend calls?
   - **Recommendation:** Whitelist frontend URL from .env, reject others

7. **Session duration:** Should admin session timeout after inactivity?
   - **Recommendation:** Yes, 30 min inactivity timeout (future), MVP no timeout yet

## Performance Targets

- Login endpoint: < 200ms (1 bcrypt verify + 2 DB queries)
- Rate limit check: < 5ms (Redis check)
- Permission validation: < 1ms (JWT decode, array lookup)
- Refresh token: < 100ms (1 DB query + token generation)
