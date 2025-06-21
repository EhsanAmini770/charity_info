import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapPin, Save, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { locationsApi, LocationItem } from "@/services/api";

export function AdminLocationEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState<Partial<LocationItem>>({
    name: "",
    description: "",
    latitude: 41.2867, // Default to Samsun, Turkey
    longitude: 36.3300,
    address: "",
    phone: "",
    email: "",
    isMainOffice: false,
    displayOrder: 0,
    active: true,
  });

  // Fetch location data if in edit mode
  const { data: locationData, isLoading: isLoadingLocation } = useQuery({
    queryKey: ["location", id],
    queryFn: () => locationsApi.getById(id!),
    enabled: isEditMode,
  });

  // Update form data when location data is loaded
  useEffect(() => {
    if (locationData?.location) {
      setFormData({
        name: locationData.location.name,
        description: locationData.location.description,
        latitude: locationData.location.latitude,
        longitude: locationData.location.longitude,
        address: locationData.location.address || "",
        phone: locationData.location.phone || "",
        email: locationData.location.email || "",
        isMainOffice: locationData.location.isMainOffice,
        displayOrder: locationData.location.displayOrder,
        active: locationData.location.active,
      });
    }
  }, [locationData]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: Partial<LocationItem>) => locationsApi.create(data),
    onSuccess: () => {
      toast({
        title: "Location created",
        description: "The location has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      navigate("/admin/locations");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create location. Please try again.",
      });
      console.error("Create error:", error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LocationItem> }) =>
      locationsApi.update(id, data),
    onSuccess: () => {
      toast({
        title: "Location updated",
        description: "The location has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["location", id] });
      navigate("/admin/locations");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update location. Please try again.",
      });
      console.error("Update error:", error);
    },
  });

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle number input changes
  const handleNumberChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: parseFloat(value) || 0 }));
  };

  // Handle switch changes
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name and description are required fields.",
      });
      return;
    }

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = isLoadingLocation || createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/locations")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditMode ? "Edit Location" : "Add New Location"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode
              ? "Update the details of this location"
              : "Create a new office location"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Location Details</CardTitle>
                <CardDescription>
                  Basic information about this location
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Location Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Office, Branch Office"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of this location"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Full address"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+90 123 456 7890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="office@example.com"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Map Coordinates</CardTitle>
                <CardDescription>
                  Specify the exact location on the map
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      name="latitude"
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={handleNumberChange}
                      placeholder="41.2867"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      name="longitude"
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={handleNumberChange}
                      placeholder="36.3300"
                      required
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-2">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>
                    Tip: You can find coordinates by right-clicking on Google Maps and selecting "What's here?"
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure display options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isMainOffice">Main Office</Label>
                    <p className="text-sm text-gray-500">
                      Set as the main headquarters
                    </p>
                  </div>
                  <Switch
                    id="isMainOffice"
                    checked={formData.isMainOffice}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("isMainOffice", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="active">Active</Label>
                    <p className="text-sm text-gray-500">
                      Show this location on the map
                    </p>
                  </div>
                  <Switch
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("active", checked)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayOrder">Display Order</Label>
                  <Input
                    id="displayOrder"
                    name="displayOrder"
                    type="number"
                    min="0"
                    value={formData.displayOrder}
                    onChange={handleNumberChange}
                    placeholder="0"
                  />
                  <p className="text-xs text-gray-500">
                    Lower numbers appear first in the list
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditMode ? "Update Location" : "Create Location"}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
