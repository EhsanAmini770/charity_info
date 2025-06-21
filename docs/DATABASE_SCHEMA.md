# Database Schema

## Overview

The Web Project Template uses MongoDB as its database. MongoDB is a NoSQL document database that stores data in JSON-like documents. The application uses Mongoose as an Object Data Modeling (ODM) library to interact with MongoDB. The flexible schema design allows for easy adaptation to different website concepts.

## Database Models

### User Model

```javascript
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required']
  },
  role: {
    type: String,
    enum: ['super-admin', 'editor'], // Only these two roles are supported
    default: 'editor'
  },
  slug: {
    type: String,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

### News Model

```javascript
const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  body: {
    type: String,
    required: [true, 'Body content is required']
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attachment'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### Attachment Model

```javascript
const AttachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  newsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'News',
    required: true
  },
  storedInFileSystem: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

### GalleryAlbum Model

```javascript
const GalleryAlbumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
```

### GalleryImage Model

```javascript
const GalleryImageSchema = new mongoose.Schema({
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GalleryAlbum',
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});
```

### FAQ Model

```javascript
const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true
  },
  answer: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });
```

### Team Model

```javascript
const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  position: {
    type: String,
    required: true,
    trim: true
  },
  bio: {
    type: String,
    required: true,
    trim: true
  },
  photo: {
    type: String,
    required: false
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  socialLinks: {
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    facebook: { type: String, trim: true }
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });
```

### Location Model

```javascript
const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true
  },
  isMainOffice: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });
```

### Partner Model

```javascript
const partnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    required: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  partnerType: {
    type: String,
    enum: ['sponsor', 'partner', 'supporter'],
    default: 'partner'
  },
  featured: {
    type: Boolean,
    default: false
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });
```

### Subscriber Model

```javascript
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  name: {
    type: String,
    trim: true
  },
  subscribed: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  }
}, { timestamps: true });
```

### About Model

```javascript
const aboutSchema = new mongoose.Schema({
  mission: {
    type: String,
    required: true,
    trim: true
  },
  vision: {
    type: String,
    required: true,
    trim: true
  },
  foundedYear: {
    type: String,
    required: true,
    trim: true
  },
  volunteersCount: {
    type: String,
    required: true,
    trim: true
  },
  peopleHelpedCount: {
    type: String,
    required: true,
    trim: true
  },
  communitiesCount: {
    type: String,
    required: true,
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });
```

### Contact Model

```javascript
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
```

### VisitCounter Model

```javascript
const visitCounterSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
    unique: true
  },
  totalVisits: {
    type: Number,
    default: 0
  },
  uniqueVisits: {
    type: Number,
    default: 0
  }
});
```

### OnlineUser Model

```javascript
const OnlineUserSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
});

// Create index to expire documents after timeout (5 minutes)
OnlineUserSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 300 });
```

### OrphanedFile Model

```javascript
const OrphanedFileSchema = new mongoose.Schema({
  // ID of the file (GridFS ID or filename)
  fileId: {
    type: String,
    required: true
  },

  // Type of storage ('gridfs' or 'filesystem')
  storageType: {
    type: String,
    enum: ['gridfs', 'filesystem'],
    required: true
  },

  // Type of entity the file was associated with
  entityType: {
    type: String,
    required: true
  },

  // Reason for tracking
  reason: {
    type: String,
    required: true
  },

  // Whether the issue has been resolved
  resolved: {
    type: Boolean,
    default: false
  },

  // When the issue was resolved
  resolvedAt: {
    type: Date
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });
```

## Data Relationships

### One-to-Many Relationships

- **User to News**: One user can create many news articles
- **GalleryAlbum to GalleryImage**: One album can contain many images
- **News to Attachment**: One news article can have many attachments

### Many-to-One Relationships

- **News to User**: Many news articles can be created by one user
- **GalleryImage to GalleryAlbum**: Many images can belong to one album
- **Attachment to News**: Many attachments can belong to one news article

## Indexes

The application uses indexes to improve query performance:

```javascript
// Text indexes for search
NewsSchema.index({ title: 'text', body: 'text' });
GalleryAlbumSchema.index({ title: 'text', description: 'text' });
partnerSchema.index({ name: 'text', description: 'text' });
locationSchema.index({ name: 'text', description: 'text', address: 'text' });
subscriberSchema.index({ email: 'text', name: 'text' });

// TTL index for online users
OnlineUserSchema.index({ lastActiveAt: 1 }, { expireAfterSeconds: 300 });
```

## Middleware

The application uses Mongoose middleware for various operations:

```javascript
// Generate slug before saving
NewsSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, config.slugifyOptions);
  }

  if (this.isModified()) {
    this.updatedAt = Date.now();
  }

  next();
});

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

