# Backend Architecture

## Overview

The backend of the Web Project Template is built with Node.js, Express, and MongoDB. It provides a RESTful API that can be customized for various website concepts. The architecture is designed to be flexible, modular, and easy to adapt to different needs.

## Architecture

- **Server**: Node.js + Express
- **Database**: MongoDB
  - Collections for metadata & counters
  - GridFS for News attachments
- **File Storage**:
  - Gallery images → Local filesystem (`/uploads/gallery/:albumId/`)
- **Real-time**: Socket.io for "online user" tracking
- **Sitemap**: Auto-regenerated on every News or GalleryAlbum create/update/delete
- **Search**: MongoDB text indexes on News & GalleryAlbum
- **Auth & CSRF**: `express-session` + `csurf`
- **Slugify**: `slugify` with Turkish locale support

## Directory Structure

```
backend/
├── controllers/     # Request handlers for each route
├── middleware/      # Express middleware functions
├── models/          # Mongoose models for MongoDB
├── routes/          # Express route definitions
├── uploads/         # Uploaded files storage
├── utils/           # Utility functions
├── config/          # Configuration files
│   ├── environments/  # Environment-specific configs
│   ├── config.js      # Main config file
│   └── db.js          # Database connection
├── services/        # Business logic services
├── validations/     # Request validation rules
├── index.js         # Application entry point
└── server.js        # Express server configuration
```

## API Design

The backend follows RESTful API design principles:

- **Resource-based URLs**: `/api/news`, `/api/gallery/albums`, etc.
- **HTTP Methods**: GET, POST, PUT, DELETE
- **Status Codes**: 200, 201, 400, 401, 403, 404, 500, etc.
- **Query Parameters**: Pagination, filtering, sorting
- **Response Format**: JSON with consistent structure

### API Endpoint Templates

The template includes a set of generic API endpoint patterns that can be customized for different content types and website concepts:

#### Core API Endpoints

- `GET /api/sitemap.xml` - XML sitemap
- `GET /api/sitemap.html` - HTML sitemap
- `GET /api/content/:type` - List/paginate/search any content type (`?q=&page=&limit=`)
- `GET /api/content/:type/:slug` - Single content item by slug
- `GET /api/media/:type` - List media items by type (images, videos, etc.)
- `GET /api/media/:type/:id` - Get media item details
- `GET /api/search?q=` - Universal search across all content types
- `GET /api/settings/:group` - Get website settings by group
- `POST /api/contact` - Send contact message
- `POST /api/subscribe` - Subscribe to newsletter

#### Authentication Endpoints

- `POST /api/auth/login` - Login (`{ username, password }`)
- `POST /api/auth/register` - Register new user (if enabled)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user info
- `POST /api/auth/reset-password` - Request password reset
- `PUT /api/auth/reset-password` - Complete password reset
- `GET /api/csrf-token` - Get CSRF token for forms & AJAX calls

#### Admin API Endpoints

