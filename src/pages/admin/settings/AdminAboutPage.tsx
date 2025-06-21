import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, UserCircle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { aboutApi } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

// Define the form validation schema
const formSchema = z.object({
  mission: z.string().min(10, { message: 'Mission statement must be at least 10 characters.' }),
  vision: z.string().min(10, { message: 'Vision statement must be at least 10 characters.' }),
  foundedYear: z.string().min(4, { message: 'Founded year must be at least 4 characters.' }),
  volunteersCount: z.string().min(1, { message: 'Volunteers count is required.' }),
  peopleHelpedCount: z.string().min(1, { message: 'People helped count is required.' }),
  communitiesCount: z.string().min(1, { message: 'Communities count is required.' }),
});

type FormValues = z.infer<typeof formSchema>;

function AdminAboutPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Fetch about page content
  const { data, isLoading, error } = useQuery({
    queryKey: ['aboutContent'],
    queryFn: aboutApi.getContent,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mission: '',
      vision: '',
      foundedYear: '',
      volunteersCount: '',
      peopleHelpedCount: '',
      communitiesCount: '',
    },
  });

  // Update form values when data is loaded
  React.useEffect(() => {
    if (data?.aboutContent) {
      form.reset({
        mission: data.aboutContent.mission || '',
        vision: data.aboutContent.vision || '',
        foundedYear: data.aboutContent.foundedYear || '',
        volunteersCount: data.aboutContent.volunteersCount || '',
        peopleHelpedCount: data.aboutContent.peopleHelpedCount || '',
        communitiesCount: data.aboutContent.communitiesCount || '',
      });
    }
  }, [data, form]);

  // Mutation for updating about content
  const mutation = useMutation({
    mutationFn: (formData: FormValues) => {
      return aboutApi.updateContent(formData);
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'About page content has been updated.',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['aboutContent'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update about page content.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Settings className="mr-2 h-5 w-5 text-primary" />
        <h1 className="text-2xl font-bold">About Page Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit About Page Content</CardTitle>
          <CardDescription>
            Update the content displayed on the About page. These changes will be immediately visible to all visitors.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission Statement</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Our mission is to..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the primary purpose of your organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vision Statement</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="We believe in..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the long-term goals and aspirations of your organization.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="foundedYear"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Founded Year</FormLabel>
                        <FormControl>
                          <Input placeholder="2010" {...field} />
                        </FormControl>
                        <FormDescription>
                          The year your organization was established.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="volunteersCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volunteers Count</FormLabel>
                        <FormControl>
                          <Input placeholder="50" {...field} />
                        </FormControl>
                        <FormDescription>
                          The number of volunteers in your organization.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="peopleHelpedCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>People Helped Count</FormLabel>
                        <FormControl>
                          <Input placeholder="10,000" {...field} />
                        </FormControl>
                        <FormDescription>
                          The number of people your organization has helped.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="communitiesCount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Communities Count</FormLabel>
                        <FormControl>
                          <Input placeholder="5" {...field} />
                        </FormControl>
                        <FormDescription>
                          The number of communities your organization serves.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={mutation.isPending} className="w-full md:w-auto">
                  {mutation.isPending ? (
                    <>
                      <span className="mr-2">Saving...</span>
                      <Save className="h-4 w-4 animate-spin" />
                    </>
                  ) : (
                    <>
                      <span className="mr-2">Save Changes</span>
                      <Save className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Team Members</CardTitle>
          <CardDescription>
            Manage your organization's team members that will be displayed on the About page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Add, edit, or remove team members to showcase your organization's leadership and staff.
          </p>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button
            onClick={() => navigate('/admin/team')}
            variant="outline"
            className="w-full"
          >
            <UserCircle className="mr-2 h-4 w-4" />
            Manage Team Members
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default AdminAboutPage;
