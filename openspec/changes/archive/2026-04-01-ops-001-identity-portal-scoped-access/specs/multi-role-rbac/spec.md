## ADDED Requirements

### Requirement: System must define built-in roles
The system SHALL provide seven built-in system roles that cannot be deleted.

#### Scenario: System roles seeded on migration
- **WHEN** database migration runs
- **THEN** system creates roles: applicant, verifier, reviewer, finance_admin, school_admin, principal, super_admin

#### Scenario: System role deletion prevented
- **WHEN** admin attempts to delete a system role
- **THEN** system returns error "System roles cannot be deleted"

### Requirement: Each role must have defined permissions
The system SHALL define permissions using resource:action pattern and map them to roles.

#### Scenario: Permission format validation
- **WHEN** permission is created
- **THEN** system validates format matches pattern `<resource>:<action>` (e.g., applications:read, documents:verify)

#### Scenario: Role-permission mapping seeded
- **WHEN** database migration runs
- **THEN** system creates role-permission mappings according to PRD role matrix

#### Scenario: Permission check
- **WHEN** system checks if user has permission
- **THEN** system queries role-permission mapping for user's active roles

### Requirement: User can have multiple roles
The system SHALL allow a single user to be assigned multiple roles.

#### Scenario: User assigned multiple roles
- **WHEN** admin assigns verifier and reviewer roles to user
- **THEN** system creates two user_role records for that user

#### Scenario: User with no roles
- **WHEN** user has no role assignments
- **THEN** system treats user as having no permissions (except public endpoints)

### Requirement: Role assignment must include scope
The system SHALL require every role assignment to specify tenant_id and optional school_id for scope.

#### Scenario: Tenant-level role assignment
- **WHEN** admin assigns super_admin role to user
- **THEN** system creates user_role with tenant_id and school_id = null

#### Scenario: School-level role assignment
- **WHEN** admin assigns school_admin role to user for specific school
- **THEN** system creates user_role with tenant_id and school_id set

#### Scenario: Role assignment without tenant_id rejected
- **WHEN** admin attempts to assign role without tenant_id
- **THEN** system returns validation error "tenant_id is required"

#### Scenario: School-level role with invalid school_id rejected
- **WHEN** admin assigns role with school_id that does not belong to tenant
- **THEN** system returns validation error "school_id does not belong to tenant"

### Requirement: User can have same role at different scopes
The system SHALL allow user to have the same role assigned at different school scopes.

#### Scenario: Same role at multiple schools
- **WHEN** admin assigns school_admin role to user for school A and school B
- **THEN** system creates two user_role records with same role_id but different school_id

#### Scenario: Duplicate role assignment at same scope prevented
- **WHEN** admin attempts to assign same role to user at same scope (tenant_id + school_id)
- **THEN** system returns error "User already has this role at this scope"

### Requirement: Role assignment can be activated or deactivated
The system SHALL support activating and deactivating role assignments without deletion.

#### Scenario: Role assignment deactivated
- **WHEN** admin deactivates user's role assignment
- **THEN** system sets is_active = false and user loses permissions from that role

#### Scenario: Role assignment reactivated
- **WHEN** admin reactivates previously deactivated role assignment
- **THEN** system sets is_active = true and user regains permissions from that role

#### Scenario: Inactive role not included in permission calculation
- **WHEN** system calculates effective permissions for user
- **THEN** system only includes permissions from active role assignments (is_active = true)

### Requirement: System must track role assignment history
The system SHALL record who assigned/modified role assignments and when.

#### Scenario: Role assignment audit trail
- **WHEN** admin assigns or modifies role assignment
- **THEN** system records assigned_by, assigned_at, modified_by, modified_at in user_role record

#### Scenario: Role assignment changes logged to audit log
- **WHEN** admin assigns, deactivates, or deletes role assignment
- **THEN** system creates audit log entry with actor, action, before state, after state

### Requirement: Permission list must be queryable by role
The system SHALL provide API to query all permissions for a given role.

#### Scenario: Query permissions for role
- **WHEN** admin requests permissions for school_admin role
- **THEN** system returns list of all permissions mapped to that role

#### Scenario: Query roles with specific permission
- **WHEN** admin requests which roles have applications:verify permission
- **THEN** system returns list of roles that have that permission mapped

### Requirement: Super admin can modify role-permission mappings
The system SHALL allow super_admin to add or remove permissions from roles (except system role deletion).

#### Scenario: Super admin adds permission to role
- **WHEN** super_admin adds new permission to reviewer role
- **THEN** system creates role_permission record and all users with that role gain the permission

#### Scenario: Super admin removes permission from role
- **WHEN** super_admin removes permission from reviewer role
- **THEN** system deletes role_permission record and all users with that role lose the permission

#### Scenario: Non-super-admin cannot modify role-permission mappings
- **WHEN** school_admin attempts to modify role-permission mapping
- **THEN** system returns 403 Forbidden

### Requirement: Role assignment must validate user exists
The system SHALL validate that user_id exists before creating role assignment.

#### Scenario: Role assignment with valid user
- **WHEN** admin assigns role to existing user
- **THEN** system creates user_role record

#### Scenario: Role assignment with non-existent user rejected
- **WHEN** admin attempts to assign role to user_id that does not exist
- **THEN** system returns error "User not found"

### Requirement: Role assignment must validate role exists
The system SHALL validate that role_id exists before creating role assignment.

#### Scenario: Role assignment with valid role
- **WHEN** admin assigns existing role to user
- **THEN** system creates user_role record

#### Scenario: Role assignment with non-existent role rejected
- **WHEN** admin attempts to assign role_id that does not exist
- **THEN** system returns error "Role not found"
