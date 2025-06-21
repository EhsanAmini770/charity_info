import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Eye,
  EyeOff,
  ArrowUpDown,
  Loader,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { faqApi, FaqItem } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

export function AdminFaqListPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [sortField, setSortField] = useState<keyof FaqItem>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [faqToDelete, setFaqToDelete] = useState<FaqItem | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-faqs'],
    queryFn: faqApi.getAllAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => faqApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'FAQ deleted',
        description: 'The FAQ has been successfully deleted.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
      setFaqToDelete(null);
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => {
      console.log(`Toggling FAQ ${id} active status to:`, isActive);
      return faqApi.update(id, { isActive });
    },
    onSuccess: (data, variables) => {
      console.log('Toggle active success:', data);
      toast({
        title: 'FAQ updated',
        description: `FAQ status has been ${variables.isActive ? 'activated' : 'deactivated'}.`,
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-faqs'] });
    },
    onError: (error: any) => {
      console.error('Toggle active error:', error);

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
        description: `Failed to update FAQ status: ${errorMessage}`,
        variant: 'destructive',
      });
    },
  });

  // Get unique categories
  const categories = React.useMemo(() => {
    if (!data?.faqs) return [];
    const uniqueCategories = [...new Set(data.faqs.map(faq => faq.category))];
    return uniqueCategories.sort();
  }, [data]);

  // Filter and sort FAQs
  const filteredFaqs = React.useMemo(() => {
    if (!data?.faqs) return [];

    return data.faqs
      .filter(faq => {
        const matchesSearch = searchTerm === '' ||
          faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === '' || faq.category === categoryFilter;

        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle numeric fields, ensuring order is treated as a number
        if (sortField === 'order') {
          const aNum = typeof aValue === 'number' ? aValue : parseInt(String(aValue), 10) || 0;
          const bNum = typeof bValue === 'number' ? bValue : parseInt(String(bValue), 10) || 0;
          return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortDirection === 'asc'
            ? (aValue === bValue ? 0 : aValue ? 1 : -1)
            : (aValue === bValue ? 0 : aValue ? -1 : 1);
        }

        return 0;
      });
  }, [data, searchTerm, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: keyof FaqItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleActive = (faq: FaqItem) => {
    toggleActiveMutation.mutate({
      id: faq._id,
      isActive: !faq.isActive,
    });
  };

  const handleDeleteFaq = () => {
    if (faqToDelete) {
      deleteMutation.mutate(faqToDelete._id);
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
        <p className="font-semibold mb-2">{is403 ? 'Access Denied' : 'Error Loading FAQs'}</p>
        <p>
          {is403
            ? 'You do not have permission to access the FAQ management. Please contact an administrator.'
            : 'There was an error loading FAQs. Please try again later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <HelpCircle className="mr-2 h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">FAQ Management</h1>
        </div>
        <Button asChild>
          <Link to="/admin/faqs/create">
            <Plus className="mr-2 h-4 w-4" /> Add New FAQ
          </Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search FAQs..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                {categoryFilter ? categoryFilter : 'All Categories'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setCategoryFilter('')}>
                All Categories
              </DropdownMenuItem>
              {categories.map((category) => (
                <DropdownMenuItem
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('order')}
                  className="font-medium"
                >
                  Order
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('question')}
                  className="font-medium text-left"
                >
                  Question
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('category')}
                  className="font-medium text-left"
                >
                  Category
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[100px]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('isActive')}
                  className="font-medium"
                >
                  Status
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[120px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFaqs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No FAQs found. Try adjusting your filters or add a new FAQ.
                </TableCell>
              </TableRow>
            ) : (
              filteredFaqs.map((faq) => (
                <TableRow key={faq._id}>
                  <TableCell className="font-medium text-center">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-gray-800 font-semibold text-sm">
                      {faq.order}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-md truncate">{faq.question}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100">
                      {faq.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {faq.isActive ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(faq)}
                        title={faq.isActive ? "Deactivate" : "Activate"}
                      >
                        {faq.isActive ? (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                      >
                        <Link to={`/admin/faqs/edit/${faq._id}`} title="Edit">
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setFaqToDelete(faq)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!faqToDelete} onOpenChange={(open) => !open && setFaqToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the FAQ "{faqToDelete?.question}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFaq}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminFaqListPage;
