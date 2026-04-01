## ADDED Requirements

### Requirement: User can register with email or phone
The system SHALL allow users to create account using either email or phone number (at least one unique identifier required).

#### Scenario: Register with email
- **WHEN** user submits registration with valid email, password, full_name
- **THEN** system creates user account and returns user profile with tokens

#### Scenario: Register with duplicate email
- **WHEN** user attempts registration with existing email
- **THEN** system returns error "Email already registered"

### Requirement: User can login with credentials
The system SHALL authenticate users with email/phone and password, issue access and refresh tokens.

#### Scenario: Login success
- **WHEN** user submits valid email/phone and password
- **THEN** system authenticates and returns access_token, refresh_token, user profile

#### Scenario: Login with wrong password
- **WHEN** user submits valid identifier but incorrect password
- **THEN** system returns error "Invalid credentials" (generic message for security)

### Requirement: System must rate-limit login attempts
The system SHALL limit login requests to prevent brute-force attacks.

#### Scenario: Rate limit exceeded
- **WHEN** user attempts > 5 logins from same IP within 1 minute
- **THEN** system returns 429 Too Many Requests with retry-after header

### Requirement: User can request password reset
The system SHALL generate time-limited reset token and send via email/SMS.

#### Scenario: Password reset request
- **WHEN** user requests password reset with valid email
- **THEN** system generates token (1-hour expiry), sends email/SMS with reset link

#### Scenario: Reset request for non-existent user
- **WHEN** user requests reset for non-existent email
- **THEN** system returns success message (prevent user enumeration)

### Requirement: User can reset password with valid token
The system SHALL validate token, update password hash, revoke all refresh tokens.

#### Scenario: Password reset success
- **WHEN** user submits new password with valid unexpired token
- **THEN** system updates password, invalidates all refresh tokens, returns success

#### Scenario: Reset with expired token
- **WHEN** user submits reset with expired token
- **THEN** system returns error "Token has expired"

### Requirement: User can refresh access token
The system SHALL validate refresh token, issue new access token without re-login.

#### Scenario: Refresh token success
- **WHEN** user calls /auth/refresh with valid refresh_token
- **THEN** system validates token in DB, issues new access_token (15m expiry)

#### Scenario: Refresh with revoked token
- **WHEN** user calls /auth/refresh with revoked refresh_token
- **THEN** system returns error "Refresh token is invalid"

### Requirement: User can logout
The system SHALL revoke refresh token to end session.

#### Scenario: Logout success
- **WHEN** user calls /auth/logout with current refresh_token
- **THEN** system marks token as revoked, returns success

### Requirement: System must verify email/phone (optional)
The system SHALL send verification code for optional email/phone confirmation.

#### Scenario: Send verification code
- **WHEN** user registers with email and verification enabled
- **THEN** system generates 6-digit code (10-min expiry), sends via email/SMS

#### Scenario: Verify code
- **WHEN** user submits correct verification code
- **THEN** system marks email/phone as verified

### Requirement: Passwords must be cryptographically secure
The system SHALL hash passwords with bcrypt (cost factor 12), never store plaintext.

#### Scenario: Password hashing
- **WHEN** user registers or resets password
- **THEN** system hashes with bcrypt cost 12 before storing

### Requirement: Tokens must include required claims
The system SHALL issue JWT with user_id, portal, scope, permissions, expiry.

#### Scenario: Access token structure
- **WHEN** system issues access token
- **THEN** token includes: sub (user_id), portal, active_scope, effective_permissions, exp, iat

#### Scenario: Refresh token structure
- **WHEN** system issues refresh token
- **THEN** token stored in DB with: user_id, token_hash, expires_at, created_at
