## ADDED Requirements

### Requirement: Sistem dapat mengelola sekolah per tenant
The system SHALL menyediakan CRUD sekolah yang terikat ke satu tenant.

#### Scenario: Menambah sekolah ke tenant
- **WHEN** admin tenant membuat sekolah dengan tenant_id valid
- **THEN** sistem membuat sekolah dan menghubungkannya ke tenant tersebut

### Requirement: Identitas sekolah harus unik dalam satu tenant
The system SHALL menolak duplikasi `school_code` pada tenant yang sama.

#### Scenario: School code duplikat pada tenant sama
- **WHEN** admin tenant membuat sekolah dengan school_code yang sudah ada di tenant tersebut
- **THEN** sistem mengembalikan error konflik

### Requirement: Sekolah menyimpan metadata operasional
The system SHALL menyimpan metadata sekolah minimal: nama, jenjang, alamat, kontak, dan status aktif.

#### Scenario: Update metadata sekolah
- **WHEN** admin tenant memperbarui metadata sekolah valid
- **THEN** sistem menyimpan data terbaru dan update timestamp

### Requirement: Query sekolah wajib terfilter tenant scope
The system MUST mengembalikan daftar sekolah hanya untuk tenant yang sesuai dengan scope user.

#### Scenario: List sekolah berdasarkan tenant
- **WHEN** admin tenant meminta daftar sekolah
- **THEN** sistem hanya mengembalikan sekolah dalam tenant scope user
