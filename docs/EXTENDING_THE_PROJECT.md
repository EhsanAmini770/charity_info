# Extending the Project

## Overview

This guide provides instructions for extending the Charity Information Website to other domains or use cases. The project's architecture is designed to be flexible and modular, making it easy to adapt to different requirements.

## Common Use Cases

The Charity Information Website architecture can be adapted to various use cases:

1. **Event Platform**: Showcase events, allow registration, and display event details
2. **Job Board**: List job openings, allow applications, and display company profiles
3. **Educational Platform**: Share courses, resources, and educational content
4. **Portfolio Website**: Display projects, skills, and professional information
5. **Community Platform**: Connect members, share updates, and organize activities
6. **Product Showcase**: Display products, features, and pricing information
7. **Blog Platform**: Publish articles, categorize content, and engage with readers

## Adapting the Frontend

### Updating the Theme

1. Modify the theme in `tailwind.config.ts` to match the new project's branding:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'charity-primary': '#3b82f6', // Change to your primary color
        'charity-secondary': '#1d4ed8', // Change to your secondary color
        'charity-accent': '#bfdbfe', // Change to your accent color
        'charity-background': '#f9fafb', // Change to your background color
        'charity-foreground': '#1f2937', // Change to your foreground color
        'charity-destructive': '#ef4444', // Change to your destructive color
      },
      // Add more theme customizations
    },
  },
  // Other Tailwind config
};
```

### Updating the Layout

1. Modify the `MainLayout` component to match the new project's layout:

```tsx
// src/components/layout/MainLayout.tsx
export function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header /> {/* Update with your project's header */}
      <main className="flex-grow">
        <Outlet /> {/* React Router outlet for page content */}
      </main>
      <Footer /> {/* Update with your project's footer */}
    </div>
  );
}
```

2. Update the `Header` component with your project's navigation:

```tsx
// src/components/layout/Header.tsx
export function Header() {
  return (
    <header className="bg-charity-primary text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <Logo /> {/* Update with your project's logo */}
          <span className="ml-2 text-xl font-bold">Your Project Name</span>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li><NavLink to="/">Home</NavLink></li>
            {/* Update with your project's navigation links */}
            <li><NavLink to="/about">About</NavLink></li>
            <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
```

### Updating the Pages

1. Create new page components for your project:

```tsx
// src/pages/public/EventsPage.tsx
export function EventsPage() {
  // Fetch events from the API
  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getAllEvents,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ApiError error={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Upcoming Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    </div>
  );
}
```

2. Update the routes in `publicRoutes.tsx`:

```tsx
// src/routes/publicRoutes.tsx
export const PublicRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/events" element={
      <Suspense fallback={<LoadingFallback />}>
        <EventsPage />
      </Suspense>
    } />
    <Route path="/events/:slug" element={
      <Suspense fallback={<LoadingFallback />}>
        <EventDetailPage />
      </Suspense>
    } />
    {/* Add more routes for your project */}
  </Route>
);
```

### Updating the API Services

1. Create new API service functions for your project:

```tsx
// src/services/api/eventsApi.ts
export const eventsApi = {
  getAllEvents: async () => {
    const response = await api.get('/api/events');
    return response.data;
  },
  getEventBySlug: async (slug: string) => {
    const response = await api.get(`/api/events/${slug}`);
    return response.data;
  },
  // Add more API functions for your project
};
```

### Updating the Admin Dashboard

1. Create new admin page components for your project:

```tsx
// src/pages/admin/events/AdminEventsListPage.tsx
export function AdminEventsListPage() {
  // Fetch events from the API
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-events'],
    queryFn: adminEventsApi.getAllEvents,
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ApiError error={error} />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Events</h1>
        <Button asChild>
          <Link to="/admin/events/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Event
          </Link>
        </Button>
      </div>
      <DataTable
        columns={eventsColumns}
        data={data?.events || []}
      />
    </div>
  );
}
```

2. Update the admin routes in `adminRoutes.tsx`:

```tsx
// src/routes/adminRoutes.tsx
export const AdminRoutes = (
  <Route path="/admin" element={
    <ProtectedRoute>
      <Suspense fallback={<LoadingFallback />}>
        <AdminLayout />
      </Suspense>
    </ProtectedRoute>
  }>
    {/* Dashboard */}
    <Route index element={
      <Suspense fallback={<LoadingFallback />}>
        <AdminDashboard />
      </Suspense>
    } />

    {/* Events Management */}
    <Route path="events">
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminEventsListPage />
        </Suspense>
      } />
      <Route path="create" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminEventsCreatePage />
        </Suspense>
      } />
      <Route path="edit/:id" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminEventsEditPage />
        </Suspense>
      } />
    </Route>
    {/* Add more admin routes for your project */}
  </Route>
);
```

## Adapting the Backend

### Updating the Models

1. Create new models for your project:

```javascript
// backend/models/Event.js
const mongoose = require('mongoose');
const slugify = require('slugify');
const config = require('../config/config');

