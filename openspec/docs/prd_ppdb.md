# PRD — PPDB Sekolah

## 1. Metadata
- **Nama produk:** PPDB Sekolah
- **Versi:** 1.2
- **Status:** Ready for Production Build
- **Target platform:** Web responsive
- **Frontend:** React + Vite + TypeScript
- **Backend:** Node.js + TypeScript
- **ORM:** TypeORM
- **Database:** PostgreSQL
- **Media upload:** Cloudinary
- **Email provider:** Resend
- **WhatsApp provider:** Fonnte
- **Payment MVP:** Manual transfer + upload bukti transfer
- **Dokumen:** AI-friendly product requirements document

---

## 2. Ringkasan Produk
PPDB Sekolah adalah platform penerimaan peserta didik baru untuk **TK, SD, SMP, dan SMA** yang mendukung konfigurasi multi-sekolah, multi-gelombang, multi-jalur, dan multi-role. Produk ini dirancang untuk kebutuhan sekolah tunggal maupun yayasan yang menaungi banyak sekolah.

Fokus utama produk:
- pendaftaran online yang mudah untuk pendaftar/orang tua,
- operasional panitia yang efisien,
- seleksi yang fleksibel dan dapat dikonfigurasi,
- daftar ulang dengan pembayaran manual berbasis upload bukti transfer,
- notifikasi terintegrasi,
- audit log lengkap,
- arsitektur siap produksi dan mudah diturunkan ke implementasi engineering.

---

## 3. Keputusan Produk yang Sudah Dikunci
1. **Tenant model:** 1 tenant dapat memiliki banyak sekolah.
2. **Nomor pendaftaran:** format default `PPDB-{TAHUN}-{KODE_SEKOLAH}-{RUNNING_NUMBER}`.
   - contoh: `PPDB-2026-SMAA-000123`
3. **Login pendaftar:** email atau nomor HP, salah satu wajib unik.
4. **Verifikasi akun:** sesuai saran, cukup verifikasi dasar dan dapat ditingkatkan kemudian.
5. **Draft form:** autosave + tombol simpan draft.
6. **Upload bukti transfer:** 1 bukti transfer aktif, dengan histori revisi.
7. **Review pembayaran:** 1 langkah oleh `finance_admin` atau `school_admin`, seluruh aksi masuk audit log.
8. **Publish hasil:** mendukung manual publish dan scheduled publish.
9. **Status daftar ulang:** ada status antara untuk pendaftar yang diterima tetapi belum konfirmasi.
10. **Portal:** dipisah dengan route berbeda, bukan role picker.
    - `/applicant/*`
    - `/admin/*`
11. **Custom field:** berlaku per sekolah + jenjang + gelombang.
12. **Export:** prioritas Excel/CSV untuk MVP.
13. **RBAC:** user dapat memiliki multiple role, permission digabung per active scope, tidak perlu memilih role per session.
14. **Session model:** user memilih **portal** dan **scope aktif** bila relevan, bukan memilih role.
15. **Midtrans:** skip untuk fase sekarang.

---

## 4. Goal Produk
### 4.1 Business Goals
1. Meningkatkan jumlah pendaftaran yang selesai sampai tahap submit final.
2. Mengurangi pekerjaan manual panitia PPDB.
3. Mempercepat verifikasi dokumen dan pembayaran.
4. Menyediakan transparansi status pendaftaran ke pendaftar.
5. Menyediakan sistem yang dapat dipakai lintas jenjang dan lintas sekolah.

### 4.2 Product Goals
1. Pendaftar dapat membuat akun, memilih sekolah/jenjang, mengisi formulir, upload dokumen, dan submit secara mandiri.
2. Admin dapat mengatur gelombang, jalur, kuota, dokumen, dan jadwal.
3. Panitia dapat memverifikasi dokumen dan melakukan seleksi.
4. Finance admin dapat memverifikasi bukti transfer daftar ulang.
5. Sistem menyediakan pelaporan, notifikasi, dan audit yang jelas.

### 4.3 Non-Goals
1. LMS atau sistem akademik penuh.
2. Mobile app native.
3. Integrasi payment gateway di MVP.
4. CBT penuh untuk tes online kompleks.

