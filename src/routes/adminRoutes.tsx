import React, { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LoadingFallback } from "./LoadingFallback";

// Admin components
const AdminLayout = lazy(() => import("@/components/layout/AdminLayout").then(module => ({ default: module.AdminLayout })));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard").then(module => ({ default: module.AdminDashboard })));

// News management
const AdminNewsListPage = lazy(() => import("@/pages/admin/news/AdminNewsListPage").then(module => ({ default: module.AdminNewsListPage })));
const AdminNewsEditPage = lazy(() => import("@/pages/admin/news/AdminNewsEditPage").then(module => ({ default: module.AdminNewsEditPage })));
const AdminNewsCreatePage = lazy(() => import("@/pages/admin/news/AdminNewsCreatePage").then(module => ({ default: module.AdminNewsCreatePage })));

// Gallery management
const AdminGalleryListPage = lazy(() => import("@/pages/admin/gallery/AdminGalleryListPage").then(module => ({ default: module.AdminGalleryListPage })));
const AdminGalleryEditPage = lazy(() => import("@/pages/admin/gallery/AdminGalleryEditPage").then(module => ({ default: module.AdminGalleryEditPage })));
const AdminGalleryCreatePage = lazy(() => import("@/pages/admin/gallery/AdminGalleryCreatePage").then(module => ({ default: module.AdminGalleryCreatePage })));

// FAQ management
const AdminFaqListPage = lazy(() => import("@/pages/admin/faq/AdminFaqListPage").then(module => ({ default: module.AdminFaqListPage })));
const AdminFaqEditPage = lazy(() => import("@/pages/admin/faq/AdminFaqEditPage").then(module => ({ default: module.AdminFaqEditPage })));
const AdminFaqCreatePage = lazy(() => import("@/pages/admin/faq/AdminFaqCreatePage").then(module => ({ default: module.AdminFaqCreatePage })));

// Team management
const AdminTeamListPage = lazy(() => import("@/pages/admin/team/AdminTeamListPage").then(module => ({ default: module.AdminTeamListPage })));
const AdminTeamEditPage = lazy(() => import("@/pages/admin/team/AdminTeamEditPage").then(module => ({ default: module.AdminTeamEditPage })));
const AdminTeamCreatePage = lazy(() => import("@/pages/admin/team/AdminTeamCreatePage").then(module => ({ default: module.AdminTeamCreatePage })));

// Location management
const AdminLocationListPage = lazy(() => import("@/pages/admin/locations/AdminLocationListPage").then(module => ({ default: module.AdminLocationListPage })));
const AdminLocationEditPage = lazy(() => import("@/pages/admin/locations/AdminLocationEditPage").then(module => ({ default: module.AdminLocationEditPage })));
const AdminLocationCreatePage = lazy(() => import("@/pages/admin/locations/AdminLocationCreatePage").then(module => ({ default: module.AdminLocationCreatePage })));

// Partner management
const AdminPartnerListPage = lazy(() => import("@/pages/admin/partners/AdminPartnerListPage").then(module => ({ default: module.AdminPartnerListPage })));
const AdminPartnerEditPage = lazy(() => import("@/pages/admin/partners/AdminPartnerEditPage").then(module => ({ default: module.AdminPartnerEditPage })));
const AdminPartnerCreatePage = lazy(() => import("@/pages/admin/partners/AdminPartnerCreatePage").then(module => ({ default: module.AdminPartnerCreatePage })));

// User management
const AdminUserListPage = lazy(() => import("@/pages/admin/users/AdminUserListPage").then(module => ({ default: module.AdminUserListPage })));
const AdminUserEditPage = lazy(() => import("@/pages/admin/users/AdminUserEditPage").then(module => ({ default: module.AdminUserEditPage })));
const AdminUserCreatePage = lazy(() => import("@/pages/admin/users/AdminUserCreatePage").then(module => ({ default: module.AdminUserCreatePage })));

// Contact messages
const AdminContactListPage = lazy(() => import("@/pages/admin/contact/AdminContactListPage").then(module => ({ default: module.AdminContactListPage })));
const AdminContactViewPage = lazy(() => import("@/pages/admin/contact/AdminContactViewPage").then(module => ({ default: module.AdminContactViewPage })));

