# Deployment Guide

## Overview

This guide provides instructions for deploying the Web Project Template to production. The application consists of a React frontend and a Node.js/Express backend with MongoDB as the database. The deployment process is designed to be flexible and can be adapted for different website concepts and hosting environments.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Git
- A hosting provider for the frontend (e.g., Vercel, Netlify, AWS S3)
- A hosting provider for the backend (e.g., Heroku, AWS EC2, DigitalOcean)

## Environment Setup

### Backend Environment Variables

Create a `.env` file in the backend directory with the following variables, customized for your website concept:

```
# Server
PORT=5000
NODE_ENV=production
SITE_URL=https://your-website.com

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your_database

# Authentication
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_key_here

# CORS
CORS_ORIGIN=https://your-website.com

# File Storage (if using AWS S3)
# AWS_ACCESS_KEY_ID=your_access_key_id
# AWS_SECRET_ACCESS_KEY=your_secret_access_key
# AWS_S3_BUCKET=your_bucket_name

# Email (if using email functionality)
# EMAIL_SERVICE=smtp.example.com
# EMAIL_USER=your_email@example.com
# EMAIL_PASSWORD=your_email_password

# Payment Gateway (for e-commerce websites)
# STRIPE_SECRET_KEY=your_stripe_secret_key
# STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Analytics (if using analytics)
# GOOGLE_ANALYTICS_ID=your_google_analytics_id
```

The environment variables you need will depend on the specific features of your website concept. For example, an e-commerce website will need payment gateway variables, while a blog might need email service variables for notifications.

### Frontend Environment Variables

Create a `.env` file in the root directory with the following variables, customized for your website concept:

```
# API URL
VITE_API_URL=https://api.your-website.com

# Analytics (if using analytics)
# VITE_GOOGLE_ANALYTICS_ID=your_google_analytics_id

# Maps (if using maps)
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Payment Gateway (for e-commerce websites)
# VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Feature Flags (for gradual feature rollout)
# VITE_FEATURE_DARK_MODE=true
# VITE_FEATURE_COMMENTS=true
```

The environment variables you need will depend on the specific features of your website concept. Use the `VITE_` prefix for all variables that need to be accessible in the frontend code.

## Building the Application

### Building the Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the backend (if using TypeScript):
   ```
   npm run build
   ```

### Building the Frontend

