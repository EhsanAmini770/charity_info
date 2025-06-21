# Charity Information Website

A comprehensive information website for charity organizations with content management, gallery, news, and visitor analytics.

## Project Overview

This project is a full-stack web application designed for charity organizations to showcase their work, share news, display image galleries, and manage content. The application consists of a React frontend and a Node.js/Express backend with MongoDB for data storage.

### Key Features

- **Content Management**: News articles, gallery albums, FAQs, team members, and office locations
- **User Management**: Role-based access control with super-admin and editor roles
- **Visitor Analytics**: Track visitor statistics and real-time online user count
- **Responsive Design**: Mobile-friendly interface with modern UI components
- **Image Gallery**: Display images in a modern, user-friendly format
- **Multilingual Support**: Turkish language support with slugify

## Project Structure

The project is organized into two main directories:

- `backend/`: Node.js/Express API server with MongoDB
- `src/`: React frontend application with TypeScript and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone <repository-url>
   cd charity-info-website
   ```

2. Install backend dependencies
   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ..
   npm install
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/charity_info
   JWT_SECRET=your_jwt_secret_key_here
   SESSION_SECRET=your_session_secret_key_here
   NODE_ENV=development
   SITE_URL=http://localhost:5000
   ```

### Running the Application

1. Start the backend server
   ```
   cd backend
   npm run dev
   ```

2. In a separate terminal, start the frontend development server
   ```
   npm run dev
   ```

3. Access the application at `http://localhost:3000`

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.io
- Multer (file uploads)
- CSRF Protection

### Frontend
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query
- React Router
- Axios
- Recharts (for analytics)
- Embla Carousel

## Documentation

For detailed documentation, please refer to:

- [Backend Documentation](./backend/DOCUMENTATION.md)
- [Frontend Documentation](./FRONTEND_DOCUMENTATION.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
