# HTTPS Authentication Troubleshooting Guide

## Problem
Authentication not working when both frontend and backend are running on HTTPS.

## Current Setup
- **Frontend**: https://techtrack01.vercel.app (Vercel)
- **Backend**: https://techtrack-api.onrender.com (Render)

## Root Causes
1. **Cookie Security Settings**: HTTPS requires specific cookie attributes
2. **CORS Configuration**: Cross-origin requests need proper CORS setup
3. **Environment Variables**: Missing or incorrect HTTPS configuration
4. **SameSite Policy**: Browser security policies for cross-site cookies

## Solutions Implemented

### 1. Backend Cookie Configuration (`techtrack-api/src/lib/auth.ts`)
```typescript
export function setAuthCookie(res: Response, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const isHttps = process.env.HTTPS === 'true' || isProduction;
  
  const cookieOptions = {
    httpOnly: true,
    secure: isHttps, // Only secure in HTTPS environments
    sameSite: isHttps ? 'none' : 'lax', // Use 'none' for cross-origin HTTPS, 'lax' for same-origin
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/' // Ensure cookie is available for all paths
  } as const;
  
  res.cookie('auth_token', token, cookieOptions);
}
```

### 2. Enhanced CORS Configuration (`techtrack-api/src/index.ts`)
```typescript
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow the configured frontend URL
    if (origin === FRONTEND_URL) {
      return callback(null, true);
    }
    
    // In development, allow localhost with any port
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Allow your production domains
    const allowedOrigins = [
      FRONTEND_URL,
      'https://your-frontend-domain.com', // Replace with your actual domain
      'http://localhost:3000',
      'https://localhost:3000'
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie']
};
```

### 3. Environment Variables Configuration

#### Backend (`.env`)
```env
# HTTPS Configuration
# Set to 'true' when running on HTTPS (production or local HTTPS)
HTTPS=false

# For HTTPS development/production, set:
# HTTPS=true
# FRONTEND_URL=https://localhost:3000
```

#### Frontend (`.env.local`)
```env
# For HTTPS development/production, set:
# NEXT_PUBLIC_API_URL=https://localhost:5000/api
```

## Configuration Steps for HTTPS

### For Local HTTPS Development:

1. **Backend Configuration**:
   ```env
   HTTPS=true
   FRONTEND_URL=https://localhost:3000
   ```

2. **Frontend Configuration**:
   ```env
   NEXT_PUBLIC_API_URL=https://localhost:5000/api
   ```

3. **Update CORS allowed origins** in `techtrack-api/src/index.ts`:
   ```typescript
   const allowedOrigins = [
     FRONTEND_URL,
     'https://localhost:3000',
     'https://localhost:5000',
     // Add your actual domains here
   ];
   ```

### For Production HTTPS:

1. **Backend Configuration**:
   ```env
   NODE_ENV=production
   HTTPS=true
   FRONTEND_URL=https://yourdomain.com
   ```

2. **Frontend Configuration**:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
   ```

## Debugging Steps

### 1. Check Browser Developer Tools
- Open Network tab
- Look for failed requests (401, CORS errors)
- Check if cookies are being sent with requests
- Verify Set-Cookie headers in responses

### 2. Check Server Logs
The backend now includes debug logging:
- CORS origin checks
- Cookie presence/absence
- Authentication success/failure

### 3. Test Cookie Settings
In browser console:
```javascript
// Check if cookies are set
document.cookie

// Check if API calls include credentials
fetch('/api/auth/me', { credentials: 'include' })
```

## Common Issues and Solutions

### Issue 1: "Authentication required" errors
**Cause**: Cookies not being sent with requests
**Solution**: 
- Ensure `withCredentials: true` in frontend API client
- Verify CORS `credentials: true` in backend
- Check cookie `secure` and `sameSite` settings

### Issue 2: CORS errors
**Cause**: Origin not allowed or incorrect CORS configuration
**Solution**:
- Add your domain to allowed origins
- Ensure preflight requests are handled
- Check that credentials are enabled in CORS

### Issue 3: Cookies not being set
**Cause**: Incorrect cookie security attributes
**Solution**:
- Use `secure: true` only for HTTPS
- Use `sameSite: 'none'` for cross-origin HTTPS
- Use `sameSite: 'lax'` for same-origin

### Issue 4: Mixed content warnings
**Cause**: HTTPS frontend calling HTTP backend
**Solution**:
- Ensure both frontend and backend use HTTPS
- Or both use HTTP for development

## Testing Checklist

- [ ] Login works and sets authentication cookie
- [ ] Authenticated requests include cookie
- [ ] Logout clears authentication cookie
- [ ] Page refresh maintains authentication
- [ ] No CORS errors in browser console
- [ ] No mixed content warnings
- [ ] Authentication persists across browser tabs

## Quick Fix for Immediate Testing

If you need authentication to work immediately, temporarily set both frontend and backend to HTTP:

**Backend `.env`**:
```env
HTTPS=false
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`**:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

This will use `sameSite: 'lax'` and `secure: false`, which works for same-origin HTTP requests.