# Template Customization Guide

## Overview

This guide provides instructions for customizing the Web Project Template for different website concepts. The template is designed to be flexible and adaptable, allowing you to create various types of websites while maintaining a consistent architecture and code quality.

## Customization Process Overview

1. **Define Website Requirements**: Determine the purpose, features, and content types needed for your website
2. **Choose Theme and Layout**: Select or create a theme and layout that matches your website's branding
3. **Configure Content Types**: Define the content types and fields needed for your website
4. **Customize Frontend Components**: Adapt the page templates and components to fit your content
5. **Customize Backend API**: Configure the API endpoints to support your content types
6. **Set Up Authentication**: Configure the authentication and authorization rules
7. **Deploy**: Deploy your customized website

## Defining Website Requirements

Before customizing the template, clearly define your website's requirements:

1. **Purpose**: What is the main purpose of the website? (e.g., blog, e-commerce, portfolio)
2. **Target Audience**: Who will be using the website?
3. **Content Types**: What types of content will the website display? (e.g., articles, products, projects)
4. **Features**: What features will the website need? (e.g., search, user accounts, comments)
5. **Design**: What visual style should the website have?

## Theme Customization

### Selecting a Theme Variant

The template includes several pre-configured theme variants:

1. **Corporate**: Professional, clean design with blue and gray colors
2. **E-commerce**: Bold, attention-grabbing design with strong call-to-action colors
3. **Creative**: Vibrant, artistic design with unique typography and colors
4. **Minimal**: Simple, elegant design with plenty of whitespace
5. **Dark Mode**: Dark-themed version of any of the above variants

To select a theme variant, update the `tailwind.config.ts` file:

```typescript
// tailwind.config.ts
import { themeVariants } from './src/themes';

export default {
  // Use a pre-configured theme variant
  theme: themeVariants.corporate,
  // Other Tailwind config
};
```

### Creating a Custom Theme

To create a custom theme, modify the `tailwind.config.ts` file:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'primary': '#3b82f6',      // Main brand color
        'primary-dark': '#1d4ed8', // Darker shade for hover states
        'secondary': '#10b981',    // Secondary brand color
        'accent': '#f59e0b',       // Accent color for highlights
        'background': '#f9fafb',   // Page background
        'foreground': '#1f2937',   // Text color
        'destructive': '#ef4444',  // Error/destructive color
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
      },
      borderRadius: {
        'custom': '0.5rem',
      },
      // Add more theme customizations
    },
  },
  // Other Tailwind config
};
```

### Customizing Typography

To customize typography, update the font families and sizes in the `tailwind.config.ts` file:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Montserrat', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'heading-1': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        'heading-2': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
        'heading-3': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.5rem' }],
        'small': ['0.875rem', { lineHeight: '1.25rem' }],
      },
    },
  },
};
```

## Layout Customization

### Selecting a Layout

The template includes several layout components:

1. **StandardLayout**: Basic layout with header, main content, and footer
2. **SidebarLayout**: Layout with sidebar navigation and main content
3. **LandingLayout**: Special layout for landing pages with full-width sections
4. **DashboardLayout**: Layout for admin dashboard with sidebar and top navigation

To select a layout, update the route configuration:

```tsx
// src/routes/publicRoutes.tsx
export const PublicRoutes = (
  <Route element={<StandardLayout />}>
    <Route path="/" element={<HomePage />} />
    {/* Other routes */}
  </Route>
);
```

### Customizing Header and Footer

To customize the header and footer, modify the corresponding components:

```tsx
// src/components/layout/Header.tsx
export function Header() {
  return (
    <header className="bg-primary text-white">
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

```tsx
// src/components/layout/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Your Project Name</h3>
            <p className="text-gray-300">
              A brief description of your project.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Links</h3>
            <ul className="space-y-2">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4">Contact</h3>
            <p className="text-gray-300">
              Email: info@example.com<br />
              Phone: (123) 456-7890
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-300">
            &copy; {new Date().getFullYear()} Your Project Name. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