- `GET /api/admin/content/:type` - List content items (admin view)
- `POST /api/admin/content/:type` - Create content item
- `GET /api/admin/content/:type/:id` - Get content item details
- `PUT /api/admin/content/:type/:id` - Update content item
- `DELETE /api/admin/content/:type/:id` - Delete content item
- `GET /api/admin/media/:type` - List media items (admin view)
- `POST /api/admin/media/:type` - Upload media item
- `DELETE /api/admin/media/:type/:id` - Delete media item
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/settings/:group` - Get settings
- `PUT /api/admin/settings/:group` - Update settings
- `GET /api/admin/analytics` - Get analytics data
- `GET /api/admin/system/logs` - View system logs
- `GET /api/admin/system/health` - Check system health
- `GET /api/admin/system/cleanup` - Perform system cleanup tasks

### Content Type Examples

The API can be customized for different content types based on the website concept:

#### Blog/News Website
- Content types: articles, categories, tags, comments
- Example endpoints: `/api/content/articles`, `/api/content/categories`

#### E-commerce Website
- Content types: products, categories, orders, reviews
- Example endpoints: `/api/content/products`, `/api/content/orders`

#### Portfolio Website
- Content types: projects, skills, testimonials
- Example endpoints: `/api/content/projects`, `/api/content/testimonials`

#### Event Website
- Content types: events, speakers, venues, registrations
- Example endpoints: `/api/content/events`, `/api/content/speakers`

## Middleware

### Authentication Middleware

- `isAuthenticated`: Verifies that the user is logged in
- `isSuperAdmin`: Verifies that the user has super-admin role
- `isAdmin`: Verifies that the user has super-admin role (alias for isSuperAdmin for backward compatibility)
- `isEditor`: Verifies that the user has at least editor role (either 'editor' or 'super-admin')

### CSRF Protection

The application uses CSRF protection for all non-GET requests:

```javascript
// CSRF token route
router.get('/csrf-token', csrfProtection, authController.getCsrfToken);
```

### Request Validation

The application uses express-validator for request validation:

```javascript
// Example validation rules
const createUserRules = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .isString().withMessage('Username must be a string')
    .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens')
    .trim(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isString().withMessage('Password must be a string')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),

  body('role')
    .optional()
    .isIn(['super-admin', 'editor']).withMessage('Role must be either super-admin or editor')
    .default('editor')
];
```

### Error Handling

The application includes comprehensive error handling:

```javascript
// Example error handling middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorResponse = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal Server Error'
    }
  };

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
  }

  res.status(statusCode).json(errorResponse);
};
```

### Logging

The application uses Winston for logging:

```javascript
// Example logging middleware
const httpLogger = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      requestId: req.requestId,
      userAgent: req.headers['user-agent'],
      ip: req.ip
    };

    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error('HTTP Request', logData);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP Request', logData);
    } else {
      logger.info('HTTP Request', logData);
    }
  });

  next();
};
```

### Rate Limiting

The application uses rate limiting to prevent abuse:

```javascript
// Example rate limiting middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.'
    }
  }
});
```

## Controllers

Controllers handle the request/response cycle and delegate business logic to services:

```javascript
// Example controller
const newsController = {
  // Get all news
  getAllNews: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, q = '' } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search: q
      };

      const result = await newsService.getAllNews(options);

      res.json({
        success: true,
        news: result.news,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },

  // More controller methods...
};
```

## Services

Services contain the business logic and interact with the database:

```javascript
// Example service
const newsService = {
  // Get all news
  getAllNews: async (options) => {
    const { page, limit, search } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const news = await News.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username');

    // Get total count
    const total = await News.countDocuments(query);

    return {
      news,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  },

  // More service methods...
};
```

## File Uploads

The application uses Multer for file uploads:

```javascript
// Example file upload middleware
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const albumId = req.params.id;
    const dir = path.join(__dirname, '..', 'uploads', 'gallery', albumId);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'));
    }
  }
});
```

## Real-time Communication

The application uses Socket.io for real-time communication:

```javascript
// Example Socket.io service
const socketService = {
  // Initialize Socket.io
  init: (server) => {
    const io = new Server(server, {
      cors: {
        origin: config.server.cors.origin,
        credentials: true
      }
    });

    // Handle connection
    io.on('connection', (socket) => {
      debug.log('New client connected', socket.id);

      // Track online user
      onlineUserService.addUser(socket.id);

      // Handle disconnect
      socket.on('disconnect', () => {
        debug.log('Client disconnected', socket.id);
        onlineUserService.removeUser(socket.id);
      });
    });

    // Store io instance
    socketService.io = io;

    return io;
  },

  // Get Socket.io instance
  getIO: () => {
    if (!socketService.io) {
      throw new Error('Socket.io not initialized');
    }
    return socketService.io;
  },

  // Emit event to all clients
  emit: (event, data) => {
    socketService.getIO().emit(event, data);
  }
};
```

## Security Features

- Password hashing with bcrypt
- JWT authentication
- CSRF protection
- Helmet.js for HTTP headers security
- Input validation and sanitization
- Rate limiting

## Environment Variables

```
PORT=5000                           # Server port
MONGODB_URI=mongodb://localhost:27017/charity_info  # MongoDB connection string
JWT_SECRET=your_jwt_secret_key_here # Secret for JWT tokens
SESSION_SECRET=your_session_secret  # Secret for session cookies
NODE_ENV=development                # Environment (development/production)
SITE_URL=http://localhost:5000      # Base URL for sitemap generation
```

## Running the Server

### Development Mode

```
npm run dev
```

### Production Mode

```
npm start
```

## Content Type System

The template includes a flexible content type system that makes it easy to define and manage different types of content:

### Content Type Definition

Content types are defined using a schema-based approach:

```javascript
// Example content type definition for a product
const productTypeDefinition = {
  name: 'product',
  fields: [
    {
      name: 'title',
      type: 'string',
      required: true,
      validation: { minLength: 3, maxLength: 200 }
    },
    {
      name: 'description',
      type: 'text',
      required: true
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      validation: { min: 0 }
    },
    {
      name: 'images',
      type: 'media',
      multiple: true
    },
    {
      name: 'category',
      type: 'reference',
      reference: 'category'
    },
    {
      name: 'featured',
      type: 'boolean',
      default: false
    },
    {
      name: 'tags',
      type: 'array',
      items: { type: 'string' }
    }
  ],
  indexes: [
    { fields: { title: 'text', description: 'text' } },
    { fields: { category: 1 } }
  ]
};
```

### Dynamic Model Generation

The content type system can automatically generate Mongoose models based on the content type definitions:

```javascript
// Generate a Mongoose model from a content type definition
function generateModel(contentType) {
  const schemaDefinition = {};

  contentType.fields.forEach(field => {
    let schemaField = {};

    switch (field.type) {
      case 'string':
      case 'text':
        schemaField.type = String;
        break;
      case 'number':
        schemaField.type = Number;
        break;
      case 'boolean':
        schemaField.type = Boolean;
        break;
      case 'date':
        schemaField.type = Date;
        break;
      case 'media':
        if (field.multiple) {
          schemaField = [{ type: String }];
        } else {
          schemaField.type = String;
        }
        break;
      case 'reference':
        schemaField.type = mongoose.Schema.Types.ObjectId;
        schemaField.ref = field.reference;
        break;
      case 'array':
        schemaField = [field.items];
        break;
      // Add more field types as needed
    }

    if (field.required) {
      if (typeof schemaField === 'object' && !Array.isArray(schemaField)) {
        schemaField.required = true;
      }
    }

    if (field.default !== undefined) {
      if (typeof schemaField === 'object' && !Array.isArray(schemaField)) {
        schemaField.default = field.default;
      }
    }

    schemaDefinition[field.name] = schemaField;
  });

  // Add common fields
  schemaDefinition.slug = {
    type: String,
    unique: true
  };

  schemaDefinition.createdAt = {
    type: Date,
    default: Date.now
  };

  schemaDefinition.updatedAt = {
    type: Date,
    default: Date.now
  };

  // Create schema
  const schema = new mongoose.Schema(schemaDefinition);

  // Add indexes
  if (contentType.indexes) {
    contentType.indexes.forEach(index => {
      schema.index(index.fields);
    });
  }

  // Add pre-save middleware for slug generation
  schema.pre('save', function(next) {
    if (this.isModified('title') || !this.slug) {
      this.slug = slugify(this.title, config.slugifyOptions);
    }

    if (this.isModified()) {
      this.updatedAt = Date.now();
    }

    next();
  });

  // Create and return the model
  return mongoose.model(contentType.name, schema);
}
```

## Adapting the Backend for Different Website Concepts

To adapt the backend for a new website concept:

1. Define content types that match the website's requirements
2. Configure the API endpoints for the content types
3. Customize the controllers and services as needed
4. Update the validation rules for the new endpoints
5. Configure the authentication and authorization rules
6. Update the environment variables for the new project

## Best Practices

- Use async/await for asynchronous operations
- Use try/catch blocks for error handling
- Use middleware for common functionality
- Use services for business logic
- Use controllers for request/response handling
- Use validation for input sanitization
- Use environment variables for configuration
- Use logging for debugging and monitoring
- Use rate limiting for security
- Use CSRF protection for security
- Use JWT authentication for security
- Use bcrypt for password hashing
