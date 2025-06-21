/**
 * Production environment configuration
 */
module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    cors: {
      origin: process.env.CORS_ORIGIN || 'https://yourcharitysite.com',
      credentials: true
    }
  },
  
  // Database configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  
  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: '1d',
    sessionSecret: process.env.SESSION_SECRET,
    sessionMaxAge: 24 * 60 * 60 * 1000 // 1 day
  },
  
  // Logging configuration
  logging: {
    level: 'info',
    morgan: 'combined'
  },
  
  // Security configuration
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google-analytics.com'],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https://www.google-analytics.com'],
          connectSrc: ["'self'", 'https://www.google-analytics.com'],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      }
    },
    rateLimit: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // 100 requests per 15 minutes
    }
  },
  
  // File upload configuration
  uploads: {
    news: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['.txt', 'image/jpeg', 'image/png', 'image/gif']
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
  siteUrl: process.env.SITE_URL || 'https://yourcharitysite.com'
};
