# Tenant Management

## Purpose

Mengelola organisasi multi-tenant (yayasan/tenant), kode unik, pengaturan level organisasi, dan scope akses admin.

## Requirements

### Requirement: Sistem dapat membuat dan mengelola tenant
The system SHALL menyediakan operasi create, read, update, dan deactivate untuk data tenant.

#### Scenario: Membuat tenant baru
- **WHEN** super admin mengirim data tenant valid (name, code, contact)
- **THEN** sistem membuat tenant dengan status aktif dan mengembalikan detail tenant

#### Scenario: Menonaktifkan tenant
- **WHEN** super admin melakukan deactivate tenant
- **THEN** sistem menandai tenant nonaktif tanpa hard delete

### Requirement: Tenant code harus unik
The system SHALL menolak pembuatan tenant jika `code` sudah digunakan tenant lain.

#### Scenario: Tenant code duplikat
- **WHEN** super admin membuat tenant dengan code yang sudah ada
- **THEN** sistem mengembalikan error konflik data

### Requirement: Sistem menerapkan scope tenant pada endpoint administrasi
The system MUST memvalidasi bahwa user admin hanya dapat mengakses tenant sesuai scope otorisasi.

#### Scenario: Akses tenant dalam scope
- **WHEN** admin tenant meminta detail tenant miliknya
- **THEN** sistem mengembalikan data tenant

#### Scenario: Akses tenant di luar scope
- **WHEN** admin tenant meminta data tenant lain
- **THEN** sistem mengembalikan 403 Forbidden

### Requirement: Tenant menyimpan konfigurasi level organisasi
The system SHALL menyimpan pengaturan tenant-level (timezone, branding dasar, pengaturan admission default).

#### Scenario: Update setting tenant
- **WHEN** super admin mengubah setting tenant dengan payload valid
- **THEN** sistem menyimpan perubahan dan mencatat audit log
