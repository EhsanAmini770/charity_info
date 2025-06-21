# Frontend Architecture

## Overview

The frontend of the Web Project Template is built with React, TypeScript, and Tailwind CSS. It provides a modern, responsive user interface that can be customized for various website concepts. The architecture is designed to be flexible, modular, and easy to adapt to different needs.

## Architecture

- **Framework**: React with TypeScript
- **Routing**: React Router v6
- **State Management**: React Query for server state, React Context for global state
- **Styling**: Tailwind CSS with shadcn/ui components
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization
- **Image Carousel**: Embla Carousel

## Directory Structure

```
src/
├── assets/          # Static assets (images, fonts)
├── components/      # Reusable UI components
│   ├── layout/      # Layout components (header, footer, etc.)
│   └── ui/          # UI components from shadcn/ui
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions and constants
├── pages/           # Page components
│   ├── admin/       # Admin dashboard pages
│   └── public/      # Public-facing pages
├── services/        # API service functions
├── styles/          # Global styles and Tailwind config
├── types/           # TypeScript type definitions
├── App.tsx          # Main application component
├── Routes.tsx       # Application routes
└── main.tsx         # Application entry point
```

## Key Components

### Layout Components

- `RootLayout`: Main layout for public pages
- `AdminLayout`: Layout for admin dashboard with sidebar navigation
- `Header`: Site header with navigation menu
- `Footer`: Site footer with contact information
- `Sidebar`: Admin dashboard sidebar navigation

### UI Components

The application uses shadcn/ui components, which are built on top of Radix UI and styled with Tailwind CSS. Key components include:

- `Button`: Various button styles
- `Card`: Card container with header, content, and footer
- `Dialog`: Modal dialogs
- `Form`: Form components with validation
- `Table`: Data tables with sorting and pagination
- `Tabs`: Tabbed interface
- `Toast`: Notification system

### Page Components

#### Core Page Templates

These page templates can be customized for different website concepts:

- `HomePage`: Customizable landing page with sections for featured content
- `ContentListPage`: Generic list page for any content type (articles, products, events, etc.)
- `ContentDetailPage`: Generic detail page for any content type
- `MediaGalleryPage`: Flexible gallery for images, videos, or other media
- `AboutPage`: Customizable about page template
- `ContactPage`: Contact form and location information
- `SearchPage`: Universal search functionality
- `AuthPages`: Login, registration, password reset pages

#### Admin Page Templates

These admin page templates can be adapted for managing different content types:

- `AdminDashboard`: Overview with statistics and recent activity
- `AdminContentListPage`: Generic list page for managing any content type
- `AdminContentEditPage`: Generic edit page for any content type
- `AdminMediaPage`: Manage media files (images, videos, etc.)
- `AdminUsersPage`: Manage system users
- `AdminSettingsPage`: Configure website settings
- `AdminAnalyticsPage`: View website analytics

## Routing

The application uses React Router v6 for routing. The routes are defined in the `Routes.tsx` file and organized into public and admin routes:

```tsx
// Routes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { PublicRoutes } from "./routes/publicRoutes";
import { AdminRoutes } from "./routes/adminRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      {PublicRoutes}

      {/* Admin Routes */}
      {AdminRoutes}

      {/* Handle dashboard redirect (for backward compatibility) */}
      <Route path="/dashboard" element={<Navigate to="/admin" replace />} />

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
```

## State Management

### Server State

The application uses React Query for managing server state:

```tsx
// Example of using React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['albums'],
  queryFn: galleryApi.getAllAlbums,
});
```

### Global State

The application uses React Context for global state management:

```tsx
// Example of AuthContext
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
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

  // Login function
  const login = async (username: string, password: string) => {
    // Implementation...
  };

  // Logout function
  const logout = async () => {
    // Implementation...
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

## Form Handling

The application uses React Hook Form with Zod for form validation:

```tsx
// Example of form validation with Zod
const albumSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().optional(),
});

type AlbumFormValues = z.infer<typeof albumSchema>;

