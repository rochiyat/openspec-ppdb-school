## Why

The current applicant intake flow is fragmented and lacks formal support for saving drafts and a clear final submission step. Applicants often lose progress, and staff cannot review incomplete applications efficiently. Implementing a structured intake with registration, draft-saving, and explicit final submission improves conversion and reduces support overhead.

## What Changes

- Add a new applicant intake workflow supporting: registration, save-as-draft, and final submission.
- Expose endpoints and UI for draft management (save, list, resume, delete).
- Add server-side validation for final submission and a submission audit trail.
- Introduce background checks / status transitions for submitted applications (async worker integration).

## Capabilities

### New Capabilities

- `applicant-intake`: End-to-end intake flow including registration, draft, and submission.
  - Covers API endpoints, UI pages, and backend state machine for application status.
- `application-draft`: Save and resume partially completed applications (per-tenant limits, autosave optional).
- `application-submission`: Final submission process including validation, audit logging, and transition to review queue.

### Modified Capabilities

- `authentication`: Guarantee session/CSRF handling for draft autosave endpoints (minor requirement extension).
- `audit-trail`: Extend to record application submission events (if existing audit-trail capability present).

## Impact

- Affected code: new controllers under `controllers/`, services under `services/` (draft manager, submission handler), minor updates to `authentication` middleware for draft endpoints.
- APIs: New endpoints under `/api/applications` for create/read/update/delete drafts and `/api/applications/:id/submit` for final submission.
- Frontend: New pages/components for registration, draft editing, and submission confirmation; persistent draft storage in backend.
- Data: New DB table `application_draft` and migration; updates to `application` entity for submission metadata.