---

## 5. Persona
### 5.1 Applicant / Orang Tua / Wali
- membuat akun,
- mengisi formulir,
- upload dokumen,
- submit aplikasi,
- melihat hasil,
- konfirmasi daftar ulang,
- upload bukti transfer.

### 5.2 Verifier
- verifikasi dokumen pendaftaran,
- request revisi,
- approve/reject dokumen.

### 5.3 Reviewer
- review kandidat,
- membantu preview hasil seleksi,
- akses laporan tertentu.

### 5.4 Finance Admin
- review bukti transfer,
- approve/reject pembayaran,
- menandai kasus manual review.

### 5.5 School Admin
- mengelola konfigurasi sekolah,
- mengelola gelombang, jalur, kuota,
- publish hasil,
- memonitor operasi sekolah.

### 5.6 Principal
- memonitor dashboard, laporan, dan audit,
- approval terbatas bila diperlukan kebijakan sekolah.

### 5.7 Super Admin
- mengelola banyak sekolah dalam tenant,
- mengelola policy lintas sekolah,
- mengakses laporan agregat.

---

## 6. Scope MVP Production
### 6.1 In Scope
1. Multi-school dan multi-jenjang.
2. Registrasi akun dan login.
3. Form pendaftaran dinamis.
4. Save draft dan submit final.
5. Upload dan verifikasi dokumen.
6. Seleksi administratif dan rule-based.
7. Publish hasil manual dan terjadwal.
8. Daftar ulang.
9. Pembayaran manual via transfer bank.
10. Upload bukti transfer via Cloudinary.
11. Review bukti transfer oleh admin keuangan.
12. Notifikasi email via Resend.
13. Notifikasi WhatsApp via Fonnte.
14. Retry notifikasi maksimal 3 kali dan penyimpanan semua attempt ke tabel.
15. Reminder sebelum deadline daftar ulang.
16. Reminder saat bukti transfer ditolak.
17. Export Excel/CSV.
18. Audit log lengkap.
19. RBAC multi-role dengan scope.

### 6.2 Out of Scope
1. Integrasi Midtrans.
2. Native mobile app.
3. Integrasi regulator eksternal real-time.
4. Payment reconciliation otomatis dengan bank.

---

## 7. Prinsip Desain
1. **Config over hardcode** — aturan sekolah/jenjang/jalur harus configurable.
2. **Auditability first** — semua aksi penting dapat ditelusuri.
3. **Scoped access** — data dibatasi tenant, sekolah, dan portal aktif.
4. **Union permissions** — user dengan multiple role memperoleh gabungan permission sesuai scope aktif.
5. **Portal over role switching** — user memilih portal/context, bukan memilih role untuk session.
6. **Production-ready modularity** — domain dipisahkan jelas.
7. **Privacy by default** — akses PII dibatasi berdasarkan permission.

---

## 8. User Journey Utama
### 8.1 Applicant Journey
1. Register atau login.
2. Masuk ke portal applicant.
3. Memilih sekolah, jenjang, gelombang, jalur.
4. Mengisi form dan upload dokumen.
5. Save draft otomatis dan manual.
6. Submit final.
7. Memantau status verifikasi.
8. Merevisi jika diminta.
9. Melihat hasil seleksi.
10. Jika diterima, konfirmasi daftar ulang.
11. Melihat instruksi transfer.
12. Upload bukti transfer.
13. Menunggu review pembayaran.

### 8.2 Admin Journey
1. Login ke portal admin.
2. Memilih tenant/school scope aktif.
3. Mengelola konfigurasi gelombang, jalur, form, dan syarat dokumen.
4. Verifikasi dokumen.
5. Menjalankan seleksi.
6. Publish hasil.
7. Memonitor daftar ulang dan pembayaran.
8. Menarik laporan dan audit log.

---

