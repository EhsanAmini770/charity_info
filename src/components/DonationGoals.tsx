import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Heart, Users, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface DonationGoalsProps {
  className?: string;
}

// Sample data for charitable initiatives
const sampleCampaigns = [
  {
    _id: '1',
    title: 'Community Education Program',
    description: 'Supporting educational initiatives for underprivileged children in our community.',
    goalAmount: 50000,
    currentAmount: 35000,
    donorCount: 120,
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    slug: 'community-education'
  },
  {
    _id: '2',
    title: 'Healthcare Access Initiative',
    description: 'Providing essential healthcare services to those who need it most.',
    goalAmount: 75000,
    currentAmount: 25000,
    donorCount: 85,
    endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    slug: 'healthcare-access'
  },
  {
    _id: '3',
    title: 'Environmental Conservation Project',
    description: 'Working to protect and preserve our local natural resources and wildlife.',
    goalAmount: 30000,
    currentAmount: 18000,
    donorCount: 65,
    endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    slug: 'environmental-conservation'
  }
];

const DonationGoals: React.FC<DonationGoalsProps> = ({ className }) => {

  return (
    <section className={`py-16 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4 text-teal-800">Current Charitable Initiatives</h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          These are the current initiatives we're tracking. Visit our How to Donate page to learn more about supporting these causes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleCampaigns.map((campaign) => {
            // Calculate progress percentage
            const progressPercentage = Math.min(
              Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
              100
            );

            // Format currency
            const formatCurrency = (amount: number) => {
              return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(amount);
            };

            return (
              <Card key={campaign._id} className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="aspect-video bg-teal-100 overflow-hidden flex items-center justify-center">
                  <Heart className="h-16 w-16 text-teal-500" />
                </div>

                <CardContent className="p-5 flex-grow">
                  <h3 className="text-xl font-bold mb-3 text-teal-700">{campaign.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{campaign.description}</p>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700">
                          {formatCurrency(campaign.currentAmount)} raised
                        </span>
                        <span className="text-gray-500">
                          Goal: {formatCurrency(campaign.goalAmount)}
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-teal-600 font-medium">{progressPercentage}% Complete</span>
                        {campaign.donorCount > 0 && (
                          <span className="text-gray-500 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {campaign.donorCount} {campaign.donorCount === 1 ? 'Donor' : 'Donors'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      Ends: {format(campaign.endDate, 'MMMM d, yyyy')}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-0 flex flex-col gap-2 w-full mt-auto">
                  <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                    <Link to="/donate">
                      <Heart className="mr-2 h-4 w-4" />
                      Learn More
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button asChild variant="outline" className="border-teal-600 text-teal-600 hover:bg-teal-50">
            <Link to="/donate">Learn More About Donations</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DonationGoals;