const EventSchema = new mongoose.Schema({
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
    required: [true, 'Description is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  image: {
    type: String
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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

// Generate slug before saving
EventSchema.pre('save', function(next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, config.slugifyOptions);
  }

  if (this.isModified()) {
    this.updatedAt = Date.now();
  }

  next();
});

// Create text index for search
EventSchema.index({ title: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Event', EventSchema);
```

### Updating the Controllers

1. Create new controllers for your project:

```javascript
// backend/controllers/eventController.js
const Event = require('../models/Event');
const errorUtils = require('../utils/errorUtils');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('event-controller');

const eventController = {
  // Get all events
  getAllEvents: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, q = '' } = req.query;
      const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
      };

      // Build query
      const query = {};
      if (q) {
        query.$text = { $search: q };
      }

      // Execute query
      const events = await Event.find(query)
        .sort({ date: 1 })
        .skip((options.page - 1) * options.limit)
        .limit(options.limit)
        .populate('organizer', 'username');

      // Get total count
      const total = await Event.countDocuments(query);

      res.json({
        success: true,
        events,
        pagination: {
          page: options.page,
          limit: options.limit,
          total,
          pages: Math.ceil(total / options.limit)
        }
      });
    } catch (error) {
      debug.error('Error getting events', error);
      next(error);
    }
  },

  // Get event by slug
  getEventBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;
      const event = await Event.findOne({ slug })
        .populate('organizer', 'username');

      if (!event) {
        return next(errorUtils.notFound('Event not found'));
      }

      res.json({
        success: true,
        event
      });
    } catch (error) {
      debug.error('Error getting event by slug', error);
      next(error);
    }
  },

  // Create event (admin only)
  createEvent: async (req, res, next) => {
    try {
      const { title, description, date, location, image } = req.body;
      const event = new Event({
        title,
        description,
        date,
        location,
        image,
        organizer: req.user._id
      });

      await event.save();

      res.status(201).json({
        success: true,
        event
      });
    } catch (error) {
      debug.error('Error creating event', error);
      next(error);
    }
  },

  // Update event (admin only)
  updateEvent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, date, location, image } = req.body;

      const event = await Event.findById(id);
      if (!event) {
        return next(errorUtils.notFound('Event not found'));
      }

      // Update fields
      event.title = title;
      event.description = description;
      event.date = date;
      event.location = location;
      if (image) {
        event.image = image;
      }

      await event.save();

      res.json({
        success: true,
        event
      });
    } catch (error) {
      debug.error('Error updating event', error);
      next(error);
    }
  },

  // Delete event (admin only)
  deleteEvent: async (req, res, next) => {
    try {
      const { id } = req.params;
      const event = await Event.findById(id);
      if (!event) {
        return next(errorUtils.notFound('Event not found'));
      }

      await event.remove();

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      debug.error('Error deleting event', error);
      next(error);
    }
  }
};

module.exports = eventController;
```

### Updating the Routes

1. Create new routes for your project:

```javascript
// backend/routes/eventRoutes.js
const express = require('express');
const eventController = require('../controllers/eventController');
const { isAuthenticated, isEditor } = require('../middleware/auth');
const { validateGetEvents, validateGetEventBySlug, validateCreateEvent, validateUpdateEvent } = require('../validations/eventValidationFlex');
const debug = require('../utils/debug').createNamespace('event-routes');

const router = express.Router();

// Public routes
router.get('/events', validateGetEvents, eventController.getAllEvents);
router.get('/events/:slug', validateGetEventBySlug, eventController.getEventBySlug);

// Admin routes
router.post('/admin/events', isAuthenticated, isEditor, validateCreateEvent, eventController.createEvent);
router.put('/admin/events/:id', isAuthenticated, isEditor, validateUpdateEvent, eventController.updateEvent);
router.delete('/admin/events/:id', isAuthenticated, isEditor, eventController.deleteEvent);

module.exports = router;
```

2. Update the main routes file:

```javascript
// backend/server.js
// Add the new routes
const eventRoutes = require('./routes/eventRoutes');
app.use('/api', eventRoutes);
```

### Updating the Validations

1. Create new validation rules for your project:

```javascript
// backend/validations/eventValidationFlex.js
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../utils/validationUtils');
const debug = require('../utils/debug').createNamespace('event-validation');

/**
 * Validation rules for getting events
 */
const getEventsRules = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
    .toInt(),

  query('q')
    .optional()
    .isString().withMessage('Search query must be a string')
    .trim()
];