## Content Type Configuration

### Defining Content Types

To define content types for your website, create content type definitions:

```javascript
// backend/contentTypes/articleType.js
const articleType = {
  name: 'article',
  fields: [
    {
      name: 'title',
      type: 'string',
      required: true,
      validation: { minLength: 3, maxLength: 200 }
    },
    {
      name: 'content',
      type: 'text',
      required: true
    },
    {
      name: 'summary',
      type: 'text',
      required: true
    },
    {
      name: 'image',
      type: 'media'
    },
    {
      name: 'author',
      type: 'reference',
      reference: 'user'
    },
    {
      name: 'category',
      type: 'reference',
      reference: 'category'
    },
    {
      name: 'tags',
      type: 'array',
      items: { type: 'string' }
    },
    {
      name: 'publishDate',
      type: 'date',
      default: Date.now
    },
    {
      name: 'featured',
      type: 'boolean',
      default: false
    }
  ],
  indexes: [
    { fields: { title: 'text', content: 'text', summary: 'text' } },
    { fields: { category: 1 } },
    { fields: { author: 1 } },
    { fields: { publishDate: -1 } }
  ]
};

module.exports = articleType;
```

### Registering Content Types

Register your content types in the content type system:

```javascript
// backend/contentTypes/index.js
const articleType = require('./articleType');
const categoryType = require('./categoryType');
const productType = require('./productType');
// Import other content types

const contentTypes = [
  articleType,
  categoryType,
  productType,
  // Add other content types
];

module.exports = contentTypes;
```

## Frontend Customization

### Customizing Page Templates

To customize page templates for your content types, create or modify the corresponding components:

```tsx
// src/pages/public/ArticlesPage.tsx
export function ArticlesPage() {
  // Fetch articles from the API
  const { data, isLoading, error } = useQuery({
    queryKey: ['content', 'articles'],
    queryFn: () => contentApi.getContentList('article'),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ApiError error={error} />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Articles</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.items.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
}
```

### Creating Custom Components

Create custom components for your content types:

```tsx
// src/components/content/ArticleCard.tsx
interface ArticleCardProps {
  article: {
    _id: string;
    title: string;
    summary: string;
    image?: string;
    slug: string;
    publishDate: string;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="h-full flex flex-col">
      {article.image && (
        <div className="aspect-video overflow-hidden">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">
          <Link to={`/articles/${article.slug}`} className="hover:text-primary">
            {article.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-2">
          {new Date(article.publishDate).toLocaleDateString()}
        </p>
        <p className="line-clamp-3">{article.summary}</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" size="sm">
          <Link to={`/articles/${article.slug}`}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Updating Routes

Update the routes to include your custom pages:

```tsx
// src/routes/publicRoutes.tsx
export const PublicRoutes = (
  <Route element={<StandardLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/articles" element={
      <Suspense fallback={<LoadingFallback />}>
        <ArticlesPage />
      </Suspense>
    } />
    <Route path="/articles/:slug" element={
      <Suspense fallback={<LoadingFallback />}>
        <ArticleDetailPage />
      </Suspense>
    } />
    {/* Add more routes for your content types */}
  </Route>
);
```

## Backend Customization

### Configuring API Endpoints

Configure the API endpoints for your content types:

```javascript
// backend/routes/contentRoutes.js
const express = require('express');
const contentController = require('../controllers/contentController');
const { isAuthenticated, isEditor } = require('../middleware/auth');
const { validateGetContent, validateGetContentBySlug, validateCreateContent, validateUpdateContent } = require('../validations/contentValidationFlex');

const router = express.Router();

// Public routes
router.get('/content/:type', validateGetContent, contentController.getContentList);
router.get('/content/:type/:slug', validateGetContentBySlug, contentController.getContentBySlug);

