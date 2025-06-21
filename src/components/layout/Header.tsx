
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Menu, X, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-charity-muted border-b border-gray-200 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between bg-charity-muted">
        <div className="flex items-center">
          <Link to="/" className="font-bold text-2xl text-primary mr-4">
            Charity Info
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/news" className="text-gray-700 hover:text-primary font-medium">
            News
          </Link>
          <Link to="/gallery" className="text-gray-700 hover:text-primary font-medium">
            Gallery
          </Link>
          <Link to="/about" className="text-gray-700 hover:text-primary font-medium">
            About Us
          </Link>
          <Link to="/contact" className="text-gray-700 hover:text-primary font-medium">
            Contact
          </Link>
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/admin"
                className="text-gray-700 hover:text-primary font-medium"
              >
                Dashboard
              </Link>
              <Button variant="outline" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link to="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </nav>

        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Backdrop overlay when mobile menu is open - moved here for proper z-index layering */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-4/5 max-w-sm bg-charity-muted pt-16 px-4 flex flex-col md:hidden transition-transform duration-300 ease-in-out shadow-xl border-l border-gray-200",
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        )}
        style={{ boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)' }}
      >
        {/* Close button for mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <X className="h-6 w-6" />
        </Button>
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </form>
        <nav className="flex flex-col space-y-4 mt-4">
          <Link
            to="/"
            className="text-lg font-medium text-gray-800 hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/news"
            className="text-lg font-medium text-gray-800 hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            News
          </Link>
          <Link
            to="/gallery"
            className="text-lg font-medium text-gray-800 hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Gallery
          </Link>
          <Link
            to="/about"
            className="text-lg font-medium text-gray-800 hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-lg font-medium text-gray-800 hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/admin"
                className="text-lg font-medium text-gray-800 hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Button
                variant="outline"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Button asChild className="w-full">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </nav>
      </div>

      {/* Backdrop overlay moved to before the mobile menu */}
    </header>
  );
}
