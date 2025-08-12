# Social Authentication Setup Guide

This guide will help you set up Google and Facebook authentication for your project management application.

## 🔧 Prerequisites

1. **Google Cloud Console Account**
2. **Facebook Developer Account**
3. **Backend API configured to handle social login**

## 📋 Setup Instructions

### 1. Google Authentication Setup

#### Step 1: Create Google OAuth 2.0 Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add your authorized origins:
   - `http://localhost:5174` (for development)
   - `https://yourdomain.com` (for production)
7. Copy the Client ID

#### Step 2: Configure Environment Variables
```bash
# Add to your .env.local file
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 2. Facebook Authentication Setup

#### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Select "Consumer" app type
4. Go to "Settings" → "Basic"
5. Copy the App ID
6. Add your domain to "App Domains"
7. Configure Facebook Login:
   - Go to "Products" → "Facebook Login" → "Settings"
   - Add Valid OAuth Redirect URIs:
     - `http://localhost:5174` (development)
     - `https://yourdomain.com` (production)

#### Step 2: Configure Environment Variables
```bash
# Add to your .env.local file
VITE_FACEBOOK_APP_ID=your_facebook_app_id_here
```

### 3. Backend API Endpoints

Your backend should implement these endpoints:

#### POST `/auth/social-login`
```typescript
interface SocialLoginRequest {
  provider: 'google' | 'facebook';
  accessToken: string;
  email: string;
  name: string;
  profilePicture?: string;
}

interface AuthResponse {
  token: string;
  userId: number;
  email: string;
}
```

#### Example Implementation (Node.js/Express)
```javascript
app.post('/auth/social-login', async (req, res) => {
  const { provider, accessToken, email, name, profilePicture } = req.body;
  
  try {
    // Verify the token with the social provider
    let userInfo;
    
    if (provider === 'google') {
      // Verify Google token
      const ticket = await googleClient.verifyIdToken({
        idToken: accessToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      userInfo = ticket.getPayload();
    } else if (provider === 'facebook') {
      // Verify Facebook token
      const response = await fetch(`https://graph.facebook.com/me?access_token=${accessToken}&fields=id,email,name`);
      userInfo = await response.json();
    }
    
    // Find or create user in your database
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        name,
        profilePicture,
        provider,
        socialId: userInfo.id || userInfo.sub,
      });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    
    res.json({
      token,
      userId: user.id,
      email: user.email,
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid social login token' });
  }
});
```

## 🎨 Frontend Integration

The social login functionality is already integrated into your landing page with:

### Components
- `GoogleLoginButton`: Renders Google sign-in button
- `FacebookLoginButton`: Custom Facebook login button
- `SocialAuthService`: Handles all social authentication logic

### Features
- **Seamless Integration**: Buttons appear in both login and signup tabs
- **Error Handling**: Displays specific error messages
- **Loading States**: Shows loading indicators during authentication
- **Consistent Design**: Matches your app's Material-UI design system

### Usage in Components
```typescript
import { GoogleLoginButton, FacebookLoginButton } from '../components/auth';

// In your component
<GoogleLoginButton
  onSuccess={(accessToken, email, name, profilePicture) =>
    handleSocialLogin('google', accessToken, email, name, profilePicture)
  }
  onError={handleSocialError}
  disabled={loading}
/>
```

## 🔒 Security Considerations

1. **Token Verification**: Always verify social tokens on your backend
2. **HTTPS**: Use HTTPS in production for secure token transmission
3. **Token Expiry**: Handle token expiration gracefully
4. **Rate Limiting**: Implement rate limiting on social login endpoints
5. **Data Validation**: Validate all incoming social login data

## 🧪 Testing

### Development Testing
1. Set up development credentials with localhost URLs
2. Test both Google and Facebook flows
3. Verify error handling for cancelled logins
4. Test network failure scenarios

### Production Testing
1. Configure production credentials
2. Test with real domain URLs
3. Verify HTTPS redirects work correctly
4. Test on different devices and browsers

## 🚀 Deployment Checklist

- [ ] Configure production Google OAuth credentials
- [ ] Configure production Facebook app settings
- [ ] Set environment variables on production server
- [ ] Test social login flows on production
- [ ] Monitor authentication success/failure rates
- [ ] Set up logging for social authentication events

## 📝 Environment Variables Summary

```bash
# Required for social authentication
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_FACEBOOK_APP_ID=your_facebook_app_id

# API endpoint (make sure it matches your backend)
VITE_API_BASE_URL=http://localhost:8080/api
```

## 🔧 Troubleshooting

### Google Login Issues
- **Error: "Invalid client"** → Check GOOGLE_CLIENT_ID is correct
- **Error: "Redirect URI mismatch"** → Add current domain to Google Console
- **Button not rendering** → Check if Google Identity Services script loaded

### Facebook Login Issues
- **Error: "App not setup for Facebook Login"** → Enable Facebook Login product
- **Error: "Invalid redirect URI"** → Add domain to Facebook app settings
- **Permission denied** → Check Facebook app is live/published

### General Issues
- **Network errors** → Check CORS settings on backend
- **Token verification fails** → Ensure backend can access social provider APIs
- **User creation fails** → Check database constraints and validation

## 📚 Additional Resources

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [OAuth 2.0 Security Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)