// Admin routes
router.post('/admin/content/:type', isAuthenticated, isEditor, validateCreateContent, contentController.createContent);
router.put('/admin/content/:type/:id', isAuthenticated, isEditor, validateUpdateContent, contentController.updateContent);
router.delete('/admin/content/:type/:id', isAuthenticated, isEditor, contentController.deleteContent);

module.exports = router;
```

### Creating Custom Controllers

Create custom controllers for specific content types if needed:

```javascript
// backend/controllers/articleController.js
const Article = require('../models/Article');
const errorUtils = require('../utils/errorUtils');
const controllerUtils = require('../utils/controllerUtils');
const debug = require('../utils/debug').createNamespace('article-controller');

const articleController = {
  // Get featured articles
  getFeaturedArticles: async (req, res, next) => {
    try {
      const articles = await Article.find({ featured: true })
        .sort({ publishDate: -1 })
        .limit(3)
        .populate('author', 'username');

      res.json({
        success: true,
        articles
      });
    } catch (error) {
      debug.error('Error getting featured articles', error);
      next(error);
    }
  },

  // Get articles by category
  getArticlesByCategory: async (req, res, next) => {
    try {
      const { categoryId } = req.params;
      const articles = await Article.find({ category: categoryId })
        .sort({ publishDate: -1 })
        .populate('author', 'username')
        .populate('category', 'name');

      res.json({
        success: true,
        articles
      });
    } catch (error) {
      debug.error('Error getting articles by category', error);
      next(error);
    }
  },

  // More custom controller methods...
};

module.exports = articleController;
```

## Authentication Customization

### Configuring User Roles

Configure user roles based on your website's requirements:

```javascript
// backend/models/User.js
const UserSchema = new mongoose.Schema({
  // Other fields...
  role: {
    type: String,
    enum: ['super-admin', 'editor', 'author', 'customer'], // Add custom roles
    default: 'customer'
  },
  // Other fields...
});
```

### Updating Authentication Middleware

Update the authentication middleware to handle your custom roles:

```javascript
// backend/middleware/auth.js
exports.isAuthor = (req, res, next) => {
  if (req.user && (req.user.role === 'author' || req.user.role === 'editor' || req.user.role === 'super-admin')) {
    return next();
  }

  debug.log('Permission denied - author role required');
  return res.status(403).json({
    success: false,
    error: {
      code: 'PERMISSION_DENIED',
      message: 'Permission denied'
    }
  });
};

exports.isCustomer = (req, res, next) => {
  if (req.user && req.user.role === 'customer') {
    return next();
  }

  debug.log('Permission denied - customer role required');
  return res.status(403).json({
    success: false,
    error: {
      code: 'PERMISSION_DENIED',
      message: 'Permission denied'
    }
  });
};
```

## Example Website Concepts

### Blog/News Website

**Content Types:**
- Articles
- Categories
- Tags
- Comments
- Authors

**Key Features:**
- Article listing with categories and tags
- Featured articles
- Article search
- Comments system
- Author profiles

### E-commerce Website

**Content Types:**
- Products
- Categories
- Orders
- Customers
- Reviews

**Key Features:**
- Product catalog with categories
- Product search and filtering
- Shopping cart
- Checkout process
- Order tracking
- Customer accounts

### Portfolio Website

**Content Types:**
- Projects
- Skills
- Testimonials
- Services

**Key Features:**
- Project showcase
- Skills visualization
- Testimonials carousel
- Contact form
- Resume download

### Event Website

**Content Types:**
- Events
- Speakers
- Venues
- Registrations

**Key Features:**
- Event calendar
- Event registration
- Speaker profiles
- Venue information
- Event search and filtering

## Conclusion

By following this customization guide, you can adapt the Web Project Template to create various types of websites while maintaining a consistent architecture and code quality. The template's flexible design allows you to focus on the unique aspects of your website concept while leveraging the solid foundation provided by the template.
