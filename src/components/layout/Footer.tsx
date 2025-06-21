
import React from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Phone, MapPin, ExternalLink, Rss, Calendar, Gift, Image as ImageIcon, Search as SearchIcon, HelpCircle, Facebook, Twitter, Instagram, Info, Loader } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { locationsApi } from "@/services/api";

export function Footer() {
  const currentYear = new Date().getFullYear();

  // Fetch locations from API to get main office
  const { data: locationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll({ active: true }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Find the main office location
  const mainOffice = React.useMemo(() => {
    if (!locationsData?.locations) return null;
    return locationsData.locations.find(loc => loc.isMainOffice) || locationsData.locations[0];
  }, [locationsData]);

  // Show placeholder content while loading
  if (isLoadingLocations) {
    return (
      <footer className="bg-teal-50 border-t border-teal-100 py-10 mt-12">
        <div className="container mx-auto px-4 text-center text-teal-700">
          <p>Loading footer content...</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-teal-50 border-t border-teal-100 py-10 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-bold text-xl mb-4 text-teal-800">Charity Info</h3>
            <p className="text-teal-700 mb-4">
              Supporting communities and making a difference
            </p>

            <div className="space-y-2">
              {mainOffice?.phone && (
                <div className="flex items-center text-teal-700 hover:text-teal-900 transition-colors">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{mainOffice.phone}</span>
                </div>
              )}
              {mainOffice?.email && (
                <div className="flex items-center text-teal-700 hover:text-teal-900 transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  <a href={`mailto:${mainOffice.email}`} className="hover:text-teal-900">{mainOffice.email}</a>
                </div>
              )}
              {mainOffice?.address && (
                <div className="flex items-center text-teal-700 hover:text-teal-900 transition-colors">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{mainOffice.address}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-teal-800">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-teal-700 hover:text-teal-900 flex items-center transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/news"
                  className="text-teal-700 hover:text-teal-900 flex items-center transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Rss className="h-4 w-4 mr-2" />
                  News
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-teal-700 hover:text-teal-900 flex items-center transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-teal-700 hover:text-teal-900 flex items-center transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Info className="h-4 w-4 mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-teal-700 hover:text-teal-900 flex items-center transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/search"
                  className="text-teal-700 hover:text-teal-900 flex items-center transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-teal-800">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/faq"
                  className="text-teal-700 hover:text-teal-900 flex items-center transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/donate"
                  className="text-teal-700 hover:text-teal-900 flex items-center transition-colors"
                  onClick={() => window.scrollTo(0, 0)}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  How to Donate
                </Link>
              </li>

            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-teal-100 text-center text-teal-700">
          <p>
            &copy; {currentYear} Charity Info. All rights reserved.
          </p>
          <p className="mt-2 flex items-center justify-center text-sm">
            Built with{" "}
            <Heart className="h-4 w-4 mx-1 text-pink-500 fill-pink-500" /> for charitable causes
          </p>
        </div>
      </div>
    </footer>
  );
}
