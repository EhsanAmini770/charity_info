import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi, TeamMemberItem } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import API_CONFIG from '@/config/api';

export function AdminTeamListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMemberToDelete, setTeamMemberToDelete] = useState<TeamMemberItem | null>(null);

  // Fetch team members
  const { data, isLoading, error } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => teamApi.getAll({ includeInactive: true }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => teamApi.delete(id),
    onSuccess: () => {
      toast({
        title: 'Team member deleted',
        description: 'The team member has been successfully deleted.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setTeamMemberToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete team member.',
        variant: 'destructive',
      });
    },
  });

  // Handle delete click
  const handleDeleteClick = (teamMember: TeamMemberItem) => {
    setTeamMemberToDelete(teamMember);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (teamMemberToDelete) {
      deleteMutation.mutate(teamMemberToDelete._id);
    }
  };

  // Filter team members based on search query
  const filteredTeamMembers = React.useMemo(() => {
    if (!data?.teamMembers) return [];
    
    return data.teamMembers.filter(member => 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.bio.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md text-red-800">
        <p className="font-semibold">Error loading team members</p>
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's team members
          </p>
        </div>
        <Button onClick={() => navigate("/admin/team/create")}>
          <Plus className="h-4 w-4 mr-2" /> Add Team Member
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search team members..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Status</TableHead>
                <TableHead className="w-[80px]">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Position</TableHead>
                <TableHead className="w-[100px]">Order</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeamMembers && filteredTeamMembers.length > 0 ? (
                filteredTeamMembers.map((member) => (
                  <TableRow key={member._id}>
                    <TableCell>
                      {member.active ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {member.photo ? (
                        <img 
                          src={`${API_CONFIG.baseURL}${member.photo}`} 
                          alt={member.name} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {member.displayOrder}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/team/edit/${member._id}`)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(member)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    {searchQuery
                      ? "No team members match your search."
                      : "No team members found. Add your first team member."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!teamMemberToDelete} onOpenChange={(open) => !open && setTeamMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the team member "{teamMemberToDelete?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
