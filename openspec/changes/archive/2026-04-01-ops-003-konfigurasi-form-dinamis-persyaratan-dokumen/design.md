<artifact id="design" change="ops-003-konfigurasi-form-dinamis-persyaratan-dokumen">

# Design Document: OPS-003 Konfigurasi Form Dinamis & Persyaratan Dokumen

## Context
Sistem PPDB yang dibangun harus mendukung multi-tenant (banyak sekolah dalam satu tenant dinas, atau multiple tenant independen). Karena setiap tenant, sekolah, atau bahkan jalur penerimaan (track) sering kali memiliki kebijakan pendaftaran yang unik (contoh: jalur prestasi membutuhkan upload dokumen Piagam, jalur zonasi membutuhkan input titik koordinat rumah), sistem tidak bisa menggunakan form pendaftaran statis. Oleh karena itu, kita membutuhkan arsitektur backend yang mendukung penyimpanan definisi form dan dokumen secara dinamis, serta engine frontend yang mampu merender UI berdasarkan definisi tersebut.

## Architecture & Components
1. **Dynamic Form & Document Definition (Backend)**
   - Schema desain form dan dokumen akan menggunakan JSONB column di PostgreSQL untuk menyimpan struktur schema. Pendekatan lain adalah menggunakan EAV (Entity Attribute Value), tetapi JSONB lebih performant, scalable, dan lebih pas dengan arsitektur data NoSQL di dalam Relational Database untuk data dengan fleksibilitas tinggi.
   - Entitas: `RegistrationConfig` yang akan berelasi dengan `School`, `AcademicYear`, `Wave`, atau `Track` (tergantung level spesifikasinya).
2. **Registration Record (Backend)**
   - Data submisi pendaftaran dari calon siswa (Applicant) akan disimpan dalam format JSON untuk mengakomodasi field "dinamis" `RegistrationFormAnswers` beserta file attachment map untuk `RequiredDocuments`.
3. **Dynamic Form Rendering (Frontend)**
   - Menggunakan pattern schema-to-UI di mana respon API definition form akan diubah menjadi React component secara on-the-fly (`FormBuilder` & `FormRenderer`).

## Goals / Non-Goals
**Goals:**
- Pihak Admin dapat membuat, mengubah, atau menghapus form field tertentu (misalnya, teks singkat, angka, pilihan ganda, input file) melalui antarmuka Admin Portal.
- Applicant Portal akan menghasilkan form registrasi yang disesuaikan secara dinamis tanpa intervensi developer (zero-code modification on registration logic).
- Validasi form pendaftaran (tipe tipe field, batasan ukuran berkas dokumen) terjadi secara dinamis.

**Non-Goals:**
- Membangun drag-and-drop form builder visual yang sangat kompleks di rilis awal (JSON editor logic di belakang layer admin sudah cukup sebagai MVP).
- Tidak difokuskan pada pemrosesan optik dokumen (OCR) uploaded files untuk MVP; hanya upload validation.

## Decisions
1. **Data Model untuk Schema Formulir**: Menggunakan field `JSONB` pada entitas `track_requirements` atau entitas konfigurasi terpisah ketimbang tabel relation mapping murni (EAV), karena baca/tulis satu JSON dokumen utuh lebih mudah dalam API REST, dan kita tak sering men-join metadata field form dalam analytic reporting (biasanya hanya read whole config untuk rendering).
2. **Schema Engine Backend**: Akan didefinisikan standar JSON Schema (mirip format JSON Schema API standards) untuk mendeskripsikan tipe input (`type`, `label`, `required`, `validationRules`).
3. **Penyimpanan Dokumen Upload**: Menggunakan cloud/local storage presigned URLs/direct integration di mana path UUID nya akan diregistrasi ke jawaban form JSONB sang pendaftar.

## Risks / Trade-offs
- **Risk**: Penyimpanan data form secara dinamis di field JSONB membuat query analitik (mencari semua siswa dengan tinggi badan > 160cm jika Tinggi Badan adalah custom form) menjadi lebih kompleks di sisi database.
  - **Mitigation**: Fokus utama saat ini adalah kelancaran transaksi pendaftaran. Analytical query dapat di-offload ke reporting pipeline terpisah via indexing GIN pada Postgres nantinya.
- **Risk**: Kelemahan keamanan saat mengunggah dokumen arbitrer dari berbagai tenant.
  - **Mitigation**: Membatasi ketat tipe mime-type, max length pada reverse-proxy (nginx/API layer) sebelum processing dokumen, ditambah layer pemisah bucket.

</artifact>
