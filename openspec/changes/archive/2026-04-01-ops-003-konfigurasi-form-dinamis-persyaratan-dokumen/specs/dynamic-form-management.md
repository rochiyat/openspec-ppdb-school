<artifact id="specs" change="ops-003-konfigurasi-form-dinamis-persyaratan-dokumen">

# Specification: Dynamic Form Management

## ADDED Requirements

### Requirement: CRUD Operations for Dynamic Form Config
Admin dapat membuat konfigurasi definisi array of fields form input pendaftaran berdasarkan scope (opsional: tingkat sekolah, jenjang, per wave, atau per track). Konfigurasi ini disimpan di field JSONB `registration_fields` atau direpresantasikan melalui endpoint yang menyajikan definisi form terpadu.

#### Scenario: Admin creates a new custom text field
- **GIVEN** proper scope validation as an admin
- **WHEN** Admin submits payload for a new form field configuration (e.g. Tinggi Badan, Number)
- **THEN** The backend validates the schema and stores the definition configuration.

#### Scenario: Admin restricts field based on admission track
- **GIVEN** existing track (e.g., Jalur Prestasi)
- **WHEN** Admin links a custom form field (e.g. Asal Lomba Prestasi) specifically to that track
- **THEN** Backend updates the configuration and only applicants on that track will see this field.

### Requirement: Frontend Dynamic Renderer Implementation
Sisi frontend (Applicant Portal) menampilkan interaktif state component dari definisi JSON yang bersumber dari API config backend dengan layout responsif. Tipe `input` harus mematuhi validasi minimal `pattern`, `min/max`, `required`.

#### Scenario: Applicant navigates to Registration Form
- **GIVEN** the applicant's selected school and admission track
- **WHEN** the frontend requests the active configuration
- **THEN** it renders specific custom inputs defined for the track on top of basic predefined fields (Name, NISN).

## MODIFIED Requirements
None affected previously, as registration forms were purely static and this capability creates the new dynamic rendering entry point.

</artifact>
