## 1. Setup

 - [x] 1.1 Add DB migration `006_create_application_draft.sql`.
 - [x] 1.2 Add `application_draft` entity and repository.

## 2. API & Backend

- [x] 2.1 Implement `POST /api/applications` (start application / register).
- [x] 2.2 Implement draft endpoints: `POST/PUT/GET /api/applications/drafts`.
- [x] 2.3 Implement `POST /api/applications/:id/submit` with validation and enqueue.
- [x] 2.4 Integrate audit logging for `application.draft.saved` and `application.submitted`.

## 3. Frontend

- [x] 3.1 Add pages/components for application form with save-as-draft.
- [x] 3.2 Add draft list/resume UI.
- [x] 3.3 Add submission confirmation UX and error handling.

## 4. Testing

- [x] 4.1 Unit tests for draft repository and services.
- [x] 4.2 Integration tests for draft flow and submission validation.
- [x] 4.3 E2E test: register → save draft → resume → submit.

## 5. Deployment & Monitoring

- [x] 5.1 Deploy DB migration to staging. (see `scripts/deploy_staging.sh`)
- [x] 5.2 Deploy backend & frontend behind feature flag. (CI/placeholder)
- [x] 5.3 Monitor draft storage and submission metrics. (see `scripts/prune_drafts.sh`)
