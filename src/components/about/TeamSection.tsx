import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { teamApi, TeamMemberItem } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Facebook, Linkedin, Mail, Phone, Twitter, UserCircle } from 'lucide-react';
import API_CONFIG from '@/config/api';

export function TeamSection() {
  // Fetch team members
  const { data, isLoading, error } = useQuery({
    queryKey: ['team-members-public'],
    queryFn: () => teamApi.getAll({ active: true }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="aspect-square relative">
              <Skeleton className="h-full w-full absolute" />
            </div>
            <CardContent className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Unable to load team members. Please try again later.</p>
      </div>
    );
  }

  const teamMembers = data?.teamMembers || [];

  if (teamMembers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No team members to display.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {teamMembers.map((member) => (
        <TeamMemberCard key={member._id} member={member} />
      ))}
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMemberItem }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="aspect-square relative bg-gray-100">
        {member.photo ? (
          <img
            src={`${API_CONFIG.baseURL}${member.photo}`}
            alt={member.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircle className="h-24 w-24 text-gray-300" />
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
        <p className="text-sm font-medium text-teal-600 mb-3">{member.position}</p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-4">{member.bio}</p>
        
        <div className="flex flex-wrap gap-3 mt-4">
          {member.email && (
            <a 
              href={`mailto:${member.email}`}
              className="text-gray-500 hover:text-teal-600 transition-colors"
              aria-label={`Email ${member.name}`}
            >
              <Mail className="h-5 w-5" />
            </a>
          )}
          
          {member.phone && (
            <a 
              href={`tel:${member.phone}`}
              className="text-gray-500 hover:text-teal-600 transition-colors"
              aria-label={`Call ${member.name}`}
            >
              <Phone className="h-5 w-5" />
            </a>
          )}
          
          {member.socialLinks?.linkedin && (
            <a 
              href={member.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-600 transition-colors"
              aria-label={`${member.name}'s LinkedIn profile`}
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          
          {member.socialLinks?.twitter && (
            <a 
              href={member.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-400 transition-colors"
              aria-label={`${member.name}'s Twitter profile`}
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          
          {member.socialLinks?.facebook && (
            <a 
              href={member.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-800 transition-colors"
              aria-label={`${member.name}'s Facebook profile`}
            >
              <Facebook className="h-5 w-5" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
