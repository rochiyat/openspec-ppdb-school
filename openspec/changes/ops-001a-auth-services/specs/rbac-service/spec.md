## ADDED Requirements

### Requirement: System must calculate effective permissions
The system SHALL compute permissions as union of all active user roles at current scope.

#### Scenario: Single role permissions
- **WHEN** user has verifier role at school A, active scope is school A
- **THEN** effective_permissions include all permissions mapped to verifier

#### Scenario: Multiple role union
- **WHEN** user has verifier + reviewer roles at school A
- **THEN** effective_permissions include union of both roles (no duplicates)

### Requirement: System must check permissions before action
The system SHALL validate user has required permission before allowing action.

#### Scenario: User with permission
- **WHEN** user with applications:verify permission calls verify endpoint
- **THEN** system allows action

#### Scenario: User without permission
- **WHEN** user without applications:verify calls verify endpoint
- **THEN** system returns 403 Forbidden

### Requirement: System must validate resource scope
The system SHALL ensure resource belongs to user's active scope.

#### Scenario: Resource in scope
- **WHEN** user with active_scope school A accesses application from school A
- **THEN** system allows access

#### Scenario: Resource outside scope
- **WHEN** user with active_scope school A accesses application from school B
- **THEN** system returns 403 Forbidden

### Requirement: System must manage role assignments
The system SHALL allow assigning roles to users with proper scope and validation.

#### Scenario: Assign role with scope
- **WHEN** admin assigns verifier role to user for school A, tenant X
- **THEN** system creates user_role record with scope information

#### Scenario: Duplicate role assignment rejected
- **WHEN** admin attempts to assign same role to user at same scope
- **THEN** system returns error "User already has this role at this scope"

### Requirement: System must track role assignment history
The system SHALL record who assigned role and when for audit trail.

#### Scenario: Role assignment audit trail
- **WHEN** admin assigns role
- **THEN** system records assigned_by, assigned_at, modified_by, modified_at in audit log
