## Context

Sistem PPDB ini melayani multi-tenant (yayasan dengan banyak sekolah) dan multi-role (applicant, verifier, reviewer, finance_admin, school_admin, principal, super_admin). User dapat memiliki lebih dari satu role dengan scope berbeda (tenant-level atau school-level). Sistem harus memisahkan portal applicant dan admin secara jelas, serta memastikan data access dibatasi sesuai scope aktif user.

**Current State:**
- Belum ada sistem autentikasi atau RBAC
- Ini adalah foundational module pertama

**Constraints:**
- Stack: Node.js + TypeScript (backend), React + Vite + TypeScript (frontend), PostgreSQL, Redis
- JWT untuk session management
- Semua endpoint private harus enforce scope-based access control
- System roles tidak boleh dihapus atau diubah permission-nya secara sembarangan

**Stakeholders:**
- Semua modul downstream (OPS-002 hingga OPS-010) bergantung pada RBAC ini
- Frontend perlu scope switcher dan menu dinamis
- Audit log (OPS-009) perlu actor context dari session

## Goals / Non-Goals

**Goals:**
- Menyediakan registrasi, login, reset password yang aman
- Memisahkan portal applicant dan admin di routing level
- Mengelola multi-role user dengan scope (tenant/school)
- Menghitung effective permissions sebagai union role pada scope aktif
- Menyediakan middleware/guard untuk enforce scoped access di semua endpoint
- Menyimpan session context (portal, scope, effective permissions) di JWT
- Menyediakan API untuk scope switcher frontend

**Non-Goals:**
- OAuth/SSO eksternal (bisa ditambahkan kemudian)
- Verifikasi akun kompleks (OTP/2FA) di MVP (cukup verifikasi email/SMS dasar)
- Fine-grained permission per field (cukup permission per resource/action)
- Role hierarchy/inheritance (cukup flat role dengan union permissions)

## Decisions

### 1. Portal Separation via Routing (Frontend + Backend)

**Decision:** Portal dipisahkan di routing level, bukan role picker.

**Rationale:**
- `/applicant/*` dan `/admin/*` memiliki layout, menu, dan context berbeda
- User tidak perlu "switch role" — mereka memilih portal saat akses
- Backend dapat validate portal dari JWT claim dan enforce rule berbeda per portal

**Alternatives Considered:**
- Role picker per session → ditolak karena friction tinggi dan user bingung
- Single portal dengan conditional menu → ditolak karena context applicant vs admin sangat berbeda

**Implementation:**
- Frontend: React Router dengan route guard per portal
- Backend: JWT claim `portal: "applicant" | "admin"`, middleware validate portal sesuai endpoint

### 2. Multi-Role dengan Scope (Tenant/School)

**Decision:** User dapat memiliki banyak role, setiap role memiliki scope (tenant-level atau school-level).

**Rationale:**
- Satu user bisa jadi `school_admin` di sekolah A dan `verifier` di sekolah B
- Super admin perlu akses lintas sekolah (tenant-level scope)
- Tidak perlu switch role per session — sistem menghitung effective permissions otomatis

**Data Model:**
```
user_roles:
  - user_id
  - role_id
  - tenant_id (always set)
  - school_id (nullable, null = tenant-level scope)
  - is_active
```

**Alternatives Considered:**
- Role per session (user pilih role saat login) → ditolak karena friction tinggi
- Single role per user → ditolak karena tidak fleksibel untuk multi-school

### 3. Effective Permissions = Union Role pada Scope Aktif

**Decision:** Saat user masuk portal admin dan memilih scope (tenant/school), sistem menghitung effective permissions sebagai union dari semua role aktif pada scope tersebut.

**Rationale:**
- User dengan role `verifier` + `reviewer` di sekolah A mendapat gabungan permission keduanya
- Tidak perlu switch role — menu dan akses langsung tersedia
- Permission enforcement tetap di service layer, bukan hanya UI

**Implementation:**
- Session/JWT menyimpan `active_scope: { tenant_id, school_id? }`
- Backend service query `user_roles` yang match scope aktif, lalu union permission dari role-permission mapping
- Middleware inject `effective_permissions: string[]` ke request context

**Alternatives Considered:**
- Intersection permissions (hanya permission yang ada di semua role) → ditolak karena terlalu restriktif
- User pilih role aktif per request → ditolak karena kompleksitas frontend/backend

