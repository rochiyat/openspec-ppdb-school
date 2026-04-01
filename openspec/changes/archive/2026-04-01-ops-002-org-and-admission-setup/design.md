## Context

Perubahan `OPS-002` membangun fondasi organisasi dan konfigurasi admission untuk sistem PPDB multi-tenant. Kondisi saat ini belum memiliki model master data yang eksplisit untuk tenant, sekolah, tahun ajaran, gelombang, dan jalur.

Kebutuhan utama:
- Setiap tenant dapat memiliki banyak sekolah.
- Setiap sekolah mengelola banyak tahun ajaran.
- Setiap tahun ajaran memiliki beberapa gelombang pendaftaran.
- Setiap gelombang memiliki beberapa jalur seleksi dengan kuota.
- Modul downstream wajib memakai konteks `school_id` dan `academic_year_id`.

Stakeholder utama: super admin tenant, school admin, tim operasional PPDB, dan modul downstream (applicant intake, selection, reporting).

Constraint:
- Data master bersifat foundation, perubahan skema harus backward-safe.
- Validasi kuota dan periode wajib kuat untuk mencegah inkonsistensi bisnis.
- Status aktif/nonaktif harus soft, bukan hard delete.

## Goals / Non-Goals

**Goals:**
- Menyediakan data model master organisasi dan admission yang konsisten.
- Menjamin validasi bisnis inti (kuota, period, overlap).
- Menyediakan API admin untuk CRUD + aktivasi/deaktivasi data master.
- Menetapkan aturan scoping agar modul downstream aman terhadap lintas sekolah/tahun.
- Menyiapkan migration path yang aman untuk integrasi bertahap.

**Non-Goals:**
- Implementasi workflow pendaftaran siswa end-to-end (OPS-004).
- Implementasi engine seleksi dan ranking (OPS-006).
- UI applicant portal detail.
- Reporting final lintas domain (OPS-010).

## Decisions

### 1) Domain model hirarkis dengan foreign key ketat
**Keputusan:** memakai relasi:
`Tenant -> School -> AcademicYear -> AdmissionWave -> AdmissionTrack`.

**Alasan:** mengikuti bounded context bisnis dan memudahkan scoping downstream.

**Alternatif dipertimbangkan:**
- Model datar (semua tabel referensi langsung tenant): query lebih sederhana awal, tetapi rawan inkonsistensi relasi.
- Nested JSON config: fleksibel tetapi buruk untuk query, index, dan integritas.

### 2) Soft lifecycle untuk data master
**Keputusan:** gunakan kolom status (`is_active`, `archived_at`) daripada hard delete.

**Alasan:** auditability dan histori konfigurasi penting untuk evaluasi admission cycle.

**Alternatif:**
- Hard delete: lebih sederhana namun berisiko memutus referensi historis.

### 3) Validasi kuota di level database + service
**Keputusan:**
- Validasi agregat `sum(track_quota) <= wave_total_quota` dilakukan di service + transaction guard.
- Validasi nilai kuota non-negatif dipaksa di DB constraint.
- Validasi konsistensi saat update jalur/wave dilakukan di service layer.

**Alasan:** constraint agregat lintas-row tidak portable antar environment test/dev secara konsisten; service + transaction guard dipilih sebagai baseline implementasi saat ini.

**Alternatif:**
- Trigger DB penuh untuk agregat kuota: lebih ketat, tetapi menambah kompleksitas kompatibilitas environment dan maintenance.

### 4) Prevent overlap periode aktif pada scope yang sama
**Keputusan:** untuk kombinasi `school_id + academic_year_id`, gelombang aktif tidak boleh overlap pada rentang tanggal yang sama. Enforcement utama saat ini berada di service validation + integration test.

**Alasan:** menghindari ambiguitas jalur pendaftaran aktif untuk applicant sekaligus menjaga implementasi tetap konsisten lintas environment.

**Alternatif:**
- Constraint trigger DB untuk overlap: lebih ketat namun lebih sulit dipelihara di seluruh tooling.
- Memperbolehkan overlap: fleksibel tapi meningkatkan kompleksitas intake flow dan komunikasi ke user.

### 5) Scoped authorization by tenant and school
**Keputusan:** endpoint admin wajib memvalidasi:
- user punya akses ke `tenant_id`,
- dan jika level sekolah, harus cocok `school_id`.

**Alasan:** mencegah cross-tenant/cross-school data leakage.

**Alternatif:**
- Scope hanya di UI: tidak aman, karena API tetap bisa diakses lintas scope.

### 6) API surface per aggregate root
**Keputusan:** endpoint dipisah berdasarkan aggregate:
- `/admin/tenants`
- `/admin/schools`
- `/admin/academic-years`
- `/admin/admission-waves`
- `/admin/admission-tracks`

**Alasan:** lebih jelas ownership, mudah di-test, dan modular untuk tim.

**Alternatif:**
- Endpoint konfigurasi generik tunggal: cepat awal, tetapi sulit maintain.

### 7) Migration bertahap dan idempotent
**Keputusan:** migration SQL dibuat incremental, idempotent (`IF NOT EXISTS`), plus seed minimum status reference.

**Alasan:** mengurangi risiko deploy dan memudahkan rollback.

**Alternatif:**
- Big-bang migration: sekali jalan namun risiko kegagalan lebih tinggi.

## Risks / Trade-offs

- **[Risk] Kompleksitas validasi kuota saat concurrent update**  
  → **Mitigation:** transactional update + row-level locking pada wave.

- **[Risk] Overlap periode butuh aturan bisnis yang presisi (timezone/cutoff)**  
  → **Mitigation:** standardisasi timezone (UTC), validasi di service + DB constraint/check.

- **[Risk] Soft delete meningkatkan kompleksitas query**  
  → **Mitigation:** default scope `is_active = true` + index kolom status.

- **[Risk] Perubahan foundation berdampak ke semua modul downstream**  
  → **Mitigation:** kontrak API stabil, release bertahap, dan compatibility checks.

- **[Trade-off] Strict hierarchy membuat perubahan struktur organisasi lebih rigid**  
  → **Mitigation:** sediakan endpoint re-assignment terbatas dengan audit.

## Migration Plan

1. **Schema Setup**
   - Tambah tabel: `tenants`, `schools`, `academic_years`, `admission_waves`, `admission_tracks`.
   - Tambah FK, unique constraint, dan index scoping.

2. **Business Constraints**
   - Implement check kuota dan date-window validation.
   - Tambah guard untuk status aktif/nonaktif.

3. **Service + API Layer**
   - Implement service per aggregate root.
   - Implement endpoint admin + permission guard.

4. **Downstream Integration**
   - Tambah requirement context `school_id` dan `academic_year_id` ke modul lanjutan.
   - Uji query filtering per scope.

5. **Rollout & Rollback**
   - Rollout bertahap per endpoint.
   - Rollback via migration down + disable endpoint baru (feature flag jika tersedia).

## Open Questions

1. Apakah overlap gelombang lintas jalur dalam satu sekolah diperbolehkan jika target market berbeda?
2. Aturan default kuota saat wave dibuat: wajib input total dulu atau bisa auto dari sum track?
3. Apakah `academic_year` bersifat global per tenant atau strict per school?
4. Butuh versioning konfigurasi admission (draft/published) atau cukup active flag?
5. Bagaimana kebijakan re-open gelombang yang sudah ditutup jika sudah ada aplikasi masuk?
6. Apakah perlu hard lock perubahan kuota setelah gelombang aktif berjalan?
