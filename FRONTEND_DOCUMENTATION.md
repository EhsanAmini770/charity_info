# Frontend Documentation

## Overview

The frontend of the Charity Information Website is built with React, TypeScript, and Tailwind CSS. It provides a modern, responsive user interface for both visitors and administrators.

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

#### Public Pages

- `HomePage`: Landing page with hero section, latest news, and gallery
- `NewsPage`: News listing with search and pagination
- `NewsDetailPage`: Single news article with attachments
- `GalleryPage`: Gallery albums listing
- `GalleryAlbumPage`: Single gallery album with images
- `AboutPage`: About the organization with team members
- `ContactPage`: Contact form and office locations
- `FAQPage`: Frequently asked questions

#### Admin Pages

- `AdminDashboard`: Overview with statistics and recent activity
- `AdminNewsListPage`: Manage news articles
- `AdminNewsEditPage`: Create/edit news articles
- `AdminGalleryPage`: Manage gallery albums
- `AdminGalleryEditPage`: Create/edit gallery albums
- `AdminUsersPage`: Manage system users (super-admin only)
- `AdminFaqListPage`: Manage FAQs
- `AdminFaqEditPage`: Create/edit FAQs
- `AdminAboutPage`: Manage about page content
- `AdminTeamPage`: Manage team members
- `AdminLocationsPage`: Manage office locations
- `AdminPartnersPage`: Manage partners/sponsors
- `AdminContactPage`: View contact messages
- `AdminSubscribersPage`: Manage newsletter subscribers

## Authentication and Authorization

The application uses JWT-based authentication with role-based access control:

- `AuthContext`: Provides authentication state and methods
- `ProtectedRoute`: Route component that requires authentication
- `useAuth`: Hook for accessing authentication context

Roles:
- `super-admin`: Full access to all features
- `editor`: Access to content management (news, gallery, FAQs)

## API Integration

The application uses Axios for API requests and React Query for data fetching, caching, and state management:

- `api.ts`: Axios instance with interceptors for authentication and error handling
- `useQuery`: For fetching and caching data
- `useMutation`: For creating, updating, and deleting data

## Form Handling

Forms are built using React Hook Form with Zod for validation:

- `Form`: Base form component
- `FormField`: Form field with label and error message
- `FormItem`: Container for form fields
- `FormLabel`: Form field label
- `FormControl`: Form field control
- `FormDescription`: Form field description
- `FormMessage`: Form field error message

## File Uploads

File uploads are handled using the following components:

- `FileUpload`: Single file upload component
- `MultiFileUpload`: Multiple file upload component
- `ImageUpload`: Image upload with preview

## Analytics Visualization

The admin dashboard includes analytics visualizations built with Recharts:

- `VisitChart`: Line chart for visitor statistics
- `VisitorStats`: Cards showing visitor metrics

## Responsive Design

The application is fully responsive and works on all device sizes:

- Mobile-first approach with Tailwind CSS
- Responsive navigation menu
- Adaptive layouts for different screen sizes

## Theme and Styling

The application uses a customized theme based on Tailwind CSS:

- Custom color palette
- Typography system
- Spacing and sizing scales
- Component variants

## Error Handling

The application includes comprehensive error handling:

- API error handling with toast notifications
- Form validation errors
- Fallback UI for failed components
- 404 page for not found routes

## Performance Optimization

The application includes several performance optimizations:

- Code splitting with React.lazy and Suspense
- Memoization of expensive components
- Optimized image loading
- React Query caching

## Accessibility

The application follows accessibility best practices:

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Color contrast

## Browser Support

The application supports all modern browsers:

- Chrome
- Firefox
- Safari
- Edge

## Environment Variables

```
VITE_API_URL=http://localhost:5000  # Backend API URL
```

## Running the Application

### Development Mode

```
npm run dev
```

### Production Build

```
npm run build
```

### Preview Production Build

```
npm run preview
```