### 4. JWT Token Structure

**Decision:** JWT menyimpan `user_id`, `portal`, `active_scope`, `effective_permissions`, `exp`, `iat`.

**Rationale:**
- Stateless validation di backend (tidak perlu query DB per request untuk permission check)
- Refresh token disimpan di database untuk revoke capability
- Access token short-lived (15 menit), refresh token long-lived (7 hari)

**Token Claims:**
```json
{
  "sub": "user_id",
  "portal": "admin",
  "active_scope": {
    "tenant_id": "uuid",
    "school_id": "uuid"
  },
  "effective_permissions": ["applications:read", "documents:verify", ...],
  "exp": 1234567890,
  "iat": 1234567890
}
```

**Alternatives Considered:**
- Session di Redis → ditolak karena menambah dependency state dan single point of failure
- Permission tidak disimpan di token (query per request) → ditolak karena performa

### 5. Scoped Access Control Middleware

**Decision:** Semua endpoint private harus melalui middleware yang validate:
1. Token valid
2. Portal sesuai route
3. Scope aktif valid (user memiliki role pada scope tersebut)
4. Permission required tersedia di effective permissions
5. Data access difilter berdasarkan scope (tenant_id, school_id)

**Implementation:**
- Decorator/guard: `@RequirePermission('applications:read')` + `@RequireScope('school')`
- Service layer query wajib filter by `tenant_id` dan `school_id` dari request context
- Audit context (actor, role snapshot, scope) di-inject ke request untuk logging

**Alternatives Considered:**
- Permission check hanya di controller → ditolak karena risiko bypass via direct service call
- Scope filter opsional → ditolak karena risiko data leak lintas tenant/school

### 6. Password Hashing & Reset Flow

**Decision:** Password di-hash dengan bcrypt (cost factor 12), reset password via token email/SMS dengan expiry 1 jam.

**Rationale:**
- bcrypt battle-tested dan cukup untuk MVP
- Token reset disimpan di database dengan expiry, single-use

**Flow:**
1. User request reset → sistem generate token, simpan di DB, kirim email/SMS
2. User klik link dengan token → validate token belum expired dan belum dipakai
3. User set password baru → hash password, mark token as used, invalidate semua refresh token user

**Alternatives Considered:**
- Argon2 → ditolak karena bcrypt cukup dan lebih familiar untuk team
- OTP via SMS → ditolak untuk MVP (bisa ditambahkan kemudian)

### 7. System Roles & Permissions Seeding

**Decision:** System roles dan permission mapping di-seed saat migration, tidak boleh dihapus via API.

**Rationale:**
- Konsistensi role/permission lintas tenant
- Mencegah super admin tidak sengaja menghapus role kritikal

**System Roles:**
- `applicant`, `verifier`, `reviewer`, `finance_admin`, `school_admin`, `principal`, `super_admin`

**Permission Pattern:**
- `<resource>:<action>` (e.g., `applications:read`, `documents:verify`, `payments:approve`)
- Setiap role memiliki set permission yang sudah ditentukan di PRD

**Alternatives Considered:**
- Custom role creation → ditolak untuk MVP (bisa ditambahkan kemudian)
- Permission per field → ditolak karena terlalu granular untuk MVP

### 8. Scope Switcher API

**Decision:** Menyediakan endpoint `POST /session/scope` untuk user admin switch scope aktif tanpa re-login.

**Rationale:**
- User multi-school perlu switch scope dengan cepat
- Frontend scope switcher dropdown memanggil endpoint ini, backend issue token baru dengan scope baru

**Flow:**
1. User pilih scope baru di dropdown
2. Frontend call `POST /session/scope { tenant_id, school_id }`
3. Backend validate user memiliki role pada scope tersebut
4. Backend hitung effective permissions baru, issue access token baru
5. Frontend replace token dan reload menu/data

**Alternatives Considered:**
- Reload page penuh → ditolak karena UX buruk
- Multi-token (satu token per scope) → ditolak karena kompleksitas frontend

## Risks / Trade-offs

### 1. Token Size Bloat
**Risk:** Effective permissions disimpan di JWT → token besar jika user punya banyak permission.

**Mitigation:**
- Gunakan permission code singkat (e.g., `app:r` instead of `applications:read`)
- Monitor token size, jika > 4KB pertimbangkan permission grouping atau claim di Redis

