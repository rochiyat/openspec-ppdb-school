## Context

The product needs a resilient applicant intake flow supporting incomplete saves and a clear commit action. Current forms are single-shot; users lose progress and support requests increase. The backend follows the existing monorepo patterns (controllers → services → repositories) and must integrate with authentication and audit systems.

## Goals / Non-Goals

**Goals:**

- Provide APIs and UI for registration, draft save/resume/delete, and final submission.
- Ensure final submission triggers validation and audit logging.
- Keep draft data per-tenant and enforce storage limits.

**Non-Goals:**

- Full real-time collaborative editing.
- Integration with third-party identity providers beyond existing auth.

## Decisions

- **Draft Storage**: Persist drafts in a new `application_draft` relational table (JSONB for form payload). Rationale: queryable, transactional, and compatible with existing migrations.
- **Autosave**: Implement optional autosave on the frontend; backend provides idempotent `PUT /api/applications/drafts/:id`.
- **Submission Flow**: `POST /api/applications/:id/submit` performs synchronous validation and enqueues background job for further checks (e.g., document processing).
- **Audit**: Reuse `audit-trail` service to log `application.submitted` and `application.draft.saved` events.

## Risks / Trade-offs

- [Storage] Large numbers of drafts may increase DB storage → Mitigation: per-tenant quota and TTL for stale drafts.
- [Validation] Divergence between draft validation and submission validation → Mitigation: use shared validation logic library.
- [UX] Autosave may create many small writes → Mitigation: debounce autosave and client-side change batching.

## Migration Plan

1. Add migration `006_create_application_draft.sql` to create `application_draft` table.
2. Deploy migration to staging.
3. Deploy backend changes that add endpoints (draft CRUD, submit).
4. Deploy frontend pages; enable feature flag for selected tenants.
5. Monitor metrics and storage; prune old drafts if necessary.

## Open Questions

- What TTL should be applied for stale drafts (30/90 days)?
- Should drafts support file attachments initially or later?
