## ADDED Requirements

### Requirement: Sistem dapat mengelola tahun ajaran per sekolah
The system SHALL menyediakan CRUD tahun ajaran untuk setiap sekolah.

#### Scenario: Membuat tahun ajaran
- **WHEN** school admin membuat tahun ajaran dengan school_id valid dan rentang tanggal valid
- **THEN** sistem membuat record tahun ajaran dengan status draft atau active sesuai payload

### Requirement: Tahun ajaran aktif tidak boleh lebih dari satu per sekolah
The system MUST mencegah lebih dari satu academic year aktif pada sekolah yang sama.

#### Scenario: Aktivasi kedua pada sekolah sama
- **WHEN** admin mengaktifkan tahun ajaran baru saat masih ada tahun ajaran aktif
- **THEN** sistem menolak operasi dan mengembalikan error validasi

### Requirement: Periode tahun ajaran harus valid
The system SHALL memvalidasi bahwa `start_date` lebih kecil dari `end_date`.

#### Scenario: Rentang tanggal tidak valid
- **WHEN** admin membuat tahun ajaran dengan start_date lebih besar atau sama dengan end_date
- **THEN** sistem mengembalikan error validasi periode

### Requirement: Status tahun ajaran dapat diubah tanpa hard delete
The system SHALL mendukung activate, deactivate, dan archive pada tahun ajaran dengan soft lifecycle.

#### Scenario: Archive tahun ajaran selesai
- **WHEN** admin mengarsipkan tahun ajaran yang telah selesai
- **THEN** sistem menandai status archived tanpa menghapus data historis
