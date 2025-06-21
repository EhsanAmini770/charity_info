# Authentication Flow

## Overview

The Web Project Template uses a combination of JWT (JSON Web Tokens) and session-based authentication to secure the application. This hybrid approach provides both stateless authentication for API requests and stateful sessions for web clients. The authentication system is designed to be flexible and can be adapted for different website concepts.

## Authentication Components

### Backend Components

- **JWT**: Used for API authentication
- **Express Session**: Used for web session management
- **CSRF Protection**: Used to prevent cross-site request forgery
- **Bcrypt**: Used for password hashing
- **Middleware**: Used to protect routes

### Frontend Components

- **AuthContext**: Provides authentication state and methods
- **ProtectedRoute**: Route component that requires authentication
- **useAuth**: Hook for accessing authentication context
- **Axios Interceptors**: Adds authentication headers to requests

## User Roles

The template includes a flexible role-based access control system that can be customized for different website concepts. By default, it supports the following roles:

- **super-admin**: Full access to all features and settings
- **editor**: Access to content management features

Additional roles can be added based on the specific requirements of your website concept, such as:

- **moderator**: For community websites to manage user content
- **author**: For blog websites to create and manage their own content
- **customer**: For e-commerce websites to view orders and manage account
- **instructor**: For educational websites to manage courses and students

## Authentication Flow

### Login Flow

1. User enters username and password on the login page
2. Frontend sends a POST request to `/api/auth/login` with credentials
3. Backend validates the credentials:
   - Finds the user by username
   - Compares the password with the hashed password
4. If credentials are valid:
   - Backend creates a session with the user ID
   - Backend generates a JWT token with user ID and role
   - Backend returns the user info and token
5. Frontend stores the token in localStorage
6. Frontend updates the AuthContext with the user info
7. Frontend redirects to the admin dashboard

```javascript
// Backend login controller
login: async (req, res, next) => {
  try {
    const { username, password } = req.body;
    debug.log('Login attempt', { username });

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      debug.log('Login failed: user not found', { username });
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      return controllerUtils.handleControllerError(error, res, {
        context: 'login'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      debug.log('Login failed: invalid password', { username });
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      error.code = 'INVALID_CREDENTIALS';
      return controllerUtils.handleControllerError(error, res, {
        context: 'login'
      });
    }

    debug.log('Login successful', { userId: user._id, username: user.username, role: user.role });

    // Create session
    req.session.userId = user._id;

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwtSecret,
      { expiresIn: '1d' }
    );

    // Return user info and token
    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      },
      token
    });
  } catch (error) {
    debug.error('Error during login', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'login',
      useNextFunction: true,
      next
    });
  }
}
```

```tsx
// Frontend login function
const login = async (username: string, password: string) => {
  try {
    setIsLoading(true);
    const response = await api.post('/api/auth/login', { username, password });
    const { token, user } = response.data;

    localStorage.setItem('authToken', token);
    setUser(user);

    return user;
  } catch (error) {
    logError('Login error', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

### Logout Flow

1. User clicks the logout button
2. Frontend sends a POST request to `/api/auth/logout`
3. Backend destroys the session
4. Frontend removes the token from localStorage
5. Frontend updates the AuthContext to remove the user
6. Frontend redirects to the login page

```javascript
// Backend logout controller
logout: (req, res) => {
  const userId = req.session?.userId;
  debug.log('Logout attempt', { userId });

  req.session.destroy(err => {
    if (err) {
      debug.error('Error destroying session', err);
      const error = new Error('Error logging out');
      error.statusCode = 500;
      error.code = 'SESSION_ERROR';
      return controllerUtils.handleControllerError(error, res, {
        context: 'logout'
      });
    }

    res.clearCookie('connect.sid');
    debug.log('Logout successful', { userId });
    res.json({ message: 'Logged out successfully' });
  });
}
```

```tsx
// Frontend logout function
const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    logError('Logout error', error);
  } finally {
    localStorage.removeItem('authToken');
    setUser(null);
    navigate('/login');
  }
};
```

### Authentication Check

1. When the application loads, the AuthProvider checks if the user is authenticated
2. If a token exists in localStorage, the frontend sends a GET request to `/api/auth/me`
3. Backend validates the token and returns the user info
4. Frontend updates the AuthContext with the user info

```javascript
// Backend getCurrentUser controller
getCurrentUser: async (req, res, next) => {
  try {
    // Check if user is authenticated via session
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        return res.json({
          user: {
            id: user._id,
            username: user.username,
            role: user.role
          }
        });
      }
    }

    // Check if user is authenticated via JWT
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }

    // Return user info
    res.json({
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    debug.error('Error getting current user', error);
    controllerUtils.handleControllerError(error, res, {
      context: 'getCurrentUser',
      useNextFunction: true,
      next
    });
  }
}
```

```tsx
// Frontend authentication check
useEffect(() => {
  const checkAuth = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        localStorage.removeItem('authToken');
      }
    }
    setIsLoading(false);
  };

  checkAuth();
}, []);
```

## Route Protection

### Backend Route Protection

The backend uses middleware to protect routes:

```javascript
// Authentication middleware
exports.isAuthenticated = async (req, res, next) => {
  try {
    // Check if user is authenticated via session
    if (req.session && req.session.userId) {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
        return next();
      }
    }

    // Check if user is authenticated via JWT
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      debug.log('Authentication required - no token provided');
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_REQUIRED',
          message: 'Authentication required'
        }
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = await User.findById(decoded.userId);
    if (!user) {
      debug.log('Authentication required - invalid token');
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid token'
        }
      });
    }

    // Set user on request
    req.user = user;
    next();
  } catch (error) {
    debug.error('Error in authentication middleware', error);
    return res.status(401).json({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication error'
      }
    });
  }
};

