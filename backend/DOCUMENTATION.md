# Backend Documentation

## Overview

The backend of the Charity Information Website is built with Node.js, Express, and MongoDB. It provides a RESTful API for the frontend to interact with the database and perform various operations.

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
├── index.js         # Application entry point
└── server.js        # Express server configuration
```

## Models

### User Model

```javascript
{
  username: String,
  password: String (hashed),
  role: String (enum: ['super-admin', 'editor']),
  createdAt: Date,
  updatedAt: Date
}
```

### News Model

```javascript
{
  title: String,
  slug: String,
  content: String,
  summary: String,
  image: String (path),
  attachments: [
    {
      filename: String,
      path: String,
      mimetype: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### GalleryAlbum Model

```javascript
{
  title: String,
  slug: String,
  description: String,
  coverImage: String (path),
  images: [
    {
      filename: String,
      path: String,
      caption: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### FAQ Model

```javascript
{
  question: String,
  answer: String,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Location Model

```javascript
{
  name: String,
  address: String,
  city: String,
  phone: String,
  email: String,
  isMainOffice: Boolean,
  coordinates: {
    lat: Number,
    lng: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Team Model

```javascript
{
  name: String,
  title: String,
  bio: String,
  image: String (path),
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Partner Model

```javascript
{
  name: String,
  logo: String (path),
  website: String,
  order: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Subscriber Model

```javascript
{
  email: String,
  name: String,
  createdAt: Date
}
```

### Contact Model

```javascript
{
  name: String,
  email: String,
  subject: String,
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

### VisitCounter Model

```javascript
{
  date: String (YYYY-MM-DD),
  totalVisits: Number,
  uniqueVisits: Number
}
```

### OnlineUser Model

```javascript
{
  sessionId: String,
  lastSeen: Date
}
```

### OrphanedFile Model

```javascript
{
  fileId: String,           // ID of the file (GridFS ID or filename)
  storageType: String,      // 'gridfs' or 'filesystem'
  entityType: String,       // Type of entity (e.g., 'news', 'gallery')
  reason: String,           // Reason for tracking
  resolved: Boolean,        // Whether the issue has been resolved
  resolvedAt: Date,         // When the issue was resolved
  metadata: Object,         // Additional metadata
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Public Endpoints

#### Sitemap
- `GET /api/sitemap.xml` - XML sitemap
- `GET /api/sitemap.html` - HTML sitemap

#### News
- `GET /api/news` - List/paginate/search News (`?q=&page=&limit=`)
- `GET /api/news/:slug` - Single article by slug

#### Gallery
- `GET /api/gallery/albums` - List all albums
- `GET /api/gallery/albums/:slug` - Album details + images

#### Search
- `GET /api/search?q=` - Combined text search on News & Albums

#### FAQ
- `GET /api/faqs` - List all FAQs

#### About
- `GET /api/about` - Get about page content
- `GET /api/team` - List team members

#### Contact
- `GET /api/locations` - List office locations
- `POST /api/contact` - Send contact message

#### Partners
- `GET /api/partners` - List partners/sponsors

#### Newsletter
- `POST /api/subscribers` - Subscribe to newsletter

### Authentication Endpoints

- `POST /api/auth/login` - Login (`{ username, password }`)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user info
- `GET /api/csrf-token` - Get CSRF token for forms & AJAX calls

### Admin Endpoints (requires authentication)

#### News Management
- `POST /api/admin/news` - Create article
- `PUT /api/admin/news/:id` - Update article
- `DELETE /api/admin/news/:id` - Delete article
- `GET /api/admin/news/:id/attachments` - List attachments
- `POST /api/admin/news/:id/attachments` - Upload attachment
- `DELETE /api/admin/news/:id/attachments/:aid` - Delete attachment

#### Gallery Management
- `POST /api/admin/gallery/albums` - Create album
- `PUT /api/admin/gallery/albums/:id` - Update album
- `DELETE /api/admin/gallery/albums/:id` - Delete album
- `POST /api/admin/gallery/albums/:id/images` - Upload image
- `DELETE /api/admin/gallery/images/:id` - Delete image

#### User Management (Super-admin only)
- `GET /api/admin/users` - List users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

#### FAQ Management
- `GET /api/admin/faqs` - List FAQs
- `POST /api/admin/faqs` - Create FAQ
- `PUT /api/admin/faqs/:id` - Update FAQ
- `DELETE /api/admin/faqs/:id` - Delete FAQ

#### About Management (Super-admin only)
- `PUT /api/admin/about` - Update about page
- `GET /api/admin/team` - List team members
- `POST /api/admin/team` - Create team member
- `PUT /api/admin/team/:id` - Update team member
- `DELETE /api/admin/team/:id` - Delete team member

#### Location Management (Super-admin only)
- `POST /api/admin/locations` - Create location
- `PUT /api/admin/locations/:id` - Update location
- `DELETE /api/admin/locations/:id` - Delete location

#### Partner Management (Super-admin only)
- `POST /api/admin/partners` - Create partner
- `PUT /api/admin/partners/:id` - Update partner
- `DELETE /api/admin/partners/:id` - Delete partner

#### Contact Management (Super-admin only)
- `GET /api/admin/contact` - List contact messages
- `PUT /api/admin/contact/:id` - Mark message as read
- `DELETE /api/admin/contact/:id` - Delete message

#### Subscriber Management (Super-admin only)
- `GET /api/admin/subscribers` - List subscribers
- `DELETE /api/admin/subscribers/:id` - Delete subscriber

#### Analytics & Metrics (Super-admin only)
- `GET /api/admin/analytics/visits` - Visit statistics
- `GET /api/admin/analytics/online` - Online user count

#### File Management & Cleanup (Super-admin only)
- `GET /api/admin/cleanup/orphaned-files` - List orphaned files
- `POST /api/admin/cleanup/process-orphaned` - Process orphaned files
- `PUT /api/admin/cleanup/orphaned-files/:id` - Mark orphaned file as resolved
- `DELETE /api/admin/cleanup/orphaned-files/:id` - Delete orphaned file record

## Middleware

### Authentication Middleware

- `isAuthenticated`: Verifies that the user is logged in
- `isSuperAdmin`: Verifies that the user has super-admin role
- `isAdmin`: Verifies that the user has super-admin role (alias for isSuperAdmin for backward compatibility)
- `isEditor`: Verifies that the user has at least editor role (either 'editor' or 'super-admin')

### CSRF Protection

All non-GET requests require a valid CSRF token in the `X-CSRF-Token` header.

### File Upload

- `multer`: Handles file uploads for news attachments and gallery images

## Error Handling

The API uses a consistent error response format:

```json
{
  "message": "Error message",
  "error": "Detailed error message (development mode only)",
  "stack": "Error stack trace (development mode only)",
  "errors": {
    "field1": "Validation error for field1",
    "field2": "Validation error for field2"
  }
}
```

### Error Handling Utilities

The backend includes enhanced error handling utilities:

- `controllerUtils.handleControllerError`: Centralized error handler for controllers
  - Logs detailed error information including stack traces
  - Provides appropriate error responses based on error type
  - Includes validation errors when available
  - Sanitizes error details in production mode

- `controllerUtils.trackOrphanedFile`: Tracks files that failed to be deleted
  - Records file information for later cleanup
  - Helps prevent orphaned files in storage

- `controllerUtils.safeDeleteFile`: Safe file deletion with orphaned file tracking
  - Handles both GridFS and filesystem storage
  - Tracks files that fail to delete
  - Returns success/failure status

### Common HTTP Status Codes

- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Permission denied
- `404`: Not Found - Resource not found
- `409`: Conflict - Resource already exists
- `422`: Unprocessable Entity - Validation error
- `500`: Internal Server Error - Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute for public endpoints
- 300 requests per minute for authenticated users

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