// Settings
const AdminAboutPage = lazy(() => import("@/pages/admin/settings/AdminAboutPage"));

// Subscribers
const AdminSubscribersListPage = lazy(() => import("@/pages/admin/subscribers/AdminSubscribersListPage").then(module => ({ default: module.AdminSubscribersListPage })));

/**
 * Admin routes configuration
 */
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

    {/* News Management */}
    <Route path="news">
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminNewsListPage />
        </Suspense>
      } />
      <Route path="create" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminNewsCreatePage />
        </Suspense>
      } />
      <Route path="edit/:id" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminNewsEditPage />
        </Suspense>
      } />
    </Route>

    {/* Gallery Management */}
    <Route path="gallery">
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminGalleryListPage />
        </Suspense>
      } />
      <Route path="create" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminGalleryCreatePage />
        </Suspense>
      } />
      <Route path="edit/:id" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminGalleryEditPage />
        </Suspense>
      } />
    </Route>

    {/* FAQ Management */}
    <Route path="faqs">
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminFaqListPage />
        </Suspense>
      } />
      <Route path="create" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminFaqCreatePage />
        </Suspense>
      } />
      <Route path="edit/:id" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminFaqEditPage />
        </Suspense>
      } />
    </Route>

    {/* Team Management */}
    <Route path="team">
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminTeamListPage />
        </Suspense>
      } />
      <Route path="create" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminTeamCreatePage />
        </Suspense>
      } />
      <Route path="edit/:id" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminTeamEditPage />
        </Suspense>
      } />
    </Route>

    {/* Location Management */}
    <Route path="locations">
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLocationListPage />
        </Suspense>
      } />
      <Route path="create" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLocationCreatePage />
        </Suspense>
      } />
      <Route path="edit/:id" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminLocationEditPage />
        </Suspense>
      } />
    </Route>

    {/* Partner Management */}
    <Route path="partners">
      <Route index element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminPartnerListPage />
        </Suspense>
      } />
      <Route path="create" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminPartnerCreatePage />
        </Suspense>
      } />
      <Route path="edit/:id" element={
        <Suspense fallback={<LoadingFallback />}>
          <AdminPartnerEditPage />
        </Suspense>
      } />
    </Route>

    {/* User Management (Super-admin only) */}
    <Route path="users">
      <Route index element={
        <ProtectedRoute requiredRole="super-admin">
          <Suspense fallback={<LoadingFallback />}>
            <AdminUserListPage />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="create" element={
        <ProtectedRoute requiredRole="super-admin">
          <Suspense fallback={<LoadingFallback />}>
            <AdminUserCreatePage />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path="edit/:id" element={
        <ProtectedRoute requiredRole="super-admin">
          <Suspense fallback={<LoadingFallback />}>
            <AdminUserEditPage />
          </Suspense>
        </ProtectedRoute>
      } />
    </Route>

    {/* Contact Messages (Super-admin only) */}
    <Route path="contact">
      <Route index element={
        <ProtectedRoute requiredRole="super-admin">
          <Suspense fallback={<LoadingFallback />}>
            <AdminContactListPage />
          </Suspense>
        </ProtectedRoute>
      } />
      <Route path=":id" element={
        <ProtectedRoute requiredRole="super-admin">
          <Suspense fallback={<LoadingFallback />}>
            <AdminContactViewPage />
          </Suspense>
        </ProtectedRoute>
      } />
    </Route>
    

    {/* About Page Management (Super-admin only) */}
    <Route path="about" element={
      <ProtectedRoute requiredRole="super-admin">
        <Suspense fallback={<LoadingFallback />}>
          <AdminAboutPage />
        </Suspense>
      </ProtectedRoute>
    } />

    {/* Subscribers Management (Super-admin only) */}
    <Route path="subscribers" element={
      <ProtectedRoute requiredRole="super-admin">
        <Suspense fallback={<LoadingFallback />}>
          <AdminSubscribersListPage />
        </Suspense>
      </ProtectedRoute>
    } />
  </Route>
);