// Role-based middleware
exports.isSuperAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'super-admin') {
    return next();
  }

  debug.log('Permission denied - super-admin role required');
  return res.status(403).json({
    success: false,
    error: {
      code: 'PERMISSION_DENIED',
      message: 'Permission denied'
    }
  });
};

exports.isEditor = (req, res, next) => {
  if (req.user && (req.user.role === 'editor' || req.user.role === 'super-admin')) {
    return next();
  }

  debug.log('Permission denied - editor role required');
  return res.status(403).json({
    success: false,
    error: {
      code: 'PERMISSION_DENIED',
      message: 'Permission denied'
    }
  });
};
```

### Frontend Route Protection

The frontend uses a ProtectedRoute component to protect routes:

```tsx
// ProtectedRoute component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'super-admin' | 'editor';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if required
  if (requiredRole && user) {
    if (requiredRole === 'super-admin' && user.role !== 'super-admin') {
      return <Navigate to="/admin" replace />;
    }

    if (requiredRole === 'editor' &&
        user.role !== 'editor' &&
        user.role !== 'super-admin') {
      return <Navigate to="/admin" replace />;
    }
  }

  // Render children if authenticated and has required role
  return <>{children}</>;
};
```

## CSRF Protection

The application uses CSRF protection for all non-GET requests:

```javascript
// CSRF middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// CSRF token route
router.get('/csrf-token', csrfProtection, authController.getCsrfToken);

// CSRF token controller
getCsrfToken: (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
}
```

```tsx
// Frontend CSRF token hook
export const useCsrf = () => {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_CONFIG.baseURL}/api/csrf-token`, {
          withCredentials: true
        });
        setCsrfToken(response.data.csrfToken);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch CSRF token:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCsrfToken();
  }, []);

  return { csrfToken, isLoading, error };
};
```

```tsx
// Add CSRF token to requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token for non-GET admin routes
    if (
      config.url &&
      config.url.includes('/admin/') &&
      config.method &&
      ['post', 'put', 'delete', 'patch'].includes(config.method.toLowerCase())
    ) {
      try {
        const token = await getCsrfToken();
        config.headers['CSRF-Token'] = token;
      } catch (error) {
        logError('Failed to fetch CSRF token', error);
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

## Security Headers

The application uses security headers to protect against common web vulnerabilities:

```javascript
// Security headers middleware
headers: (req, res, next) => {
  // Strict Transport Security
  if (config.isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Disable caching for API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  next();
}
```

## Password Hashing

The application uses bcrypt for password hashing:

```javascript
// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};
```

## Session Configuration

The application uses express-session for session management:

```javascript
// Session configuration
app.use(session({
  secret: config.auth.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: config.isProd,
    maxAge: config.auth.sessionMaxAge
  }
}));
```

## JWT Configuration

The application uses jsonwebtoken for JWT authentication:

```javascript
// Generate JWT token
const token = jwt.sign(
  { userId: user._id, role: user.role },
  config.jwtSecret,
  { expiresIn: '1d' }
);
```

## Adapting the Authentication System for Different Website Concepts

The authentication system can be adapted for different website concepts by customizing the user model, roles, and authentication methods. Here are some examples of how the authentication system can be adapted for different website types:

### Blog/News Website

- **Additional User Fields**: bio, avatar, social links, articles
- **Custom Roles**: author, contributor, editor, admin
- **Authentication Features**: social login, author profiles

### E-commerce Website

- **Additional User Fields**: shipping address, billing address, payment methods, order history
- **Custom Roles**: customer, vendor, admin
- **Authentication Features**: guest checkout, saved carts, wishlist

### Portfolio Website

- **Additional User Fields**: skills, experience, education, projects
- **Custom Roles**: owner, client, collaborator
- **Authentication Features**: client access to specific projects

### Event Website

- **Additional User Fields**: interests, attended events, registered events
- **Custom Roles**: attendee, speaker, organizer, admin
- **Authentication Features**: event registration, speaker profiles

### Community Website

- **Additional User Fields**: bio, avatar, interests, reputation, badges
- **Custom Roles**: member, moderator, admin
- **Authentication Features**: social login, member profiles, reputation system

## Extending the Authentication System

To extend the authentication system for a new project:

1. Update the user model to include additional fields specific to your website concept
2. Add new roles based on the user types needed for your website
3. Update the authentication middleware to handle the new roles and permissions
4. Update the frontend AuthContext to include the new user fields and roles
5. Update the ProtectedRoute component to handle the new roles and permissions
6. Add new authentication methods if needed (e.g., OAuth, social login, two-factor authentication)
