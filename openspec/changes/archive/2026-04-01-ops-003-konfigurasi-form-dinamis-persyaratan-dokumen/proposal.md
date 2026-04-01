<artifact id="proposal" change="ops-003-konfigurasi-form-dinamis-persyaratan-dokumen">

# Proposal: OPS-003 Konfigurasi Form Dinamis & Persyaratan Dokumen

## Context
Sistem penerimaan peserta didik baru (PPDB) perlu secara fleksibel mengakomodasi kebutuhan input data dan persyaratan dokumen yang berbeda-beda untuk tiap jenjang pendidikan (school), tahun ajaran (academic year), gelombang (wave), maupun jalur pendaftaran (track). Beberapa jalur mungkin mensyaratkan dokumen spesifik (contoh: piagam penghargaan untuk jalur prestasi) atau pengisian field khusus (contoh: titik koordinat rumah untuk jalur zonasi).

## Proposed Changes
1. **Dynamic Form Definition System:**
   * Membuat entitas dan sistem untuk mendefinisikan kustom field form (misal: Text, Number, Date, Option/Select) dengan struktur JSON schema atau tabel relasional yang dapat diletakkan di berbagai level konfigurasi (organisasi/jalur pendaftaran).
2. **Document Required Config:**
   * Membuat mekanisme backend/pengaturan admin tata usaha untuk prasyarat kelengkapan dokumen (misal: KK, Akta Kelahiran, Surat Lulus, Pas Foto) dengan rule khusus per file upload (ukuran max, format file image/pdf, status mandatory/opsional).
3. **Applicant Dynamic Rendering:**
   * Render form pengisian dan pendaftaran di dalam aplikasi sisi Applicant (*Applicant Portal*) secara otomatis dan terisolasi berdasarkan API endpoint dari konfigurasi Admin.
4. **Admin UI Builder:**
   * Menyediakan UI di dashboard (*Admin Portal*) berbentuk Form/Document Builder yang intuitif bagi operator tata usaha atau super admin sekolah untuk merancang form penerimaan baru tanpa mengubah main codebase.

## Rationale
Pendekatan konvensional "hard-coding" field UI pendaftaran secara statik di codebase TypeScript React sangat kaku. Sistem tidak akan mudah direplikasi untuk tahun ajaran baru bila setiap sekolah atau dinas pendidikan sewaktu-watu mengubah persyaratan di pertengahan pelaksanaan penerimaan murid (PPDB). Hal ini akan menambah debt engineering intervensi developer, sehingga skalabilitas sistem perlu didukung Schema-driven Development konfigurasi dinamis.

## Impact
- **Database Schema:** Perlu adanya perancangan sistem tabel EAV (Entity-Attribute-Value) atau memanfaatkan `JSONB` column structure pada PostgreSQL.
- **Backend API:** Tambahan endpoint `FormBuilder`, dokumentasi file config, serta implementasi validasi schema dinamis pada input form request handler dan middleware.
- **Frontend App:** Redesain pembuatan komponen antarmuka menjadi bersifat template engine `DynamicFormRenderer` dan `DynamicDocumentUploader`.
- Serta, pemindahan storage strategy untuk file persistensi requirements dokumen.

### New Capabilities
- `dynamic-form-management`: Konfigurasi field input formulir spesifik yang dinamis di portal admin.
- `document-requirement-management`: Konfigurasi kewajiban persyaratan dokumen lampiran administrasi siswa dengan tipe dan filter MIME valid.

### Modified Capabilities
- `applicant-registration`: Routing flow registrasi dan submisi formulir biodata serta attachment dokumen tidak lagi bersandar pada validasi React statis, melainkan bersandar pada remote config dari backend validation schema rules.

</artifact>
