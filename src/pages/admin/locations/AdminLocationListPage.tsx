import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle,
  Home
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
import { locationsApi, LocationItem } from "@/services/api";
import { Badge } from "@/components/ui/badge";

export function AdminLocationListPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationToDelete, setLocationToDelete] = useState<LocationItem | null>(null);

  // Fetch locations
  const { data, isLoading, error } = useQuery({
    queryKey: ["locations", { includeInactive: true }],
    queryFn: () => locationsApi.getAll({ includeInactive: true }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => locationsApi.delete(id),
    onSuccess: () => {
      toast({
        title: "Location deleted",
        description: "The location has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      setLocationToDelete(null);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete location. Please try again.",
      });
      console.error("Delete error:", error);
    },
  });

  // Filter locations based on search query
  const filteredLocations = data?.locations.filter((location) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      location.name.toLowerCase().includes(searchLower) ||
      location.description.toLowerCase().includes(searchLower) ||
      (location.address && location.address.toLowerCase().includes(searchLower))
    );
  });

  // Handle delete confirmation
  const handleDeleteClick = (location: LocationItem) => {
    setLocationToDelete(location);
  };

  const confirmDelete = () => {
    if (locationToDelete) {
      deleteMutation.mutate(locationToDelete._id);
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
          <h3 className="text-red-800 font-medium">Error loading locations</h3>
          <p className="text-red-700 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Office Locations</h1>
          <p className="text-gray-600 mt-1">
            Manage your organization's office locations
          </p>
        </div>
        <Button onClick={() => navigate("/admin/locations/create")}>
          <Plus className="h-4 w-4 mr-2" /> Add Location
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search locations..."
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
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[150px]">Coordinates</TableHead>
                <TableHead className="w-[100px]">Main Office</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations && filteredLocations.length > 0 ? (
                filteredLocations.map((location) => (
                  <TableRow key={location._id}>
                    <TableCell>
                      {location.active ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {location.isMainOffice && (
                          <Home className="h-4 w-4 mr-2 text-blue-500" />
                        )}
                        {location.name}
                      </div>
                    </TableCell>
                    <TableCell>{location.address || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {location.isMainOffice ? (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          Main Office
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/locations/edit/${location._id}`)}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(location)}
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
                      ? "No locations match your search."
                      : "No locations found. Add your first location."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!locationToDelete} onOpenChange={(open) => !open && setLocationToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the location "{locationToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocationToDelete(null)}>
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
