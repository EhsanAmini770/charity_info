import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Save, ArrowLeft, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { faqApi, FaqItem } from '@/services/api';

export function AdminFaqEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<Partial<FaqItem>>({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch FAQ data if in edit mode
  const { data, isLoading, error } = useQuery({
    queryKey: ['faq', id],
    queryFn: () => faqApi.getById(id!),
    enabled: isEditMode,
  });

  // Update form data when FAQ data is loaded
  useEffect(() => {
    if (data?.faq) {
      setFormData({
        question: data.faq.question,
        answer: data.faq.answer,
        category: data.faq.category,
        order: data.faq.order,
        isActive: data.faq.isActive,
      });
    }
  }, [data]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<FaqItem>) => faqApi.create(data),
    onSuccess: () => {
      toast({
        title: 'FAQ created',
        description: 'The FAQ has been successfully created.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      navigate('/admin/faqs');
    },
    onError: (error: any) => {
      console.error('Create mutation error:', error);

      // Extract error message
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors from the server
        errorMessage = Array.isArray(error.response.data.errors)
          ? error.response.data.errors.join(', ')
          : Object.values(error.response.data.errors).join(', ');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Error',
        description: `Failed to create FAQ: ${errorMessage}`,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FaqItem> }) => faqApi.update(id, data),
    onSuccess: () => {
      toast({
        title: 'FAQ updated',
        description: 'The FAQ has been successfully updated.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      queryClient.invalidateQueries({ queryKey: ['faq', id] });
      navigate('/admin/faqs');
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);

      // Extract error message
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error?.response?.data?.errors) {
        // Handle validation errors from the server
        errorMessage = Array.isArray(error.response.data.errors)
          ? error.response.data.errors.join(', ')
          : Object.values(error.response.data.errors).join(', ');
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: 'Error',
        description: `Failed to update FAQ: ${errorMessage}`,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));

    // If we're in edit mode, immediately update the isActive status
    if (isEditMode && id) {
      console.log(`Sending partial update for FAQ ${id}: isActive=${checked}`);
      updateMutation.mutate({
        id,
        data: { isActive: checked } // Send only the isActive field for partial update
      });
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // If the field is empty, just store the empty string in the form state
    // This allows us to distinguish between "0" and "not provided"
    if (value === '') {
      setFormData(prev => ({ ...prev, [name]: '' }));
      console.log(`Setting ${name} to empty string`);
      return;
    }

    // Try to parse the value as an integer
    const parsedValue = parseInt(value, 10);

    // Only update if it's a valid number
    if (!isNaN(parsedValue)) {
      setFormData(prev => ({ ...prev, [name]: parsedValue }));
      console.log(`Setting ${name} to numeric value:`, parsedValue);
    } else {
      // If parsing failed, don't update the form state
      console.warn(`Invalid numeric input for ${name}:`, value);
      // Optionally, you could revert to the previous valid value here
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.question || !formData.answer) {
      toast({
        title: 'Validation Error',
        description: 'Question and answer fields are required.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    // Prepare the data for a full update
    const preparedData: Partial<FaqItem> = {
      question: formData.question?.trim(),
      answer: formData.answer?.trim(),
      category: formData.category?.trim() || 'General',
      isActive: formData.isActive === undefined ? true : Boolean(formData.isActive),
    };

    // Handle the order field properly
    if (formData.order !== undefined && formData.order !== '') {
      // Convert to number only if it's a valid value
      if (typeof formData.order === 'number') {
        preparedData.order = formData.order;
      } else if (typeof formData.order === 'string' && !isNaN(parseInt(formData.order, 10))) {
        preparedData.order = parseInt(formData.order, 10);
      } else {
        // Default to 0 if no valid value
        preparedData.order = 0;
      }
    }

    // Log the form data being submitted
    console.log('Submitting FAQ form data:', preparedData);

    if (isEditMode && id) {
      console.log('Updating FAQ with ID:', id);
      updateMutation.mutate({ id, data: preparedData });
    } else {
      console.log('Creating new FAQ');
      createMutation.mutate(preparedData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const is403 = errorMessage.includes('403') || errorMessage.includes('Forbidden');

    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <p className="font-semibold mb-2">{is403 ? 'Access Denied' : 'Error Loading FAQ'}</p>
        <p>
          {is403
            ? 'You do not have permission to manage FAQs. Please contact an administrator.'
            : isEditMode
              ? 'There was an error loading the FAQ. Please try again later.'
              : 'There was an error accessing the FAQ creation page. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <HelpCircle className="mr-2 h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">{isEditMode ? 'Edit FAQ' : 'Create FAQ'}</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/faqs')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to FAQs
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit FAQ Details' : 'New FAQ Details'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                placeholder="Enter the question"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                name="answer"
                value={formData.answer}
                onChange={handleInputChange}
                placeholder="Enter the answer"
                rows={6}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="E.g., General, Donations, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="order"
                    name="order"
                    type="number"
                    value={formData.order}
                    onChange={handleNumberChange}
                    min={0}
                    step={1}
                  />
                  <div className="text-xs text-gray-500">
                    Lower numbers appear first
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate('/admin/faqs')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center"
            >
              {isSubmitting ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditMode ? 'Update FAQ' : 'Create FAQ'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default AdminFaqEditPage;