1. Navigate to the root directory:
   ```
   cd ..
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the frontend:
   ```
   npm run build
   ```

## Deployment Options

### Option 1: Traditional Hosting

#### Backend Deployment

1. Set up a server with Node.js installed
2. Copy the backend files to the server
3. Install dependencies:
   ```
   npm install --production
   ```
4. Start the server:
   ```
   npm start
   ```
5. Set up a process manager like PM2:
   ```
   npm install -g pm2
   pm2 start index.js --name charity-backend
   ```
6. Set up a reverse proxy with Nginx:
   ```
   server {
     listen 80;
     server_name api.your-charity-site.com;

     location / {
       proxy_pass http://localhost:5000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```
7. Set up SSL with Let's Encrypt:
   ```
   sudo certbot --nginx -d api.your-charity-site.com
   ```

#### Frontend Deployment

1. Copy the built frontend files to the server
2. Set up Nginx to serve the static files:
   ```
   server {
     listen 80;
     server_name your-charity-site.com;

     root /path/to/frontend/dist;
     index index.html;

     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```
3. Set up SSL with Let's Encrypt:
   ```
   sudo certbot --nginx -d your-charity-site.com
   ```

### Option 2: Platform as a Service (PaaS)

#### Backend Deployment to Heroku

1. Create a `Procfile` in the backend directory:
   ```
   web: node index.js
   ```
2. Create a Heroku app:
   ```
   heroku create charity-backend
   ```
3. Set environment variables:
   ```
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_jwt_secret_key_here
   heroku config:set SESSION_SECRET=your_session_secret_key_here
   heroku config:set MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/charity_info
   heroku config:set CORS_ORIGIN=https://your-charity-site.com
   heroku config:set SITE_URL=https://your-charity-site.com
   ```
4. Push to Heroku:
   ```
   git subtree push --prefix backend heroku main
   ```

#### Frontend Deployment to Vercel

1. Create a `vercel.json` file in the root directory:
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```
2. Deploy to Vercel:
   ```
   vercel
   ```
3. Set environment variables in the Vercel dashboard:
   ```
   VITE_API_URL=https://charity-backend.herokuapp.com
   ```

### Option 3: Docker Deployment

#### Create Docker Files

1. Create a `Dockerfile` for the backend:
   ```dockerfile
   FROM node:16-alpine

   WORKDIR /app

   COPY package*.json ./
   RUN npm install --production

   COPY . .

   EXPOSE 5000

   CMD ["node", "index.js"]
   ```

2. Create a `Dockerfile` for the frontend:
   ```dockerfile
   FROM node:16-alpine as build

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .
   RUN npm run build

   FROM nginx:alpine

   COPY --from=build /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf

   EXPOSE 80

   CMD ["nginx", "-g", "daemon off;"]
   ```

3. Create a `docker-compose.yml` file:
   ```yaml
   version: '3'

   services:
     backend:
       build: ./backend
       ports:
         - "5000:5000"
       environment:
         - NODE_ENV=production
         - MONGODB_URI=mongodb://mongo:27017/charity_info
         - JWT_SECRET=your_jwt_secret_key_here
         - SESSION_SECRET=your_session_secret_key_here
         - CORS_ORIGIN=http://localhost
         - SITE_URL=http://localhost
       depends_on:
         - mongo

     frontend:
       build: .
       ports:
         - "80:80"
       environment:
         - VITE_API_URL=http://localhost:5000
       depends_on:
         - backend

     mongo:
       image: mongo
       ports:
         - "27017:27017"
       volumes:
         - mongo-data:/data/db

   volumes:
     mongo-data:
   ```

4. Deploy with Docker Compose:
   ```
   docker-compose up -d
   ```

## Database Setup

### MongoDB Atlas

1. Create a MongoDB Atlas account
2. Create a new cluster
3. Create a database user
4. Whitelist IP addresses
5. Get the connection string
6. Set the connection string in the backend environment variables

### Local MongoDB

1. Install MongoDB
2. Start MongoDB:
   ```
   mongod --dbpath /path/to/data/directory
   ```
3. Set the connection string in the backend environment variables:
   ```
   MONGODB_URI=mongodb://localhost:27017/charity_info
   ```

## File Storage

### Local File Storage

1. Create a directory for file uploads:
   ```
   mkdir -p backend/uploads/gallery
   ```
2. Set permissions:
   ```
   chmod -R 755 backend/uploads
   ```

### Cloud File Storage (AWS S3)

1. Create an AWS S3 bucket
2. Set up IAM user with S3 access
3. Install the AWS SDK:
   ```
   npm install aws-sdk
   ```
4. Update the file upload service to use S3:
   ```javascript
   const AWS = require('aws-sdk');
   const s3 = new AWS.S3({
     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
   });

   const uploadToS3 = (file, key) => {
     return new Promise((resolve, reject) => {
       const params = {
         Bucket: process.env.AWS_S3_BUCKET,
         Key: key,
         Body: fs.createReadStream(file.path),
         ContentType: file.mimetype
       };

       s3.upload(params, (err, data) => {
         if (err) {
           reject(err);
         } else {
           resolve(data.Location);
         }
       });
     });
   };
   ```

## Security Considerations

### SSL/TLS

1. Set up SSL/TLS certificates for both the frontend and backend
2. Use Let's Encrypt for free certificates
3. Configure Nginx to use SSL/TLS

### Security Headers

1. Set up security headers in the backend:
   ```javascript
   app.use(helmet());
   ```
2. Set up security headers in Nginx:
   ```
   add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload";
   add_header X-Content-Type-Options "nosniff";
   add_header X-Frame-Options "DENY";
   add_header X-XSS-Protection "1; mode=block";
   ```

### CORS

1. Configure CORS in the backend:
   ```javascript
   app.use(cors({
     origin: process.env.CORS_ORIGIN,
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'CSRF-Token']
   }));
   ```

### Rate Limiting

1. Set up rate limiting in the backend:
   ```javascript
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

   app.use('/api', apiLimiter);
   ```

## Monitoring and Logging

### Logging

1. Set up logging in the backend:
   ```javascript
   const logger = winston.createLogger({
     level: 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     defaultMeta: { service: 'charity-info-api' },
     transports: [
       new winston.transports.Console(),
       new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
       new winston.transports.File({ filename: 'logs/combined.log' })
     ]
   });
   ```

### Monitoring

1. Set up monitoring with PM2:
   ```
   pm2 monitor
   ```
2. Set up monitoring with a service like New Relic or Datadog

## Backup and Recovery

### Database Backup

1. Set up automated backups for MongoDB:
   ```
   mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/charity_info" --out=/path/to/backup/directory
   ```
2. Set up a cron job to run the backup daily:
   ```
   0 0 * * * mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/charity_info" --out=/path/to/backup/directory/$(date +\%Y-\%m-\%d)
   ```

### File Backup

1. Set up automated backups for uploaded files:
   ```
   rsync -av /path/to/backend/uploads/ /path/to/backup/directory/uploads/
   ```
2. Set up a cron job to run the backup daily:
   ```
   0 0 * * * rsync -av /path/to/backend/uploads/ /path/to/backup/directory/uploads/$(date +\%Y-\%m-\%d)
   ```

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions

1. Create a `.github/workflows/deploy.yml` file:
   ```yaml
   name: Deploy

   on:
     push:
       branches: [ main ]

   jobs:
     deploy-backend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy to Heroku
           uses: akhileshns/heroku-deploy@v3.12.12
           with:
             heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
             heroku_app_name: "charity-backend"
             heroku_email: ${{ secrets.HEROKU_EMAIL }}
             appdir: "backend"

     deploy-frontend:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy to Vercel
           uses: amondnet/vercel-action@v20
           with:
             vercel-token: ${{ secrets.VERCEL_TOKEN }}
             vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
             vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
             vercel-args: '--prod'
   ```

## Troubleshooting

### Common Issues

1. **CORS errors**: Check the CORS configuration in the backend and make sure the frontend URL is allowed
2. **MongoDB connection errors**: Check the MongoDB connection string and make sure the database is running
3. **File upload errors**: Check the file upload directory permissions and make sure the directory exists
4. **JWT errors**: Check the JWT secret and make sure it's the same in the backend and frontend
5. **Session errors**: Check the session secret and make sure it's the same in the backend and frontend

### Debugging

1. Check the logs:
   ```
   tail -f logs/error.log
   ```
2. Check the server status:
   ```
   pm2 status
   ```
3. Check the MongoDB status:
   ```
   mongo --eval "db.adminCommand('ping')"
   ```

## Maintenance

### Updates

1. Update dependencies regularly:
   ```
   npm outdated
   npm update
   ```
2. Update the operating system regularly:
   ```
   sudo apt update
   sudo apt upgrade
   ```
3. Update the database regularly:
   ```
   mongod --version
   ```

### Monitoring

1. Monitor the server resources:
   ```
   htop
   ```
2. Monitor the disk space:
   ```
   df -h
   ```
3. Monitor the database:
   ```
   mongo --eval "db.stats()"
   ```

## Scaling

### Horizontal Scaling

1. Set up a load balancer
2. Deploy multiple instances of the backend
3. Use a distributed cache like Redis
4. Use a CDN for static assets

### Vertical Scaling

1. Increase the server resources (CPU, RAM)
2. Optimize the database queries
3. Implement caching
4. Use a more powerful server

## Adapting Deployment for Different Website Concepts

The deployment process can be adapted for different website concepts by considering the specific requirements of each type of website. Here are some examples of how the deployment might differ for various website types:

### Blog/News Website

- **Optimization Focus**: Content delivery, image optimization
- **Key Services**: CDN for media files, RSS feed generation
- **Scaling Considerations**: Content caching, database read replicas
- **Additional Tools**: Sitemap generator, SEO monitoring

### E-commerce Website

- **Optimization Focus**: Transaction processing, product catalog performance
- **Key Services**: Payment gateway integration, inventory management
- **Scaling Considerations**: Database sharding, session management
- **Additional Tools**: Fraud detection, order processing queue

### Portfolio Website

- **Optimization Focus**: Image/video delivery, page load speed
- **Key Services**: Media optimization, analytics
- **Scaling Considerations**: CDN for all static assets
- **Additional Tools**: Image compression, lazy loading

### Event Website

- **Optimization Focus**: Registration processing, calendar functionality
- **Key Services**: Email notifications, calendar integration
- **Scaling Considerations**: Handling registration spikes
- **Additional Tools**: Ticket generation, QR code processing

### Community/Forum Website

- **Optimization Focus**: Real-time updates, user content
- **Key Services**: Websockets, notification system
- **Scaling Considerations**: Message queuing, read/write splitting
- **Additional Tools**: Content moderation, reputation system

## Conclusion

This deployment guide provides a comprehensive overview of deploying the Web Project Template to production. By following these instructions and adapting them to your specific website concept, you can set up a secure, reliable, and scalable deployment for your application. Remember to consider the unique requirements of your website type when planning your deployment strategy.
