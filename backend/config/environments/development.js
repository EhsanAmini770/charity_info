
/**
 * Development environment configuration
 */
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
      credentials: true
    }
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/charity_info',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev_jwt_secret',
    jwtExpiresIn: '1d',
    sessionSecret: process.env.SESSION_SECRET || 'dev_session_secret',
    sessionMaxAge: 24 * 60 * 60 * 1000 // 1 day
  },

  // Logging configuration
  logging: {
    level: 'debug',
    morgan: 'dev'
  },

  // Security configuration
  security: {
    helmet: {
      contentSecurityPolicy: false // Disabled in development for easier debugging
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5000 // Much higher limit for development
    }
  },

  // File upload configuration
  uploads: {
    news: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: [
        '.txt', 'text/plain',
        '.pdf', 'application/pdf',
        '.doc', 'application/msword',
        '.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg', 'image/png', 'image/gif'
      ]
    },
    gallery: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/gif']
    }
  },

  // Slugify options
  slugify: {
    lower: true,
    locale: 'tr',
    remove: /[*+~.()'"!:@]/g
  },

  // Online user timeout
  onlineUserTimeout: 60 * 1000, // 60 seconds

  // Site URL for sitemap
  siteUrl: process.env.SITE_URL || 'http://localhost:5000'
};
