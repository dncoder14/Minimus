# Google OAuth Setup Guide

## Steps to Enable Google OAuth

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

### 2. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. **IMPORTANT**: Add authorized JavaScript origins (exactly as shown):
   - `http://localhost:5173`
5. **No redirect URIs needed** for this implementation
6. Click **Create**
7. Copy the **Client ID** (Client Secret not needed for frontend OAuth)

### 3. Update Environment Variables

#### Frontend (App.jsx)
Your Client ID is already set in `/Frontend/src/App.jsx`:
```javascript
<GoogleOAuthProvider clientId="637148170835-9gffvr77r5o2a4vhqs7e7kn46g19k6fe.apps.googleusercontent.com">
```

**ACTION REQUIRED**: Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and:
1. Find the OAuth 2.0 Client ID: `637148170835-9gffvr77r5o2a4vhqs7e7kn46g19k6fe`
2. Click Edit
3. Under "Authorized JavaScript origins", add: `http://localhost:5173`
4. Click Save

### 4. Restart Backend Server
After updating Google Console settings:
```bash
cd Backend
npm start
```

### 5. Test the Integration
1. Make sure backend is running on port 3001
2. Make sure frontend is running on port 5173
3. Navigate to login or signup page
4. Click "Sign in with Google" button
5. Complete the Google authentication flow

## How It Works

1. User clicks "Sign in with Google" button
2. Google OAuth popup appears
3. User authenticates with Google
4. Google returns a JWT credential
5. Frontend sends credential to backend `/api/auth/google` endpoint
6. Backend decodes the JWT and extracts user info (email, name)
7. Backend checks if user exists:
   - If yes: logs them in
   - If no: creates new account
8. Backend returns JWT token
9. Frontend stores token and redirects to home page

## Security Notes

- Never commit actual credentials to version control
- Use environment variables for sensitive data
- In production, update authorized origins to your production domain
- Consider implementing additional security measures like CSRF protection