## 9. Functional Requirements
### 9.1 Authentication & Session
- **FR-AUTH-001** Sistem harus mendukung registrasi dengan email atau nomor HP.
- **FR-AUTH-002** Sistem harus mendukung login dengan kredensial valid.
- **FR-AUTH-003** Sistem harus mendukung reset password.
- **FR-AUTH-004** Sistem harus mendukung multi-role pada satu user.
- **FR-AUTH-005** Sistem harus mendukung active portal (`applicant`, `admin`).
- **FR-AUTH-006** Sistem harus mendukung active scope (`tenant_id`, `school_id`) untuk portal admin.
- **FR-AUTH-007** Sistem harus menghitung **effective permissions** sebagai union dari semua role yang aktif pada scope tersebut.

### 9.2 School & Admission Setup
- **FR-CONF-001** Sistem harus mendukung banyak sekolah dalam satu tenant.
- **FR-CONF-002** Sistem harus mendukung jenjang TK, SD, SMP, SMA.
- **FR-CONF-003** Sistem harus mendukung banyak tahun ajaran.
- **FR-CONF-004** Sistem harus mendukung banyak gelombang pendaftaran.
- **FR-CONF-005** Sistem harus mendukung banyak jalur seleksi per sekolah/jenjang/gelombang.
- **FR-CONF-006** Sistem harus mendukung kuota total dan kuota per jalur.

### 9.3 Application Form
- **FR-APP-001** Sistem harus menyediakan form pendaftaran dinamis.
- **FR-APP-002** Sistem harus mendukung autosave.
- **FR-APP-003** Sistem harus mendukung save draft manual.
- **FR-APP-004** Sistem harus mengunci data inti setelah submit final kecuali dibuka oleh admin.
- **FR-APP-005** Sistem harus menghasilkan nomor pendaftaran unik.
- **FR-APP-006** Sistem harus mendukung custom field per sekolah + jenjang + gelombang.

### 9.4 Document Management
- **FR-DOC-001** Sistem harus mendukung upload JPG, PNG, PDF.
- **FR-DOC-002** Sistem harus mendukung versi dokumen.
- **FR-DOC-003** Sistem harus mendukung review per item dokumen.
- **FR-DOC-004** Sistem harus mendukung request revisi dengan catatan.
- **FR-DOC-005** Sistem harus menyimpan histori semua perubahan dokumen.

### 9.5 Selection
- **FR-SEL-001** Sistem harus mendukung rule-based scoring.
- **FR-SEL-002** Sistem harus mendukung ranking otomatis per jalur.
- **FR-SEL-003** Sistem harus mendukung override manual dengan alasan wajib.
- **FR-SEL-004** Sistem harus menyimpan snapshot rule dan hasil seleksi.
- **FR-SEL-005** Sistem harus mendukung publish hasil manual dan terjadwal.

### 9.6 Re-registration & Payment Proof
- **FR-REG-001** Sistem harus mendukung konfirmasi daftar ulang.
- **FR-REG-002** Sistem harus menampilkan instruksi transfer berdasarkan setting sekolah.
- **FR-REG-003** Sistem harus mendukung upload bukti transfer ke Cloudinary.
- **FR-REG-004** Sistem harus menyimpan metadata Cloudinary ke database.
- **FR-REG-005** Sistem harus mendukung satu bukti transfer aktif dengan histori revisi.
- **FR-REG-006** Sistem harus mendukung review bukti transfer oleh `finance_admin` atau `school_admin`.
- **FR-REG-007** Sistem harus mendukung penolakan bukti transfer dengan alasan.
- **FR-REG-008** Sistem harus mendukung penandaan manual review untuk kasus mencurigakan.
- **FR-REG-009** Sistem harus mengirim reminder sebelum deadline daftar ulang.
- **FR-REG-010** Sistem harus mengirim reminder saat bukti transfer ditolak.

### 9.7 Notifications
- **FR-NOTIF-001** Sistem harus mendukung provider Resend untuk email.
- **FR-NOTIF-002** Sistem harus mendukung provider Fonnte untuk WhatsApp.
- **FR-NOTIF-003** Sistem harus mendukung template notifikasi per event.
- **FR-NOTIF-004** Sistem harus melakukan retry maksimal 3 kali.
- **FR-NOTIF-005** Semua attempt pengiriman harus tersimpan di tabel `notification_logs`.

