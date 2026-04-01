## ADDED Requirements

### Requirement: User can register with email or phone

The system SHALL allow users to register an account using either email or phone number (at least one MUST be provided and unique).

#### Scenario: Successful registration with email

- **WHEN** user submits registration form with valid email, password, and required fields
- **THEN** system creates user account, hashes password, and returns success

#### Scenario: Successful registration with phone

- **WHEN** user submits registration form with valid phone number, password, and required fields
- **THEN** system creates user account, hashes password, and returns success

#### Scenario: Registration with duplicate email

- **WHEN** user submits registration form with email that already exists
- **THEN** system returns error "Email already registered"

#### Scenario: Registration with duplicate phone

- **WHEN** user submits registration form with phone number that already exists
- **THEN** system returns error "Phone number already registered"

#### Scenario: Registration without email or phone

- **WHEN** user submits registration form without email and without phone
- **THEN** system returns validation error "Email or phone number is required"

### Requirement: User can login with email or phone

The system SHALL allow users to login using email or phone number with password.

#### Scenario: Successful login with email

- **WHEN** user submits login form with valid email and correct password
- **THEN** system authenticates user, issues access token and refresh token, and returns user profile

#### Scenario: Successful login with phone

- **WHEN** user submits login form with valid phone number and correct password
- **THEN** system authenticates user, issues access token and refresh token, and returns user profile

#### Scenario: Login with incorrect password

- **WHEN** user submits login form with valid identifier but incorrect password
- **THEN** system returns error "Invalid credentials" without revealing which field is wrong

#### Scenario: Login with non-existent identifier

- **WHEN** user submits login form with identifier that does not exist
- **THEN** system returns error "Invalid credentials" without revealing user does not exist

#### Scenario: Login with inactive account

- **WHEN** user submits login form with valid credentials but account is inactive
- **THEN** system returns error "Account is inactive"

### Requirement: Password must be securely hashed

The system SHALL hash all passwords using bcrypt with cost factor 12 before storing in database.

#### Scenario: Password stored as hash

- **WHEN** user registers or changes password
- **THEN** system stores bcrypt hash in database, never plaintext password

#### Scenario: Password verification

- **WHEN** user attempts to login
- **THEN** system compares submitted password against stored bcrypt hash using constant-time comparison

### Requirement: User can request password reset

The system SHALL allow users to request password reset via email or SMS with time-limited token.

#### Scenario: Successful reset request with email

- **WHEN** user submits password reset request with registered email
- **THEN** system generates reset token with 1-hour expiry, stores in database, and sends reset link via email

#### Scenario: Successful reset request with phone

- **WHEN** user submits password reset request with registered phone number
- **THEN** system generates reset token with 1-hour expiry, stores in database, and sends reset link via SMS

#### Scenario: Reset request for non-existent identifier

- **WHEN** user submits password reset request with identifier that does not exist
- **THEN** system returns success message without revealing user does not exist (security by obscurity)

#### Scenario: Multiple reset requests

- **WHEN** user submits multiple password reset requests within short time
- **THEN** system invalidates previous tokens and issues new token with fresh expiry

### Requirement: User can reset password with valid token

The system SHALL allow users to set new password using valid reset token.

#### Scenario: Successful password reset

- **WHEN** user submits new password with valid unexpired reset token
- **THEN** system updates password hash, marks token as used, invalidates all refresh tokens, and returns success

#### Scenario: Reset with expired token

- **WHEN** user submits new password with expired reset token
- **THEN** system returns error "Reset token has expired"

#### Scenario: Reset with already-used token

- **WHEN** user submits new password with token that has already been used
- **THEN** system returns error "Reset token is invalid"

#### Scenario: Reset with invalid token

- **WHEN** user submits new password with token that does not exist
- **THEN** system returns error "Reset token is invalid"

### Requirement: Access token must be short-lived

The system SHALL issue access tokens with 15-minute expiry.

#### Scenario: Access token expiry

- **WHEN** access token is issued
- **THEN** system sets expiry claim to 15 minutes from issuance time

#### Scenario: Expired access token rejected

- **WHEN** user makes request with expired access token
- **THEN** system returns 401 Unauthorized with error "Token has expired"

### Requirement: Refresh token must be long-lived and revocable

The system SHALL issue refresh tokens with 7-day expiry and store them in database for revocation capability.

#### Scenario: Refresh token issuance

- **WHEN** user successfully logs in
- **THEN** system generates refresh token with 7-day expiry, stores in database with user_id and expiry timestamp

#### Scenario: Refresh token used to get new access token

- **WHEN** user submits valid unexpired refresh token to refresh endpoint
- **THEN** system validates token, issues new access token with fresh 15-minute expiry, and returns new access token

#### Scenario: Refresh token revoked on password reset

- **WHEN** user completes password reset
- **THEN** system invalidates all refresh tokens for that user

#### Scenario: Expired refresh token rejected

- **WHEN** user submits expired refresh token
- **THEN** system returns error "Refresh token has expired"

#### Scenario: Revoked refresh token rejected

- **WHEN** user submits refresh token that has been revoked
- **THEN** system returns error "Refresh token is invalid"

### Requirement: System must rate-limit authentication endpoints

The system SHALL rate-limit login, register, and password reset endpoints to prevent brute-force attacks.

#### Scenario: Login rate limit exceeded

- **WHEN** user attempts more than 5 login requests within 1 minute from same IP
- **THEN** system returns 429 Too Many Requests with retry-after header

#### Scenario: Register rate limit exceeded

- **WHEN** user attempts more than 10 registration requests within 1 minute from same IP
- **THEN** system returns 429 Too Many Requests with retry-after header

#### Scenario: Password reset rate limit exceeded

- **WHEN** user attempts more than 5 password reset requests within 1 minute from same IP
- **THEN** system returns 429 Too Many Requests with retry-after header

### Requirement: User can have optional email/phone verification

The system SHALL support optional email or phone verification via verification code.

#### Scenario: Email verification code sent

- **WHEN** user registers with email and verification is enabled
- **THEN** system generates 6-digit verification code with 10-minute expiry, stores in database, and sends via email

#### Scenario: Phone verification code sent

- **WHEN** user registers with phone and verification is enabled
- **THEN** system generates 6-digit verification code with 10-minute expiry, stores in database, and sends via SMS

#### Scenario: Successful verification

- **WHEN** user submits correct verification code before expiry
- **THEN** system marks email/phone as verified and returns success

#### Scenario: Verification with incorrect code

- **WHEN** user submits incorrect verification code
- **THEN** system returns error "Invalid verification code"

#### Scenario: Verification with expired code

- **WHEN** user submits verification code after 10-minute expiry
- **THEN** system returns error "Verification code has expired"

#### Scenario: User can login without verification

- **WHEN** user attempts to login with unverified email/phone
- **THEN** system allows login (verification is optional for MVP)

