import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { partnersApi } from "@/services/api";
import { Badge } from "@/components/ui/badge";

interface Partner {
  _id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  partnerType: 'sponsor' | 'partner' | 'supporter';
  featured: boolean;
  displayOrder: number;
  active: boolean;
}

export function AdminPartnerListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [partnerToDelete, setPartnerToDelete] = useState<Partner | null>(null);

  // Fetch partners
  const { data, isLoading, error } = useQuery({
    queryKey: ["partners"],
    queryFn: () => partnersApi.getAll(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => partnersApi.delete(id),
    onSuccess: () => {
      toast({
        title: "Partner deleted",
        description: "The partner has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["partners"] });
      setPartnerToDelete(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete partner. Please try again.",
      });
      console.error("Delete error:", error);
    },
  });

  // Filter partners based on search query
  const filteredPartners = data?.partners.filter((partner: Partner) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      partner.name.toLowerCase().includes(searchLower) ||
      (partner.description && partner.description.toLowerCase().includes(searchLower))
    );
  });

  // Handle delete confirmation
  const handleDeleteClick = (partner: Partner) => {
    setPartnerToDelete(partner);
  };

  const confirmDelete = () => {
    if (partnerToDelete) {
      deleteMutation.mutate(partnerToDelete._id);
    }
  };

  // Get partner type badge
  const getPartnerTypeBadge = (type: string) => {
    switch (type) {
      case 'sponsor':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Sponsor</Badge>;
      case 'partner':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Partner</Badge>;
      case 'supporter':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Supporter</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-red-800 font-medium">Error loading partners</h3>
          <p className="text-red-700 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Partners & Sponsors</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's partners and sponsors
          </p>
        </div>
        <Button onClick={() => navigate("/admin/partners/create")}>
          <Plus className="h-4 w-4 mr-2" /> Add Partner
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search partners..."
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
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="w-[100px]">Featured</TableHead>
                <TableHead className="w-[80px]">Order</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPartners && filteredPartners.length > 0 ? (
                filteredPartners.map((partner: Partner) => (
                  <TableRow key={partner._id}>
                    <TableCell>
                      {partner.active ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      {partner.logo ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${partner.logo}`}
                          alt={partner.name}
                          className="h-10 w-auto max-w-[80px] object-contain"
                          onError={(e) => {
                            console.error(`Failed to load partner logo: ${partner.name}`);
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                      ) : (
                        <Award className="h-6 w-6 text-gray-400" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        {partner.name}
                        {partner.website && (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-500 block hover:underline"
                          >
                            {partner.website}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getPartnerTypeBadge(partner.partnerType)}</TableCell>
                    <TableCell>
                      {partner.featured ? (
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 mr-1" />
                          <span className="text-amber-700">Featured</span>
                        </div>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>{partner.displayOrder}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/partners/edit/${partner._id}`)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(partner)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    {searchQuery
                      ? "No partners match your search."
                      : "No partners found. Add your first partner."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!partnerToDelete} onOpenChange={(open) => !open && setPartnerToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the partner "{partnerToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPartnerToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
