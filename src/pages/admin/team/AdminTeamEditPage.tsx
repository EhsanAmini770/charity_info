import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teamApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Upload, Trash2, Users } from 'lucide-react';
import API_CONFIG from '@/config/api';

export function AdminTeamEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    email: '',
    phone: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    displayOrder: 0,
    active: true
  });

  // Photo state
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [existingPhoto, setExistingPhoto] = useState<string | null>(null);
  const [removePhoto, setRemovePhoto] = useState(false);

  // Fetch team member data if in edit mode
  const { data: teamMemberData, isLoading: isLoadingTeamMember } = useQuery({
    queryKey: ['team-member', id],
    queryFn: () => teamApi.getById(id!),
    enabled: isEditMode,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: FormData) => teamApi.create(data),
    onSuccess: () => {
      toast({
        title: 'Team member created',
        description: 'The team member has been successfully created.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      navigate('/admin/team');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create team member.',
        variant: 'destructive',
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: FormData }) => teamApi.update(id, data),
    onSuccess: () => {
      toast({
        title: 'Team member updated',
        description: 'The team member has been successfully updated.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      queryClient.invalidateQueries({ queryKey: ['team-member', id] });
      navigate('/admin/team');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update team member.',
        variant: 'destructive',
      });
    },
  });

  // Set form data when team member data is loaded
  useEffect(() => {
    if (teamMemberData?.teamMember) {
      const member = teamMemberData.teamMember;
      setFormData({
        name: member.name,
        position: member.position,
        bio: member.bio,
        email: member.email || '',
        phone: member.phone || '',
        socialLinks: {
          linkedin: member.socialLinks?.linkedin || '',
          twitter: member.socialLinks?.twitter || '',
          facebook: member.socialLinks?.facebook || ''
        },
        displayOrder: member.displayOrder,
        active: member.active
      });

      if (member.photo) {
        setExistingPhoto(`${API_CONFIG.baseURL}${member.photo}`);
      }
    }
  }, [teamMemberData]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialLinks.')) {
      const socialLinkKey = name.split('.')[1] as keyof typeof formData.socialLinks;
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialLinkKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle number input change
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  // Handle switch change
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  // Handle photo change
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  };

  // Handle remove photo
  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setRemovePhoto(true);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('position', formData.position);
    formDataToSend.append('bio', formData.bio);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('socialLinks', JSON.stringify(formData.socialLinks));
    formDataToSend.append('displayOrder', formData.displayOrder.toString());
    formDataToSend.append('active', formData.active.toString());
    
    if (photoFile) {
      formDataToSend.append('photo', photoFile);
    }
    
    if (removePhoto) {
      formDataToSend.append('removePhoto', 'true');
    }
    
    if (isEditMode) {
      updateMutation.mutate({ id: id!, data: formDataToSend });
    } else {
      createMutation.mutate(formDataToSend);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/team')}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit Team Member' : 'Add Team Member'}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Enter the team member's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    placeholder="CEO"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio *</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Brief biography of the team member"
                    rows={5}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Enter the team member's contact details (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
                <CardDescription>
                  Add social media links (optional)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="socialLinks.linkedin">LinkedIn</Label>
                  <Input
                    id="socialLinks.linkedin"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks.linkedin}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialLinks.twitter">Twitter</Label>
                  <Input
                    id="socialLinks.twitter"
                    name="socialLinks.twitter"
                    value={formData.socialLinks.twitter}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/johndoe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialLinks.facebook">Facebook</Label>
                  <Input
                    id="socialLinks.facebook"
                    name="socialLinks.facebook"
                    value={formData.socialLinks.facebook}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/johndoe"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Photo</CardTitle>
                <CardDescription>
                  Upload a profile photo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-center">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-full border border-gray-200"
                    />
                  ) : existingPhoto && !removePhoto ? (
                    <img
                      src={existingPhoto}
                      alt="Current"
                      className="w-40 h-40 object-cover rounded-full border border-gray-200"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
                      <Users className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="photo" className="sr-only">
                    Photo
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => document.getElementById('photo')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                    {(photoPreview || (existingPhoto && !removePhoto)) && (
                      <Button
                        type="button"
                        variant="outline"
                        className="text-red-500 border-red-200 hover:bg-red-50"
                        onClick={handleRemovePhoto}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <Input
                    id="photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <p className="text-xs text-gray-500">
                    Recommended: Square image, at least 300x300px
                  </p>
                </div>
              </CardContent>
            </Card>

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
                    <Label htmlFor="active">Active</Label>
                    <p className="text-sm text-gray-500">
                      Show this team member on the website
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
                  />
                  <p className="text-xs text-gray-500">
                    Lower numbers appear first
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Team Member'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
