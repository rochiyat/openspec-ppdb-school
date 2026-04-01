# Admission Wave Management

## Purpose

Mengelola gelombang pendaftaran per tahun ajaran dan sekolah: jadwal, kuota, overlap periode, status, dan audit.

## Requirements

### Requirement: Sistem dapat mengelola gelombang pendaftaran per tahun ajaran
The system SHALL menyediakan CRUD admission wave untuk kombinasi school_id dan academic_year_id.

#### Scenario: Membuat gelombang baru
- **WHEN** school admin membuat gelombang dengan nama, periode, dan kuota total valid
- **THEN** sistem menyimpan gelombang pada tahun ajaran dan sekolah terkait

### Requirement: Periode gelombang aktif tidak boleh overlap pada scope yang sama
The system MUST menolak admission wave aktif yang overlap tanggal pada school_id dan academic_year_id yang sama.

#### Scenario: Overlap periode gelombang
- **WHEN** admin membuat gelombang dengan periode yang bertabrakan dengan gelombang aktif lain
- **THEN** sistem mengembalikan error validasi overlap

### Requirement: Gelombang menyimpan kuota total valid
The system SHALL mewajibkan nilai kuota total non-negatif pada admission wave.

#### Scenario: Kuota total invalid
- **WHEN** admin menyimpan gelombang dengan kuota total kurang dari nol
- **THEN** sistem mengembalikan error validasi kuota

### Requirement: Perubahan status gelombang harus terlacak
The system SHALL mencatat perubahan status gelombang (draft, active, closed, archived) ke audit log.

#### Scenario: Menutup gelombang
- **WHEN** admin mengubah status gelombang menjadi closed
- **THEN** sistem menyimpan status baru dan membuat catatan audit
