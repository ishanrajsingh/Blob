# Google OAuth Architecture

This document describes the proposed Google OAuth authentication flow for the Blob app. The architecture uses Google Sign-In on the mobile client while keeping all verification, user management, and session logic on our custom backend.

## Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Mobile App    │     │  Blob Backend   │     │  Google OAuth   │
│  (React Native) │     │  (Hono/tRPC)    │     │    Servers      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         │  1. User taps         │                       │
         │     "Continue with    │                       │
         │      Google"          │                       │
         │                       │                       │
         │  2. Google Sign-In ───┼───────────────────────►
         │     (native SDK)      │                       │
         │                       │                       │
         │  3. Receive Google ◄──┼───────────────────────┤
         │     ID Token          │                       │
         │                       │                       │
         │  4. Send ID Token ────►                       │
         │     to backend        │                       │
         │                       │  5. Verify token      │
         │                       │     with Google ──────►
         │                       │                       │
         │                       │  6. Token valid ◄─────┤
         │                       │                       │
         │                       │  7. Create/update     │
         │                       │     user record       │
         │                       │                       │
         │  8. Receive app ◄─────┤                       │
         │     session token     │                       │
         │                       │                       │
         │  9. Store session     │                       │
         │     token locally     │                       │
         └───────────────────────┴───────────────────────┘
```

## Responsibilities

### Mobile App

The mobile app acts as a thin OAuth client:

- Trigger Google Sign-In using Expo's `expo-auth-session` or `@react-native-google-signin/google-signin`
- Obtain the Google ID token from the sign-in response
- Send the ID token securely to the backend via HTTPS
- Store only the app-issued session token (not the Google token)
- Include session token in subsequent API requests
- Handle sign-out by clearing local session

### Backend Server

The backend handles all authentication logic:

- Verify Google ID token authenticity with Google's servers
- Validate token claims (audience, issuer, expiration)
- Create new user records or fetch existing users based on Google profile
- Issue application-specific session tokens (JWT or opaque)
- Manage session lifecycle (creation, validation, revocation)
- Handle token refresh if using short-lived tokens

## Token Strategy

### Google ID Token (Short-lived)

- **Lifetime**: ~1 hour (set by Google)
- **Storage**: Never stored persistently
- **Purpose**: One-time verification during sign-in
- **Location**: Passed from mobile to backend, then discarded

### App Session Token (Long-lived)

- **Lifetime**: Configurable (recommended: 7-30 days)
- **Storage**: Secure storage on mobile device (`expo-secure-store`)
- **Purpose**: Authenticate subsequent API requests
- **Location**: Mobile device only, validated by backend on each request

### Token Refresh Strategy

Two approaches to consider:

**Option A: Long-lived sessions with re-authentication**
- Issue session tokens valid for 30 days
- User re-authenticates with Google when session expires
- Simpler implementation, good UX for most apps

**Option B: Refresh token rotation**
- Issue short-lived access tokens (15 min - 1 hour)
- Issue long-lived refresh tokens (30-90 days)
- Client uses refresh token to get new access tokens
- More secure, better for sensitive applications

## Security Considerations

### Token Verification

The backend must verify Google ID tokens properly:

```
1. Verify signature using Google's public keys
2. Check `aud` (audience) matches your Google Client ID
3. Check `iss` (issuer) is accounts.google.com or https://accounts.google.com
4. Check `exp` (expiration) is in the future
5. Optionally check `hd` (hosted domain) for organization-restricted apps
```

### Transport Security

- All communication must use HTTPS
- Mobile app should implement certificate pinning for production
- Never log or expose tokens in error messages

### Token Storage

- Mobile: Use `expo-secure-store` for session tokens
- Backend: Store hashed session tokens if using opaque tokens
- Never store Google ID tokens persistently

### Session Management

- Implement session revocation for sign-out
- Consider device-based session tracking
- Implement rate limiting on auth endpoints
- Log authentication events for security monitoring

## Implementation Notes

### Required Google Cloud Setup

1. Create a project in Google Cloud Console
2. Enable Google Sign-In API
3. Create OAuth 2.0 credentials:
   - iOS: Create iOS client ID with bundle identifier
   - Android: Create Android client ID with package name and SHA-1
   - Web: Create web client ID (used for backend verification)
4. Configure OAuth consent screen

### Environment Variables

Backend will need:
```
GOOGLE_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID_IOS=your-ios-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_ID_ANDROID=your-android-client-id.apps.googleusercontent.com
```

### Recommended Libraries

**Mobile (React Native/Expo):**
- `expo-auth-session` - Expo's auth session handling
- `expo-secure-store` - Secure token storage
- `expo-web-browser` - OAuth browser flow

**Backend (Node.js/Bun):**
- `google-auth-library` - Official Google library for token verification
- `jose` - JWT creation and validation for app sessions

## API Endpoints (Proposed)

```
POST /trpc/auth.googleSignIn
  Input: { idToken: string }
  Output: { sessionToken: string, user: { id, email, name, picture } }

POST /trpc/auth.signOut
  Input: { sessionToken: string }
  Output: { success: boolean }

GET /trpc/auth.me
  Headers: Authorization: Bearer <sessionToken>
  Output: { user: { id, email, name, picture } }

POST /trpc/auth.refresh (if using refresh tokens)
  Input: { refreshToken: string }
  Output: { sessionToken: string, refreshToken: string }
```

## Error Handling

The backend should return clear error codes:

| Error Code | Description |
|------------|-------------|
| `INVALID_TOKEN` | Google ID token is invalid or expired |
| `INVALID_AUDIENCE` | Token was not issued for this app |
| `SESSION_EXPIRED` | App session token has expired |
| `SESSION_REVOKED` | Session was explicitly revoked |
| `USER_DISABLED` | User account has been disabled |

## Future Considerations

- **Multi-provider support**: Architecture can extend to Apple Sign-In, etc.
- **Account linking**: Allow users to link multiple OAuth providers
- **MFA**: Add optional second factor after OAuth
- **Passwordless fallback**: Email magic links as backup auth method