### 9.8 Audit & Reporting
- **FR-AUD-001** Semua aksi create/update/delete/approve/reject/publish/login harus terekam.
- **FR-AUD-002** Audit log harus menyimpan actor, scope, entity, action, before, after, reason, timestamp.
- **FR-REP-001** Sistem harus menyediakan dashboard utama.
- **FR-REP-002** Sistem harus mendukung export Excel/CSV.
- **FR-REP-003** Sistem harus mendukung filter berdasarkan sekolah, jenjang, gelombang, jalur, status.

---

## 10. Non-Functional Requirements
### 10.1 Performance
- P95 read API < 500 ms pada beban normal.
- P95 write API < 800 ms pada beban normal.
- Sistem harus siap menghadapi burst saat hari terakhir pendaftaran dan hari pengumuman.

### 10.2 Availability
- Target uptime minimum 99.5% saat periode PPDB.
- Backup dan restore harus tersedia.

### 10.3 Security
- Password di-hash dengan algoritma kuat.
- Semua endpoint private harus diautentikasi.
- RBAC diverifikasi di service layer.
- Rate limit untuk auth dan endpoint sensitif.
- Validasi MIME type dan ukuran file wajib.
- Audit log wajib aktif untuk aksi penting.

### 10.4 Maintainability
- Codebase modular per domain.
- Unit test untuk service inti.
- Integration test untuk workflow utama.
- Logging terstruktur di backend.

### 10.5 Observability
- Error tracking wajib tersedia.
- Metrics untuk API, jobs, notifikasi, dan pembayaran manual.
- Correlation ID wajib tersedia.

---

## 11. Status Lifecycle
### 11.1 Application Status
- `draft`
- `submitted`
- `under_review`
- `revision_requested`
- `verified`
- `rejected_administrative`
- `selection_pending`
- `accepted`
- `accepted_pending_confirmation`
- `waitlisted`
- `rejected`
- `re_registered`
- `expired`
- `cancelled`

### 11.2 Document Status
- `pending`
- `approved`
- `rejected`
- `revision_requested`

### 11.3 Payment Status
- `unpaid`
- `waiting_for_proof`
- `proof_uploaded`
- `under_review`
- `paid`
- `rejected`
- `expired`

---

## 12. RBAC Design
### 12.1 Built-in Roles
- `applicant`
- `verifier`
- `reviewer`
- `finance_admin`
- `school_admin`
- `principal`
- `super_admin`

### 12.2 RBAC Rules
1. Satu user dapat memiliki lebih dari satu role.
2. Role dapat diberi scope tenant-level atau school-level.
3. Effective permission dihitung sebagai union dari semua role user pada scope aktif.
4. User **tidak memilih role** saat login.
5. User hanya memilih **portal** dan **scope aktif** bila diperlukan.
6. Akses data harus selalu difilter berdasarkan scope aktif.
7. System roles tidak boleh dihapus.
8. Permission mapping dapat diedit oleh super admin sesuai kebijakan tenant.

### 12.3 Portal Behavior
- `applicant` dan `admin` dipisahkan sebagai portal.
- Role admin yang berbeda dapat hidup dalam satu session di portal admin.
- Menu tampil berdasarkan effective permissions di scope aktif.

### 12.4 Role Matrix Ringkas
| Role | Portal | Scope | Fungsi Utama |
|---|---|---|---|
| applicant | applicant | self | isi form, submit, daftar ulang |
| verifier | admin | school | verifikasi dokumen |
| reviewer | admin | school | review seleksi & laporan tertentu |
| finance_admin | admin | school | review bukti transfer |
| school_admin | admin | school | operasional penuh tingkat sekolah |
| principal | admin | school | monitoring, report, approval terbatas |
| super_admin | admin | tenant | kontrol lintas sekolah |

---

## 13. Data Model Konseptual
### 13.1 Core Entities
- Tenant
- School
- AcademicYear
- AdmissionWave
- AdmissionTrack
- User
- Role
- Permission
- UserRole
- RolePermission
- Applicant
- Guardian
- Application
- ApplicationFieldValue
- DocumentRequirement
- ApplicationDocument
- VerificationReview
- SelectionRule
- SelectionRun
- SelectionResult
- ReRegistration
- Payment
- PaymentProof
- PaymentReview
- NotificationLog
- AuditLog
- BankAccountSetting
- UploadSetting
- SystemConfig

