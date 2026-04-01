## OPS-002 Implementation Handoff

### 1) Data Model & Entity Relationship

- `tenants`
  - PK: `id`
  - Unique: `code`
  - Lifecycle: `is_active`, `archived_at`
- `schools`
  - PK: `id`
  - FK: `tenant_id -> tenants.id`
  - Unique per tenant: `(tenant_id, school_code)`
- `academic_years`
  - PK: `id`
  - FK: `school_id -> schools.id`
  - Rule: `start_date < end_date`
  - Active uniqueness: one active year per school (`uq_academic_year_active_per_school`)
- `admission_waves`
  - PK: `id`
  - FK: `school_id -> schools.id`, `academic_year_id -> academic_years.id`
  - Unique per scope: `(school_id, academic_year_id, code)`
  - Rule: `start_date < end_date`, `total_quota >= 0`
  - Status: `draft | active | closed | archived`
- `admission_tracks`
  - PK: `id`
  - FK: `admission_wave_id -> admission_waves.id`
  - Unique per wave: `(admission_wave_id, code)` and `(admission_wave_id, priority_order)`
  - Rule: `quota >= 0`, `priority_order > 0`

### 2) API Contract Summary (`/admin/*`)

- Tenants
  - `POST /admin/tenants`
  - `GET /admin/tenants`
  - `PATCH /admin/tenants/:id`
  - `PATCH /admin/tenants/:id/status`
- Schools
  - `POST /admin/schools`
  - `GET /admin/schools`
  - `PATCH /admin/schools/:id`
  - `PATCH /admin/schools/:id/status`
- Academic Years
  - `POST /admin/academic-years`
  - `GET /admin/academic-years`
  - `PATCH /admin/academic-years/:id`
  - `PATCH /admin/academic-years/:id/status`
- Admission Waves
  - `POST /admin/admission-waves`
  - `GET /admin/admission-waves`
  - `PATCH /admin/admission-waves/:id`
  - `PATCH /admin/admission-waves/:id/status`
- Admission Tracks
  - `POST /admin/admission-tracks`
  - `GET /admin/admission-tracks`
  - `PATCH /admin/admission-tracks/:id`
  - `PATCH /admin/admission-tracks/:id/status`

Response envelope:
- success: `{ status, data, timestamp, correlationId }`
- error: `{ status, error: { code, message }, timestamp, correlationId }`

### 3) Business Rules

- Satu sekolah hanya boleh punya satu `academic_year` aktif.
- Gelombang aktif pada scope `school_id + academic_year_id` tidak boleh overlap periode.
- Total kuota track aktif per wave tidak boleh melebihi `wave.total_quota`.
- `priority_order` track wajib unik per wave.
- Soft lifecycle untuk semua aggregate: deactivate/archive, tanpa hard delete.

### 4) Scope & Permission Matrix

Permission baseline:
- Read endpoints: `config:read`
- Write/status endpoints: `config:write`

Scope enforcement:
- Tenant-level:
  - akses hanya pada `tenant_id` sesuai active scope user
- School-level:
  - akses hanya pada `school_id` sesuai active scope user
- Violation:
  - return `403 SCOPE_FORBIDDEN`

### 5) Operational Runbook (Wave & Track)

1. Buka tahun ajaran aktif untuk sekolah target.
2. Buat gelombang baru status `draft`.
3. Tambah jalur seleksi (track) beserta quota dan priority.
4. Validasi total kuota track <= kuota gelombang.
5. Aktifkan gelombang (`status=active`) saat jadwal buka.
6. Jika perlu koreksi:
   - update track quota/priority (dengan guard validasi)
   - hindari perubahan agresif saat intake sedang berjalan.
7. Tutup gelombang (`status=closed`) saat periode selesai.
8. Archive gelombang untuk histori setelah siklus selesai.

### 6) Downstream Integration Notes

- OPS-003 (dynamic form)
  - Wajib menerima context `school_id` + `admission_wave_id`.
- OPS-004 (applicant intake)
  - Hanya menampilkan wave `active` dan track `is_active=true`.
- OPS-006 (selection)
  - Gunakan `admission_track.priority_order` + kuota untuk proses seleksi.

Fallback strategy:
- Jika context school/year tidak tersedia, endpoint downstream harus reject dengan 400.
