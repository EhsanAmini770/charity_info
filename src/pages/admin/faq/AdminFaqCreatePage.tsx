import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HelpCircle, Save, ArrowLeft, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { faqApi, FaqItem } from '@/services/api';

export function AdminFaqCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<FaqItem>>({
    question: '',
    answer: '',
    category: 'General',
    order: 0,
    isActive: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // If the field is empty, just store the empty string in the form state
    // This allows us to distinguish between "0" and "not provided"
    if (value === '') {
      setFormData(prev => ({ ...prev, [name]: '' }));
      return;
    }

    // Try to parse the value as an integer
    const parsedValue = parseInt(value, 10);

    // Only update if it's a valid number
    if (!isNaN(parsedValue)) {
      setFormData(prev => ({ ...prev, [name]: parsedValue }));
    } else {
      // If parsing failed, don't update the form state
      console.warn(`Invalid numeric input for ${name}:`, value);
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

    // Prepare the data for creation
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
    createMutation.mutate(preparedData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <HelpCircle className="mr-2 h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Create FAQ</h1>
        </div>
        <Button variant="outline" onClick={() => navigate('/admin/faqs')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to FAQs
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>New FAQ Details</CardTitle>
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
              Create FAQ
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default AdminFaqCreatePage;