## Why

Sistem PPDB perlu konfigurasi master yang fleksibel: multi-tenant (yayasan dengan banyak sekolah), multi-tahun ajaran, multi-gelombang per tahun, multi-jalur per gelombang, dan kuota yang dapat dikonfigurasi. Tanpa ini, sistem tidak bisa beradaptasi dengan struktur organisasi yang berbeda atau menghandle multiple admission cycles.

## What Changes

- Master data: Tenant, School, AcademicYear, AdmissionWave, AdmissionTrack
- Konfigurasi kuota per jalur + kuota total
- Status aktif/nonaktif untuk konfigurasi (soft delete, tidak hardcode)
- Relationship scoping: sekolah belong to tenant, gelombang belong to tahun ajaran & sekolah, jalur belong to gelombang
- Validasi: kuota jalur tidak boleh melebihi kuota total, period aktif tidak boleh overlap

## Capabilities

### New Capabilities

- `tenant-management`: Mengelola tenant (organisasi/yayasan), profile, settings tenant-level
- `school-management`: Mengelola sekolah per tenant, metadata sekolah, jenjang (TK/SD/SMP/SMA)
- `academic-year-management`: Mengelola tahun ajaran per sekolah, periode, status
- `admission-wave-management`: Mengelola gelombang pendaftaran per tahun ajaran, jadwal, kuota
- `admission-track-management`: Mengelola jalur seleksi per gelombang, kuota per jalur, priority

### Modified Capabilities

(Tidak ada capability existing yang diubah)

## Impact

**Affected Systems:**
- **Frontend**: Admin portal akan punya menu config untuk setup tenant/sekolah/gelombang/jalur
- **Backend**: Semua query modul operasional (aplikasi, seleksi, dll) akan filter by school_id dan academicYear_id
- **Database**: 5 tabel master baru + foreign key constraints

**Dependencies Downstream:**
- OPS-003 (dynamic form) bergantung pada school + wave context
- OPS-004 (applicant intake) bergantung pada available waves/tracks
- OPS-006 (selection) bergantung pada track kuota
- Semua modul harus scope by school_id + year_id

**Risks:**
- Jika kuota tidak divalidasi, aplikasi bisa exceeded
- Jika period tidak dikunci saat gelombang berjalan, bisa chaos
- Data master ini adalah foundation — perubahan di sini impact semua downstream
