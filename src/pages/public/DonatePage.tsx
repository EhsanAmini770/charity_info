import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, DollarSign, Gift, Heart, Calendar, Landmark, Users } from 'lucide-react';

export const DonatePage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-teal-800">How to Donate</h1>
        <p className="text-lg text-gray-600 mb-8">
          This page provides information about donation methods for charitable organizations.
          As a charity information website, we don't accept donations directly but provide guidance on how to support causes.
        </p>

        {/* Donation Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-teal-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-teal-700" />
              </div>
              <CardTitle className="text-teal-800">Online Donation</CardTitle>
              <CardDescription>Quick and secure way to donate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Most charitable organizations allow you to make one-time or recurring donations using credit cards, debit cards, or PayPal accounts.
                Online donation systems are typically secure and easy to use.
              </p>
              <p className="text-sm text-gray-500 italic">
                This is informational content only. Contact charitable organizations directly to learn more about their donation processes.
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <Landmark className="h-6 w-6 text-teal-700" />
              </div>
              <CardTitle className="text-teal-800">Bank Transfer</CardTitle>
              <CardDescription>Direct bank-to-bank donation</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Bank transfers are a common method used by charitable organizations. This method is ideal for larger donations
                or if you prefer not to use online payment systems.
              </p>
              <div className="bg-gray-50 p-3 rounded-md text-sm">
                <p>When making bank transfers to charitable organizations, you'll typically need:</p>
                <ul className="list-disc pl-5 mt-2">
                  <li>The organization's bank name</li>
                  <li>Account name</li>
                  <li>Account number</li>
                  <li>Routing or SWIFT code</li>
                  <li>A reference for your donation</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="border-teal-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-teal-700" />
              </div>
              <CardTitle className="text-teal-800">Monthly Giving</CardTitle>
              <CardDescription>Become a regular supporter</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Many charitable organizations offer monthly giving programs that provide consistent support. Monthly donors often receive
                special updates and insights into the impact of their contributions.
              </p>
              <p className="text-sm text-gray-500 italic">
                This is informational content only. Contact charitable organizations directly to learn more about their monthly giving programs.
              </p>
            </CardContent>
          </Card>

          <Card className="border-teal-100 hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
                <Gift className="h-6 w-6 text-teal-700" />
              </div>
              <CardTitle className="text-teal-800">In-Kind Donations</CardTitle>
              <CardDescription>Donate goods or services</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Many charitable organizations accept goods, services, or expertise instead of money. In-kind donations can include
                food, clothing, equipment, professional services, and more.
              </p>
              <p className="text-sm text-gray-500 italic">
                This is informational content only. Contact charitable organizations directly to learn about their in-kind donation needs and processes.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Impact Section */}
        <div className="bg-teal-50 rounded-xl p-6 md:p-8 mb-12">
          <h2 className="text-2xl font-bold mb-4 text-teal-800">Your Impact</h2>
          <p className="text-gray-600 mb-6">
            Every donation, regardless of size, makes a meaningful difference. Here's how your contribution helps:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-3">
                <Heart className="h-5 w-5 text-pink-500 mr-2" />
                <h3 className="font-semibold text-teal-800">$25</h3>
              </div>
              <p className="text-sm text-gray-600">
                Provides essential supplies for a family in need for one week
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-3">
                <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="font-semibold text-teal-800">$100</h3>
              </div>
              <p className="text-sm text-gray-600">
                Funds educational materials for 10 children in underserved communities
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center mb-3">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="font-semibold text-teal-800">$500</h3>
              </div>
              <p className="text-sm text-gray-600">
                Supports community development projects that benefit hundreds of people
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 text-teal-800">Donation FAQs</h2>

          <div className="space-y-4">
            <div className="border-b pb-4">
              <h3 className="font-semibold text-teal-700 mb-2">Are donations tax-deductible?</h3>
              <p className="text-gray-600">
                Yes, all donations to Charity Info are tax-deductible to the extent allowed by law.
                You will receive a tax receipt for your records.
              </p>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold text-teal-700 mb-2">Can I specify where my donation goes?</h3>
              <p className="text-gray-600">
                Absolutely! You can designate your donation to a specific program or initiative.
                Simply indicate your preference when making your donation.
              </p>
            </div>

            <div className="border-b pb-4">
              <h3 className="font-semibold text-teal-700 mb-2">How is my donation used?</h3>
              <p className="text-gray-600">
                We are committed to transparency. At least 85% of all donations go directly to our programs,
                with the remainder covering essential administrative and fundraising costs.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-teal-700 mb-2">Can I donate in memory or honor of someone?</h3>
              <p className="text-gray-600">
                Yes, you can make a tribute donation in memory or honor of someone special.
                We can send a notification of your gift to the person you designate.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-50 rounded-xl p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-4 text-teal-800">Need More Information?</h2>
          <p className="text-gray-600 mb-6">
            If you have questions about charitable organizations or need more information about donation methods,
            feel free to contact us. We're here to provide information about charitable giving.
          </p>

          <div className="flex flex-col md:flex-row gap-4">
            <Button asChild className="bg-teal-600 hover:bg-teal-700">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;
