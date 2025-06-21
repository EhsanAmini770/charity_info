import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { contactApi, locationsApi } from '@/services/api';
import { Mail, Phone, MapPin, Loader } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

// Define the form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

type FormValues = z.infer<typeof formSchema>;

export function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Default organization name
  const organizationName = 'Charity Welcome Hub';

  // Fetch locations from API to get main office
  const { data: locationsData, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => locationsApi.getAll({ active: true }),
  });

  // Find the main office location
  const mainOffice = React.useMemo(() => {
    if (!locationsData?.locations) return null;
    return locationsData.locations.find(loc => loc.isMainOffice) || locationsData.locations[0];
  }, [locationsData]);

  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await contactApi.submit(data);
      toast({
        title: 'Message Sent',
        description: 'Thank you for your message. We will get back to you soon.',
        variant: 'success',
      });
      form.reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: 'Error',
        description: 'There was a problem sending your message. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" type="email" {...field} disabled={isSubmitting} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <FormControl>
                        <Input placeholder="Message subject" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Your message"
                          className="min-h-[150px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Get in touch with us directly using the information below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingLocations ? (
              <div className="flex justify-center py-4">
                <Loader className="h-6 w-6 animate-spin text-teal-600" />
              </div>
            ) : mainOffice ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">{mainOffice.name || organizationName}</h3>

                {mainOffice?.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-charity-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">{mainOffice.address}</p>
                    </div>
                  </div>
                )}

                {mainOffice?.phone && (
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-charity-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">{mainOffice.phone}</p>
                    </div>
                  </div>
                )}

                {mainOffice?.email && (
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-charity-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href={`mailto:${mainOffice.email}`}
                        className="text-charity-primary hover:underline"
                      >
                        {mainOffice.email}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>No office location information available.</p>
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-lg mb-3">Office Hours</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday:</span>
                  <span>9:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday:</span>
                  <span>10:00 AM - 2:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>Closed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-12">
        <CardContent className="p-6">
          <div className="aspect-w-16 aspect-h-9 w-full relative">
            {isLoadingLocations ? (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <Loader className="h-8 w-8 animate-spin text-teal-600" />
              </div>
            ) : mainOffice ? (
              <iframe
                src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1000!2d${mainOffice.longitude}!3d${mainOffice.latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z${mainOffice.latitude}N_${mainOffice.longitude}E!5e0!3m2!1sen!2sus!4v1644345114693!5m2!1sen!2sus`}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Location Map"
              ></iframe>
            ) : (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d95301.21309959576!2d36.24528485!3d41.2805456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40887ef9aec4c979%3A0x5c5ba91d9b1d4a4f!2sSamsun%2C%20Turkey!5e0!3m2!1sen!2sus!4v1644345114693!5m2!1sen!2sus"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                title="Location Map"
              ></iframe>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>
            Find answers to common questions about our services and organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">How can I volunteer with your organization?</h3>
            <p className="text-gray-600">
              We welcome volunteers who want to contribute their time and skills. Please fill out the contact form above
              with your interest in volunteering, and our volunteer coordinator will get in touch with you.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">How are donations used?</h3>
            <p className="text-gray-600">
              Donations directly support our programs and services. We ensure that funds are used efficiently
              to maximize impact in our community. For detailed information, please visit our Donate page.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Do you offer internship opportunities?</h3>
            <p className="text-gray-600">
              Yes, we offer internship opportunities for students and recent graduates. Please contact us with your
              resume and area of interest for more information.
            </p>
          </div>

          <div className="pt-4">
            <p className="text-gray-600">
              For more questions and answers, please visit our <a href="/faq" className="text-charity-primary hover:underline">FAQ page</a>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ContactPage;
