import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { partnersApi } from '@/services/api';
import { Loader } from 'lucide-react';

interface PartnersSectionProps {
  className?: string;
}

const PartnersSection: React.FC<PartnersSectionProps> = ({ className }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['partners'],
    queryFn: () => partnersApi.getAll({ active: true, featured: true }),
  });

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <Loader className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !data?.partners || data.partners.length === 0) {
    return null; // Don't show the section if there are no partners
  }

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-teal-800">Our Partners & Sponsors</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 items-center justify-items-center">
          {data.partners.map((partner) => (
            <div key={partner._id} className="flex flex-col items-center">
              <a
                href={partner.website || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-32 w-full"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${partner.logo}`}
                  alt={`${partner.name} logo`}
                  className="max-h-28 max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </a>
              <p className="mt-2 text-sm font-medium text-gray-700 text-center">{partner.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