### 2. Permission Drift
**Risk:** Permission di token bisa berbeda dengan DB jika role-permission mapping berubah setelah token issued.

**Mitigation:**
- Access token short-lived (15 menit) → drift maksimal 15 menit
- Jika perlu revoke permission segera, invalidate refresh token dan force re-login

### 3. Scope Filter Bypass
**Risk:** Developer lupa filter by scope di service layer → data leak lintas tenant/school.

**Mitigation:**
- Code review wajib cek scope filter di semua query
- Integration test untuk validate scope isolation
- Pertimbangkan Row-Level Security (RLS) di PostgreSQL untuk defense-in-depth

### 4. Performance: Scope Filter di Setiap Query
**Risk:** Filter `tenant_id` dan `school_id` di setiap query bisa lambat jika tidak di-index.

**Mitigation:**
- Index composite `(tenant_id, school_id)` di semua tabel utama
- Monitor slow query log
- Pertimbangkan partitioning by tenant jika data sangat besar

### 5. Refresh Token Revocation
**Risk:** Refresh token di-store di database → jadi stateful, perlu cleanup expired token.

**Mitigation:**
- Background job cleanup expired refresh token setiap hari
- Index `expires_at` untuk query cepat
- Pertimbangkan Redis untuk refresh token jika performa jadi bottleneck

### 6. Privilege Escalation via Role Misconfiguration
**Risk:** Super admin salah assign role/permission → user dapat akses data yang tidak seharusnya.

**Mitigation:**
- Audit log semua perubahan role/permission
- UI warning saat assign role dengan permission sensitif
- Periodic audit review role assignment

## Migration Plan

**Phase 1: Database Schema**
1. Create tables: `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `refresh_tokens`, `password_reset_tokens`
2. Seed system roles dan permissions
3. Create indexes: `(tenant_id, school_id)`, `(user_id, is_active)`, `(token, expires_at)`

**Phase 2: Backend Core**
1. Implement auth service (register, login, reset password)
2. Implement JWT service (issue, verify, refresh)
3. Implement RBAC service (effective permissions resolver)
4. Implement middleware (auth, scope, permission)

**Phase 3: Backend API**
1. Expose auth endpoints: `POST /auth/register`, `POST /auth/login`, `POST /auth/reset-password`, `POST /auth/refresh`
2. Expose session endpoints: `POST /session/portal`, `POST /session/scope`
3. Expose user management endpoints (untuk super admin)

**Phase 4: Frontend Foundation**
1. Implement portal routing (`/applicant/*`, `/admin/*`)
2. Implement login/register pages per portal
3. Implement scope switcher component (admin portal)
4. Implement auth context provider (store token, user, scope)

**Phase 5: Integration**
1. Integrate auth middleware ke semua endpoint private
2. Test scope isolation (user A tidak bisa akses data user B)
3. Test effective permissions (menu tampil sesuai role)

**Rollback Strategy:**
- Jika ada critical bug di auth, rollback ke versi sebelumnya (belum ada user production di MVP awal)
- Jika schema migration gagal, rollback migration via down script
- Backup database sebelum migration production

## Open Questions

1. **Verifikasi akun:** Apakah perlu verifikasi email/SMS wajib sebelum user bisa login? Atau cukup opsional untuk MVP?
   - **Rekomendasi:** Opsional untuk MVP, wajibkan hanya untuk role admin.

2. **Rate limiting:** Berapa batas request per menit untuk endpoint auth (login, register, reset password)?
   - **Rekomendasi:** 5 request/menit per IP untuk login/reset, 10 request/menit untuk register.

3. **Session timeout:** Berapa lama access token dan refresh token valid?
   - **Rekomendasi:** Access token 15 menit, refresh token 7 hari (configurable via env).

4. **Multi-device login:** Apakah user boleh login dari banyak device sekaligus?
   - **Rekomendasi:** Ya, tapi batasi maksimal 5 refresh token aktif per user (revoke oldest jika exceed).

5. **Permission naming convention:** Apakah pakai `<resource>:<action>` atau `<module>.<resource>.<action>`?
   - **Rekomendasi:** `<resource>:<action>` untuk MVP (lebih simple), bisa refactor ke namespace jika perlu.