/**
 * Validation rules for getting event by slug
 */
const getEventBySlugRules = [
  param('slug')
    .notEmpty().withMessage('Slug is required')
    .isString().withMessage('Slug must be a string')
    .trim()
];

/**
 * Validation rules for creating an event
 */
const createEventRules = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .trim(),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .trim(),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date')
    .toDate(),

  body('location')
    .notEmpty().withMessage('Location is required')
    .isString().withMessage('Location must be a string')
    .trim(),

  body('image')
    .optional()
    .isString().withMessage('Image must be a string')
    .trim()
];

/**
 * Validation rules for updating an event
 */
const updateEventRules = [
  param('id')
    .notEmpty().withMessage('Event ID is required')
    .isMongoId().withMessage('Event ID must be a valid MongoDB ID'),

  body('title')
    .notEmpty().withMessage('Title is required')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 3, max: 200 }).withMessage('Title must be between 3 and 200 characters')
    .trim(),

  body('description')
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .trim(),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 date')
    .toDate(),

  body('location')
    .notEmpty().withMessage('Location is required')
    .isString().withMessage('Location must be a string')
    .trim(),

  body('image')
    .optional()
    .isString().withMessage('Image must be a string')
    .trim()
];

// Export validation middleware
exports.validateGetEvents = [getEventsRules, validateRequest];
exports.validateGetEventBySlug = [getEventBySlugRules, validateRequest];
exports.validateCreateEvent = [createEventRules, validateRequest];
exports.validateUpdateEvent = [updateEventRules, validateRequest];
```

## Domain-Specific Adaptations

### Event Platform

1. **Additional Models**:
   - `Event`: Title, description, date, location, image, organizer
   - `Registration`: User, event, status, registrationDate
   - `Speaker`: Name, bio, photo, events

2. **Additional Features**:
   - Event registration and ticketing
   - Event calendar view
   - Speaker profiles
   - Event categories and filtering

### Job Board

1. **Additional Models**:
   - `Job`: Title, description, company, location, salary, requirements
   - `Company`: Name, description, logo, website, jobs
   - `Application`: User, job, resume, coverLetter, status

2. **Additional Features**:
   - Job search and filtering
   - Company profiles
   - Job application system
   - Resume builder

### Educational Platform

1. **Additional Models**:
   - `Course`: Title, description, instructor, duration, price, lessons
   - `Lesson`: Title, content, video, course, order
   - `Enrollment`: User, course, progress, enrollmentDate

2. **Additional Features**:
   - Course catalog and filtering
   - Video player for lessons
   - Progress tracking
   - Certificates of completion

### Portfolio Website

1. **Additional Models**:
   - `Project`: Title, description, images, technologies, link
   - `Skill`: Name, category, proficiency
   - `Testimonial`: Name, company, content, rating

2. **Additional Features**:
   - Project showcase with filtering
   - Skills visualization
   - Contact form
   - Resume download

### Community Platform

1. **Additional Models**:
   - `Post`: Title, content, author, comments, likes
   - `Group`: Name, description, members, posts
   - `Member`: User, groups, profile, joinDate

2. **Additional Features**:
   - News feed
   - Group management
   - Member profiles
   - Messaging system

### Product Showcase

1. **Additional Models**:
   - `Product`: Name, description, price, images, features
   - `Category`: Name, description, products
   - `Feature`: Name, description, icon

2. **Additional Features**:
   - Product catalog with filtering
   - Product comparison
   - Feature highlights
   - Pricing tables

### Blog Platform

1. **Additional Models**:
   - `Article`: Title, content, author, categories, tags, publishDate
   - `Category`: Name, description, articles
   - `Tag`: Name, articles
   - `Comment`: Content, author, article, createdAt

2. **Additional Features**:
   - Article listing with filtering
   - Category and tag navigation
   - Comment system
   - Related articles

## Best Practices for Extending

1. **Keep the Core Architecture**: Maintain the separation of concerns between frontend and backend
2. **Follow the Existing Patterns**: Use the same patterns for new components and features
3. **Reuse Components**: Leverage existing components and utilities
4. **Maintain Type Safety**: Use TypeScript for all new code
5. **Write Tests**: Add tests for new features
6. **Update Documentation**: Document new features and changes
7. **Consider Performance**: Optimize new features for performance
8. **Follow Accessibility Guidelines**: Ensure new features are accessible
9. **Maintain Security**: Follow security best practices for new features
10. **Use Feature Flags**: Implement feature flags for gradual rollout of new features

## Conclusion

The Charity Information Website architecture provides a solid foundation for building various web applications. By following the patterns and practices established in the project, you can extend it to different domains while maintaining code quality and consistency.
