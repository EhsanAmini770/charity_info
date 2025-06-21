import React, { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { LoadingFallback } from "./LoadingFallback";

// Eagerly loaded components (critical for initial render)
import HomePage from "@/pages/public/HomePage";
import LoginPage from "@/pages/auth/LoginPage";
import ErrorTestPage from "@/pages/public/ErrorTestPage";

// Lazily loaded components (loaded on demand)
const NewsPage = lazy(() => import("@/pages/public/NewsPage").then(module => ({ default: module.NewsPage })));
const NewsDetailPage = lazy(() => import("@/pages/public/NewsDetailPage").then(module => ({ default: module.NewsDetailPage })));
const GalleryPage = lazy(() => import("@/pages/public/GalleryPage").then(module => ({ default: module.GalleryPage })));
const GalleryDetailPage = lazy(() => import("@/pages/public/GalleryDetailPage").then(module => ({ default: module.GalleryDetailPage })));
const SearchPage = lazy(() => import("@/pages/public/SearchPage").then(module => ({ default: module.SearchPage })));
const FAQPage = lazy(() => import("@/pages/public/FAQPage"));
const AboutPage = lazy(() => import("@/pages/public/AboutPage").then(module => ({ default: module.AboutPage })));
const ContactPage = lazy(() => import("@/pages/public/ContactPage").then(module => ({ default: module.ContactPage })));
const DonatePage = lazy(() => import("@/pages/public/DonatePage").then(module => ({ default: module.DonatePage })));

/**
 * Public routes configuration
 */
export const PublicRoutes = (
  <Route element={<MainLayout />}>
    <Route path="/" element={<HomePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/error-test" element={<ErrorTestPage />} />

    {/* Lazy-loaded public routes */}
    <Route path="/news" element={
      <Suspense fallback={<LoadingFallback />}>
        <NewsPage />
      </Suspense>
    } />
    <Route path="/news/:slug" element={
      <Suspense fallback={<LoadingFallback />}>
        <NewsDetailPage />
      </Suspense>
    } />
    <Route path="/gallery" element={
      <Suspense fallback={<LoadingFallback />}>
        <GalleryPage />
      </Suspense>
    } />
    <Route path="/gallery/:slug" element={
      <Suspense fallback={<LoadingFallback />}>
        <GalleryDetailPage />
      </Suspense>
    } />
    <Route path="/search" element={
      <Suspense fallback={<LoadingFallback />}>
        <SearchPage />
      </Suspense>
    } />
    <Route path="/faq" element={
      <Suspense fallback={<LoadingFallback />}>
        <FAQPage />
      </Suspense>
    } />
    <Route path="/donate" element={
      <Suspense fallback={<LoadingFallback />}>
        <DonatePage />
      </Suspense>
    } />
    <Route path="/about" element={
      <Suspense fallback={<LoadingFallback />}>
        <AboutPage />
      </Suspense>
    } />
    {/* This route is commented out because the component doesn't exist yet */}
    {/* <Route path="/team" element={
      <Suspense fallback={<LoadingFallback />}>
        <TeamPage />
      </Suspense>
    } /> */}
    <Route path="/contact" element={
      <Suspense fallback={<LoadingFallback />}>
        <ContactPage />
      </Suspense>
    } />
    {/* This route is commented out because the component doesn't exist yet */}
    {/* <Route path="/locations" element={
      <Suspense fallback={<LoadingFallback />}>
        <LocationsPage />
      </Suspense>
    } /> */}
  </Route>
);