// Form component
const form = useForm<AlbumFormValues>({
  resolver: zodResolver(albumSchema),
  defaultValues: {
    title: "",
    description: "",
  },
});
```

## API Integration

The application uses Axios for API requests:

```tsx
// Example of API service
export const galleryApi = {
  getAllAlbums: async () => {
    const response = await api.get('/api/gallery/albums');
    return response.data;
  },
  getAlbumBySlug: async (slug: string) => {
    const response = await api.get(`/api/gallery/albums/${slug}`);
    return response.data;
  },
  // More methods...
};
```

## Error Handling

The application includes comprehensive error handling:

- `GlobalErrorHandler`: Top-level error boundary
- `ErrorBoundary`: Component-level error boundary
- `ApiError`: Component for displaying API errors
- Error logging service

## Performance Optimization

The application includes several performance optimizations:

- Code splitting with React.lazy and Suspense
- Memoization of expensive components
- Optimized image loading
- React Query caching

## Responsive Design

The application is fully responsive and works on all device sizes:

- Mobile-first approach with Tailwind CSS
- Responsive navigation menu
- Adaptive layouts for different screen sizes

## Accessibility

The application follows accessibility best practices:

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Color contrast

## Reusable Patterns

### Component Structure

Components follow a consistent structure:

```tsx
// Example component structure
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'wide';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
          // Variant styles
          variant === 'default' && "bg-charity-primary text-white hover:bg-charity-secondary",
          variant === 'destructive' && "bg-charity-destructive text-white hover:bg-charity-destructive/90",
          // Size styles
          size === 'default' && "h-10 px-4 py-2",
          size === 'sm' && "h-9 rounded-md px-3 py-1.5 text-xs",
          // Additional classes
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
```

### Custom Hooks

The application uses custom hooks for reusable logic:

```tsx
// Example custom hook
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
```

## Environment Variables

```
VITE_API_URL=http://localhost:5000  # Backend API URL
```

## Build and Deployment

The application uses Vite for building and deploying:

```json
// package.json scripts
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "build:dev": "vite build --mode development",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## Theming System

The template includes a flexible theming system that makes it easy to customize the look and feel of the website:

### Theme Configuration

The theme is configured in `tailwind.config.ts` and can be customized for different website concepts:

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

### Theme Variants

The template includes several pre-configured theme variants that can be used as starting points:

- **Corporate**: Professional, clean design with blue and gray colors
- **E-commerce**: Bold, attention-grabbing design with strong call-to-action colors
- **Creative**: Vibrant, artistic design with unique typography and colors
- **Minimal**: Simple, elegant design with plenty of whitespace
- **Dark Mode**: Dark-themed version of any of the above variants

## Layout System

The template includes a flexible layout system that can be customized for different website concepts:

### Layout Components

- `StandardLayout`: Basic layout with header, main content, and footer
- `SidebarLayout`: Layout with sidebar navigation and main content
- `LandingLayout`: Special layout for landing pages with full-width sections
- `DashboardLayout`: Layout for admin dashboard with sidebar and top navigation

### Layout Customization

Layouts can be customized by modifying the following components:

- `Header`: Customize the header with different navigation styles
- `Footer`: Customize the footer with different sections and layouts
- `Sidebar`: Customize the sidebar with different navigation styles
- `Hero`: Customize the hero section for landing pages

## Extending the Frontend

To adapt the frontend for a new website concept:

1. Choose or create a theme variant in `tailwind.config.ts` to match the website's branding
2. Select appropriate layout components for the website's structure
3. Customize the page templates to fit the website's content needs
4. Update the API services to match the backend endpoints
5. Add new components and pages as needed

## Best Practices

- Use TypeScript for type safety
- Follow the component structure for consistency
- Use React Query for server state management
- Use React Context for global state
- Use React Hook Form with Zod for form validation
- Use shadcn/ui components for UI consistency
- Follow accessibility best practices
- Optimize performance with code splitting and memoization