### 13.2 Entitas Penting Tambahan
#### Payment
- `application_id`
- `amount`
- `status`
- `manual_review_required`
- `reviewed_by`
- `reviewed_at`
- `review_notes`

#### PaymentProof
- `payment_id`
- `cloudinary_public_id`
- `cloudinary_secure_url`
- `resource_type`
- `format`
- `bytes`
- `original_file_name`
- `mime_type`
- `uploaded_at`
- `is_active`

#### NotificationLog
- `channel`
- `provider`
- `recipient`
- `template_code`
- `attempt_no`
- `status`
- `provider_message_id`
- `error_message`
- `sent_at`

#### UserRole
- `user_id`
- `role_id`
- `tenant_id`
- `school_id` nullable
- `is_active`

---

## 14. Frontend Requirements
### 14.1 Stack
- React + Vite + TypeScript
- React Router
- TanStack Query
- React Hook Form + Zod
- Zustand atau context untuk UI/session state
- UI library: shadcn/ui atau setara
- TanStack Table

### 14.2 Route Map
#### Applicant Portal
- `/applicant/login`
- `/applicant/dashboard`
- `/applicant/profile`
- `/applicant/applications`
- `/applicant/applications/new`
- `/applicant/applications/:id`
- `/applicant/applications/:id/documents`
- `/applicant/applications/:id/status`
- `/applicant/applications/:id/re-registration`

#### Admin Portal
- `/admin/login`
- `/admin/dashboard`
- `/admin/scope-switcher`
- `/admin/applications`
- `/admin/verifications`
- `/admin/selection`
- `/admin/payments`
- `/admin/config/schools`
- `/admin/config/waves`
- `/admin/config/tracks`
- `/admin/config/forms`
- `/admin/config/payment-settings`
- `/admin/reports`
- `/admin/audit-logs`
- `/admin/users`

### 14.3 Frontend Acceptance
- autosave aktif pada form utama,
- loading/empty/error state tersedia,
- menu mengikuti effective permissions,
- portal applicant dan admin terpisah jelas,
- scope switcher tersedia untuk user multi-school.

---

## 15. Backend Requirements
### 15.1 Stack
- Node.js + TypeScript
- Framework: NestJS atau Fastify modular
- TypeORM
- PostgreSQL
- Redis
- BullMQ
- Cloudinary SDK
- Resend SDK
- Fonnte integration wrapper

### 15.2 Module Boundaries
- auth
- users
- roles-permissions
- schools
- admissions
- applications
- documents
- selection
- re-registration
- payments
- notifications
- reports
- audit
- config
- shared

### 15.3 Background Jobs
- send notification job
- notification retry job
- selection execution job
- waitlist promotion job
- reminder before re-registration deadline job
- reminder rejected payment proof job
- cleanup temporary uploads job

### 15.4 Storage Rules
- File tidak disimpan di local disk production.
- Bukti transfer diunggah ke Cloudinary.
- Aturan upload bukti transfer diatur lewat `upload_settings`.
- Backend wajib memvalidasi MIME type dan ukuran file.
- Metadata file wajib disimpan di database.

---

## 16. Notification Design
### 16.1 Channels
- email via Resend
- WhatsApp via Fonnte

### 16.2 Retry Policy
- maksimal 3 attempt,
- semua attempt tercatat,
- job dinyatakan gagal permanen setelah attempt ke-3.

### 16.3 Trigger Minimum
- registrasi berhasil,
- submit aplikasi,
- revisi dokumen diminta,
- hasil seleksi dipublish,
- diterima dan diminta daftar ulang,
- reminder sebelum deadline daftar ulang,
- bukti transfer ditolak,
- pembayaran tervalidasi.

---

