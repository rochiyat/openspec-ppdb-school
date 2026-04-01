## Why

Sistem PPDB multi-role memerlukan fondasi akses yang memisahkan portal (applicant vs admin), mengelola scope-aware permissions, dan menghitung effective permissions sebagai union dari semua role aktif user. Tanpa ini, user harus switch role per session (friction tinggi), data access sulit dibatasi per tenant/school, dan risiko privilege leak meningkat karena tidak ada enforcement scope yang jelas.

## What Changes

- Registrasi dan login dengan email atau nomor HP (salah satu wajib unik)
- Password reset flow dengan token expiry
- Portal separation: route `/applicant/*` dan `/admin/*` terpisah sejak awal
- Active scope resolver: user admin memilih tenant/school scope aktif saat masuk portal
- Multi-role support: satu user dapat memiliki banyak role, sistem menghitung effective permissions sebagai union role pada scope aktif
- Session management: menyimpan portal aktif, scope aktif, dan effective permissions di session/token
- Scoped access control: middleware/guard di semua endpoint private untuk enforce tenant/school boundary

## Capabilities

### New Capabilities

- `user-authentication`: Registrasi akun, login dengan kredensial (email/phone + password), reset password, verifikasi akun dasar (email/SMS)
- `multi-role-rbac`: Definisi system roles (applicant, verifier, reviewer, finance_admin, school_admin, principal, super_admin), permissions, user-role mapping dengan scope (tenant-level atau school-level), role-permission mapping
- `session-management`: Manajemen portal aktif (`applicant`, `admin`), scope aktif (`tenant_id`, `school_id`), resolver effective permissions (union dari role aktif pada scope)
- `scoped-access-control`: Middleware/decorator untuk enforce scope-based data filtering, validasi apakah user berhak akses resource pada scope tertentu, audit context capture (actor, role snapshot, scope)

### Modified Capabilities

(Tidak ada capability existing yang diubah — ini adalah foundational module)

## Impact

**Affected Systems:**

- **Frontend**: Portal routing terpisah (`/applicant/`*, `/admin/*`), scope switcher untuk user multi-school, menu dinamis berdasarkan effective permissions
- **Backend**: Semua endpoint private harus validate auth + scope + permission di service layer, session/JWT token harus menyimpan portal dan scope aktif
- **Database**: Tabel baru: `users`, `roles`, `permissions`, `user_roles` (dengan scope), `role_permissions`, session/refresh token storage

**Dependencies Downstream:**

- Semua modul operasional (OPS-002 hingga OPS-010) bergantung pada RBAC dan scoped access ini
- Audit log (OPS-009) memerlukan actor context dari session ini
- Notifikasi (OPS-008) memerlukan user contact info dari user registry

**Risks:**

- Salah konfigurasi role-permission dapat menyebabkan privilege leak
- Performa query dengan scope filter harus diperhatikan (indexing tenant_id, school_id)
- Token expiry dan refresh strategy harus aman untuk session panjang admin

