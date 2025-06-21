import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { aboutApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { TeamSection } from '@/components/about/TeamSection';

export function AboutPage() {
  const organizationName = 'Charity Welcome Hub';

  // Fetch about page content from the backend
  const { data, isLoading, error } = useQuery({
    queryKey: ['aboutContent'],
    queryFn: aboutApi.getContent,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Default content to use if backend data is not available
  const aboutContent = data?.aboutContent || {
    mission: 'Our mission is to provide support and resources to those in need within our community.',
    vision: 'We believe in creating a welcoming environment where everyone can find the help they need, regardless of their background or circumstances.',
    foundedYear: '2010',
    volunteersCount: '50',
    peopleHelpedCount: '10,000',
    communitiesCount: '5'
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About {organizationName}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="col-span-1 md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-charity-primary">Our Mission</h2>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <>
                <p className="text-gray-700 mb-4">{aboutContent.mission}</p>
                <p className="text-gray-700 mb-4">{aboutContent.vision}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-charity-primary">Quick Facts</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="bg-charity-primary/10 text-charity-primary rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span>Founded in {aboutContent.foundedYear || '2010'}</span>
              </li>
              <li className="flex items-start">
                <span className="bg-charity-primary/10 text-charity-primary rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span>Over {aboutContent.volunteersCount || '50'} dedicated volunteers</span>
              </li>
              <li className="flex items-start">
                <span className="bg-charity-primary/10 text-charity-primary rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span>Helped over {aboutContent.peopleHelpedCount || '10,000'} individuals</span>
              </li>
              <li className="flex items-start">
                <span className="bg-charity-primary/10 text-charity-primary rounded-full p-1 mr-2 mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </span>
                <span>Active in {aboutContent.communitiesCount || '5'} local communities</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-charity-primary">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-charity-primary/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charity-primary">
                    <path d="M18 8a6 6 0 0 0-6-6 6 6 0 0 0-6 6c0 7 6 13 6 13s6-6 6-13z"></path>
                    <circle cx="12" cy="8" r="2"></circle>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Compassion</h3>
                <p className="text-gray-600">We approach every individual with empathy and understanding, recognizing their unique circumstances and needs.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-charity-primary/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charity-primary">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                    <path d="m7 9 3 3-3 3"></path>
                    <path d="M14 9h3v6h-3"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Integrity</h3>
                <p className="text-gray-600">We maintain the highest standards of honesty and transparency in all our operations and relationships.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="bg-charity-primary/10 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-charity-primary">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Community</h3>
                <p className="text-gray-600">We believe in the power of community and work together to create positive change and lasting impact.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-charity-primary">Get Involved</h2>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-700 mb-4">
              There are many ways to support our mission and make a difference in our community.
              Whether you're interested in volunteering your time, making a donation, or partnering
              with us, we welcome your involvement.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">

              <Link to="/contact" className="bg-white border border-charity-primary text-charity-primary hover:bg-charity-primary/10 font-medium py-2 px-6 rounded-md transition-colors duration-200">
                Contact Us
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the dedicated individuals who make our mission possible.
            </p>
          </div>
          <TeamSection />
        </div>
      </div>
    </div>
  );
}

export default AboutPage;
