## ADDED Requirements

### Requirement: Sistem dapat mengelola jalur seleksi pada setiap gelombang
The system SHALL menyediakan CRUD admission track yang terikat ke admission wave.

#### Scenario: Membuat jalur seleksi
- **WHEN** admin membuat track baru pada wave valid dengan nama dan kuota
- **THEN** sistem menyimpan track pada wave tersebut

### Requirement: Jumlah kuota jalur tidak boleh melebihi kuota total gelombang
The system MUST memvalidasi bahwa total `track_quota` dalam satu wave kurang dari atau sama dengan `wave_total_quota`.

#### Scenario: Total kuota jalur melebihi kuota wave
- **WHEN** admin menambah atau update track sehingga total kuota melampaui kuota wave
- **THEN** sistem menolak operasi dengan error validasi kuota

### Requirement: Jalur seleksi memiliki prioritas urutan
The system SHALL menyimpan dan menerapkan `priority_order` unik dalam satu admission wave.

#### Scenario: Priority duplikat dalam satu wave
- **WHEN** admin menyimpan dua track dengan priority_order yang sama pada wave yang sama
- **THEN** sistem mengembalikan error konflik prioritas

### Requirement: Jalur nonaktif tidak ikut proses intake baru
The system SHALL mengecualikan track nonaktif dari daftar track yang dapat dipilih applicant.

#### Scenario: Applicant melihat daftar jalur
- **WHEN** applicant membuka pilihan jalur pada wave aktif
- **THEN** sistem hanya menampilkan track dengan status aktif
