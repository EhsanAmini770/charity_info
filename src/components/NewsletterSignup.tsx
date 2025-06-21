import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';
import { logError } from '@/utils/logUtils';

interface NewsletterSignupProps {
  className?: string;
}

const NewsletterSignup: React.FC<NewsletterSignupProps> = ({ className }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/subscribers/subscribe`,
        { email, name }
      );

      setIsSuccess(true);
      setEmail('');
      setName('');

      toast({
        title: "Subscription Successful",
        description: response.data.message,
        variant: "default",
      });
    } catch (err: any) {
      logError('Newsletter signup error:', err);

      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.errors?.[0]?.msg ||
                          'Failed to subscribe. Please try again.';

      setError(errorMessage);

      toast({
        title: "Subscription Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`bg-teal-50 rounded-lg p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <Mail className="h-6 w-6 text-teal-600 mr-2" />
        <h3 className="text-xl font-semibold text-teal-800">Subscribe to Our Newsletter</h3>
      </div>

      <p className="text-teal-700 mb-4">
        Stay updated with our latest news, events, and opportunities to make a difference.
      </p>

      {isSuccess ? (
        <div className="bg-teal-100 p-4 rounded-md flex items-start">
          <CheckCircle className="h-5 w-5 text-teal-700 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-teal-700">
            Thank you for subscribing! We've sent a confirmation to your email.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-teal-700">
              Name (Optional)
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-teal-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Subscribe Now'
            )}
          </Button>

          <p className="text-xs text-teal-600 text-center">
            We respect your privacy and will never share your information.
          </p>
        </form>
      )}
    </div>
  );
};

export default NewsletterSignup;
