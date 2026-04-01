## 1. Database Schema & Constraints

- [x] 1.1 Create migration for `tenants` table with unique tenant code and active status
- [x] 1.2 Create migration for `schools` table with FK to tenant and tenant-scoped unique school code
- [x] 1.3 Create migration for `academic_years` table with FK to school and date range fields
- [x] 1.4 Create migration for `admission_waves` table with FK to school and academic year, total quota, status
- [x] 1.5 Create migration for `admission_tracks` table with FK to wave, track quota, priority order, status
- [x] 1.6 Add FK constraints, unique constraints, and check constraints for non-negative quota
- [x] 1.7 Add index strategy for tenant/school/year/wave scoping queries
- [x] 1.8 Add migration rollback scripts and verify up/down execution

## 2. Business Validation Rules

- [x] 2.1 Implement service validation for tenant and school code uniqueness
- [x] 2.2 Implement validation to prevent multiple active academic years per school
- [x] 2.3 Implement date range validation (`start_date < end_date`) for academic year
- [x] 2.4 Implement overlap validation for active admission waves in same school + academic year
- [x] 2.5 Implement validation that sum of active track quota does not exceed wave total quota
- [x] 2.6 Implement validation for unique `priority_order` within same admission wave
- [x] 2.7 Implement soft lifecycle validation for activate/deactivate/archive transitions
- [x] 2.8 Add transactional guard for concurrent update on wave/track quota changes

## 3. Repository Layer Implementation

- [x] 3.1 Create TenantRepository with CRUD, status update, and scope-filtered list
- [x] 3.2 Create SchoolRepository with tenant-filtered CRUD operations
- [x] 3.3 Create AcademicYearRepository with school-scoped CRUD and active year query
- [x] 3.4 Create AdmissionWaveRepository with overlap checks and active wave query
- [x] 3.5 Create AdmissionTrackRepository with quota aggregation and priority checks
- [x] 3.6 Add repository query helpers for downstream context lookup (`school_id`, `academic_year_id`)

## 4. Service Layer Implementation

- [x] 4.1 Implement TenantService for tenant lifecycle and tenant-level settings
- [x] 4.2 Implement SchoolService for school CRUD, metadata update, and tenant scoping
- [x] 4.3 Implement AcademicYearService for school-year lifecycle and active year enforcement
- [x] 4.4 Implement AdmissionWaveService for wave CRUD, schedule checks, and status transitions
- [x] 4.5 Implement AdmissionTrackService for track CRUD, priority management, and quota checks
- [x] 4.6 Integrate audit log events for create/update/status transition across all services

## 5. Authorization & Scope Enforcement

- [x] 5.1 Add permission map for tenant/school/year/wave/track management endpoints
- [x] 5.2 Enforce tenant scope in all tenant and school operations
- [x] 5.3 Enforce school scope in academic year, wave, and track operations
- [x] 5.4 Return 403 response for cross-tenant and cross-school access attempts
- [x] 5.5 Add shared scope guard utility for admin configuration APIs

## 6. API Endpoints - Tenant & School

- [x] 6.1 Create `POST /admin/tenants` endpoint with payload validation
- [x] 6.2 Create `GET /admin/tenants` endpoint with scope-filtered list and pagination
- [x] 6.3 Create `PATCH /admin/tenants/:id` endpoint for profile/settings updates
- [x] 6.4 Create `PATCH /admin/tenants/:id/status` endpoint for activate/deactivate
- [x] 6.5 Create `POST /admin/schools` endpoint scoped to tenant
- [x] 6.6 Create `GET /admin/schools` endpoint filtered by tenant scope
- [x] 6.7 Create `PATCH /admin/schools/:id` endpoint for school metadata updates
- [x] 6.8 Create `PATCH /admin/schools/:id/status` endpoint for lifecycle changes

## 7. API Endpoints - Academic Year, Wave, Track

- [x] 7.1 Create `POST /admin/academic-years` endpoint with date validation
- [x] 7.2 Create `GET /admin/academic-years` endpoint filtered by school scope
- [x] 7.3 Create `PATCH /admin/academic-years/:id` endpoint with active year guard
- [x] 7.4 Create `PATCH /admin/academic-years/:id/status` endpoint (activate/deactivate/archive)
- [x] 7.5 Create `POST /admin/admission-waves` endpoint with overlap and quota validation
- [x] 7.6 Create `GET /admin/admission-waves` endpoint filtered by school + year
- [x] 7.7 Create `PATCH /admin/admission-waves/:id` endpoint with schedule and status checks
- [x] 7.8 Create `PATCH /admin/admission-waves/:id/status` endpoint (draft/active/closed/archive)
- [x] 7.9 Create `POST /admin/admission-tracks` endpoint with quota + priority validation
- [x] 7.10 Create `GET /admin/admission-tracks` endpoint filtered by wave
- [x] 7.11 Create `PATCH /admin/admission-tracks/:id` endpoint with quota recalculation
- [x] 7.12 Create `PATCH /admin/admission-tracks/:id/status` endpoint for active/nonactive state

## 8. API Response, Error Handling, and Auditability

- [x] 8.1 Standardize success response format for all OPS-002 endpoints
- [x] 8.2 Standardize validation/error response format with field-level details
- [x] 8.3 Add correlation ID propagation for all endpoint responses
- [x] 8.4 Add audit log payload structure for tenant/school/year/wave/track actions
- [x] 8.5 Log key events: create, update, status change, rejected validation, rejected scope access

## 9. Frontend Admin Configuration (Foundation UI)

- [x] 9.1 Add admin menu structure for Organization & Admission Setup
- [x] 9.2 Build tenant management page (list, create, edit, status toggle)
- [x] 9.3 Build school management page (tenant-scoped list, create, edit, status toggle)
- [x] 9.4 Build academic year page (school-scoped list, create, activate/deactivate/archive)
- [x] 9.5 Build admission wave page (year-scoped list, create, schedule/status controls)
- [x] 9.6 Build admission track page (wave-scoped list, create, quota, priority, status controls)
- [x] 9.7 Add frontend validation for quota constraints and date range before submit
- [x] 9.8 Add error banners/toasts for overlap, quota exceeded, and scope rejection cases

## 10. Testing Strategy

- [x] 10.1 Write migration tests for schema creation and rollback
- [x] 10.2 Write repository tests for scoped queries and constraint behavior
- [x] 10.3 Write service unit tests for uniqueness, overlap, and quota validations
- [x] 10.4 Write API integration tests for all CRUD/status endpoints
- [x] 10.5 Write authorization tests for cross-tenant and cross-school denial
- [x] 10.6 Write concurrency test for quota update race conditions
- [x] 10.7 Write frontend component tests for config forms and validation states
- [x] 10.8 Run end-to-end smoke test: tenant -> school -> year -> wave -> tracks

## 11. Documentation & Handoff

- [x] 11.1 Document data model and entity relationships for OPS-002
- [x] 11.2 Document API contracts for all `/admin/*` master-data endpoints
- [x] 11.3 Document business rules (active year, overlap wave, quota sum, priority uniqueness)
- [x] 11.4 Document scope and permission matrix for admin roles
- [x] 11.5 Create operational runbook for opening/closing wave and adjusting tracks safely
- [x] 11.6 Update downstream integration notes for OPS-003, OPS-004, and OPS-006 dependencies