// Regenerate sitemap after save
NewsSchema.post('save', async function() {
  try {
    if (sitemapService) {
      await sitemapService.regenerateSitemap();
    }
  } catch (error) {
    debug.error('Error regenerating sitemap:', error);
  }
});
```

## GridFS

The application uses GridFS for storing large files like news attachments:

```javascript
// Example of storing a file in GridFS
const storeFileInGridFS = (file) => {
  return new Promise((resolve, reject) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'attachments'
    });

    const uploadStream = bucket.openUploadStream(file.originalname);
    const readStream = fs.createReadStream(file.path);

    readStream.pipe(uploadStream)
      .on('error', (error) => {
        reject(error);
      })
      .on('finish', () => {
        resolve(uploadStream.id);
      });
  });
};
```

## Data Validation

The application uses Mongoose validation for data integrity:

```javascript
// Example of Mongoose validation
const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  // Other fields...
});
```

## Database Connection

The application connects to MongoDB using Mongoose:

```javascript
// Example of database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoURI, config.mongoOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
```

## Database Configuration

The application uses environment variables for database configuration:

```javascript
// Example of database configuration
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/charity_info';
const mongoOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};
```

## Adapting the Database Schema for Different Website Concepts

The database schema can be adapted for different website concepts by modifying the models, relationships, and validation rules. Here are some examples of how the schema can be adapted for different website types:

### Blog/News Website

**Core Models:**
- `Article`: Title, content, summary, image, author, category, tags, publishDate, featured
- `Category`: Name, description, slug, parent
- `Tag`: Name, slug
- `Comment`: Content, author, article, status

**Example Article Model:**
```javascript
const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
  publishDate: {
    type: Date,
    default: Date.now
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
```

### E-commerce Website

**Core Models:**
- `Product`: Name, description, price, images, category, attributes, stock
- `Category`: Name, description, slug, parent
- `Order`: Customer, products, quantities, total, status, shipping, billing
- `Customer`: Name, email, password, addresses, orders
- `Review`: Product, customer, rating, content

**Example Product Model:**
```javascript
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  images: [{
    type: String
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  attributes: {
    type: Map,
    of: String
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
```

### Portfolio Website

**Core Models:**
- `Project`: Title, description, images, technologies, client, date, category
- `Skill`: Name, category, proficiency
- `Testimonial`: Client, company, content, rating
- `Service`: Title, description, icon, price

**Example Project Model:**
```javascript
const ProjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  technologies: [{
    type: String
  }],
  client: {
    type: String,
    trim: true
  },
  date: {
    type: Date
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
```

### Event Website

**Core Models:**
- `Event`: Title, description, date, time, venue, image, category, registration
- `Speaker`: Name, bio, photo, events, position, company
- `Venue`: Name, address, capacity, facilities, map
- `Registration`: User, event, ticket, status

**Example Event Model:**
```javascript
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  venue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Venue'
  },
  image: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  speakers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Speaker'
  }],
  maxAttendees: {
    type: Number
  },
  featured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });
```

## Extending the Database Schema

To extend the database schema for a new project:

1. Update the models to match the new project's data requirements
2. Add new fields to existing models as needed
3. Add new models for new entities
4. Update the relationships between models
5. Add new indexes for improved query performance
6. Update the middleware for new models
7. Update the validation rules for new fields
