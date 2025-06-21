
import React from 'react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-charity-muted to-charity-light">
      <div className="text-center px-4 py-12 max-w-4xl mx-auto">
        <div className="animate-fadeIn">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-charity-primary">
            Welcome to Charity Info Website
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            Your trusted resource for information about charitable organizations and initiatives.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="/news"
              className="bg-charity-primary hover:bg-charity-secondary text-white font-medium py-3 px-8 rounded-md transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg"
            >
              Browse News
            </a>
            <a
              href="/gallery"
              className="bg-charity-accent hover:bg-charity-accent/80 text-charity-dark font-medium py-3 px-8 rounded-md transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg"
            >
              View Gallery
            </a>
            <a
              href="/about"
              className="bg-white hover:bg-gray-100 text-charity-dark border border-gray-200 font-medium py-3 px-8 rounded-md transition-all transform hover:-translate-y-1 shadow-md hover:shadow-lg"
            >
              About Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