## 17. Manual Payment Design
### 17.1 Payment Flow
1. Applicant diterima.
2. Applicant konfirmasi daftar ulang.
3. Sistem menampilkan instruksi transfer.
4. Applicant upload bukti transfer.
5. Sistem mengubah status menjadi `proof_uploaded`.
6. Finance admin review.
7. Jika valid → `paid`.
8. Jika tidak valid → `rejected` + alasan.
9. Jika mencurigakan → `under_review` + `manual_review_required = true`.

### 17.2 School Payment Settings
Per sekolah tersedia setting:
- nama bank,
- nomor rekening,
- nama pemilik rekening,
- instruksi transfer,
- nominal default per jalur atau gelombang,
- status aktif/nonaktif.

### 17.3 Upload Settings
Per sekolah tersedia setting:
- kategori upload,
- allowed mime types,
- max file size,
- folder pattern Cloudinary,
- require signed upload yes/no.

---

## 18. Reports
### 18.1 Dashboard
- total pendaftar,
- total submit,
- total verified,
- total accepted,
- total re-registered,
- total bukti transfer menunggu review,
- total pembayaran ditolak,
- conversion rate utama.

### 18.2 Export
- applicants export
- selection result export
- payment review export
- notification log export
- audit log export

Format prioritas: **Excel/CSV**.

---

## 19. Audit Design
Audit log wajib mencatat:
- actor,
- role snapshot,
- portal,
- active scope,
- entity,
- action,
- before,
- after,
- reason,
- timestamp.

Aksi minimum yang diaudit:
- login,
- assign role,
- ubah konfigurasi,
- submit aplikasi,
- approve/reject dokumen,
- run selection,
- publish result,
- upload bukti transfer,
- approve/reject pembayaran,
- manual review flag.

---

## 20. Environment Variables Minimum
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `MAIL_FROM`
- `RESEND_API_KEY`
- `FONNTE_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SENTRY_DSN`

---

## 21. QA & Testing Strategy
### 21.1 Unit Tests
- auth service
- permission resolver
- selection calculator
- notification dispatcher
- payment review service

### 21.2 Integration Tests
- register → create application → submit
- upload doc → review → revise → approve
- execute selection → publish result
- confirm re-registration → upload payment proof → review payment
- notification retry sampai 3 kali dan semua attempt tersimpan

### 21.3 E2E Tests
- applicant full journey
- admin verification journey
- finance admin payment journey
- multi-role admin with scope switching journey

---

## 22. Definition of Done
Release MVP dianggap selesai bila:
1. Applicant dapat register, login, isi form, upload dokumen, dan submit.
2. Admin dapat mengatur sekolah, gelombang, jalur, dan syarat dokumen.
3. Verifier dapat memverifikasi dokumen.
4. Admin dapat menjalankan seleksi dan publish hasil.
5. Applicant yang diterima dapat daftar ulang dan upload bukti transfer.
6. Finance admin dapat review bukti transfer.
7. Notifikasi email/WhatsApp berjalan dengan retry policy 3x dan seluruh log tersimpan.
8. Dashboard, export, audit log, dan scope-aware RBAC berfungsi.
9. Sistem lolos baseline QA, security, dan performance.

---

## 23. AI-Friendly Build Notes
Untuk implementasi engineering:
1. Mulai dari modular monolith.
2. Bangun RBAC lebih awal karena mempengaruhi seluruh modul.
3. Pisahkan portal applicant dan admin sejak awal.
4. Gunakan active scope resolver di setiap request admin.
5. Simpan notification log dan audit log sebagai cross-cutting concern.
6. Jangan hardcode aturan jalur, field, atau dokumen.
7. Siapkan payment module sebagai domain terpisah walau masih manual transfer.

---

## 24. Executive Summary
PPDB Sekolah adalah sistem PPDB generik untuk TK, SD, SMP, dan SMA yang siap dipakai pada skenario multi-sekolah. Sistem menggabungkan portal pendaftar, portal admin, seleksi berbasis konfigurasi, daftar ulang dengan pembayaran manual, notifikasi Resend/Fonnte, upload bukti transfer melalui Cloudinary, serta RBAC multi-role yang dihitung berdasarkan scope aktif. Dokumen ini siap dijadikan dasar untuk technical design, schema database, API design, dan breakdown sprint engineering.

