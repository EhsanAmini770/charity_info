import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";

// Import route components
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
