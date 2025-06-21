
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, X, Plus, Image as ImageIcon, Trash } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { galleryApi } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCsrf } from "@/hooks/use-csrf";
import { ApiError } from "@/components/ui/api-error";

const albumSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().optional(),
});

type AlbumFormValues = z.infer<typeof albumSchema>;

export function AdminGalleryEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [albumImages, setAlbumImages] = useState<any[]>([]);
  const { csrfToken, isLoading: isCsrfLoading } = useCsrf();

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const { data: albumData, isLoading: isLoadingAlbum, error: albumError, refetch } = useQuery({
    queryKey: ["album", id],
    queryFn: () => isEditing ? galleryApi.getAlbumById(id!) : Promise.resolve(null),
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && albumData) {
      form.reset({
        title: albumData.album.title,
        description: albumData.album.description || "",
      });
      setAlbumImages(albumData.images || []);
    }
  }, [albumData, form, isEditing]);

  const createMutation = useMutation({
    mutationFn: async (data: AlbumFormValues) => {
      const album = await galleryApi.createAlbum(data);
      return album;
    },
    onSuccess: async (data) => {
      // If there are images to upload, upload them automatically
      if (uploadedImages.length > 0) {
        try {
          setIsUploading(true);

          // Create FormData for each image and upload
          for (const file of uploadedImages) {
            const formData = new FormData();
            formData.append("image", file);
            formData.append("_csrf", csrfToken || "");
            await galleryApi.uploadImage(data._id, formData);
          }

          toast({
            title: "Album created with images!",
            description: `"${data.title}" has been created with ${uploadedImages.length} image(s).`,
          });

          setUploadedImages([]);
          setIsUploading(false);
        } catch (error) {
          console.error("Error uploading images:", error);
          toast({
            variant: "destructive",
            title: "Images upload failed",
            description: "Album was created but images could not be uploaded. Please try again in edit mode.",
          });
        }
      } else {
        toast({
          title: "Album created successfully!",
          description: `"${data.title}" has been created.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["adminAlbums"] });
      navigate("/admin/gallery");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create album",
        description: error.message || "Something went wrong",
      });
      console.error("Create error:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: AlbumFormValues) => galleryApi.updateAlbum(id!, data),
    onSuccess: () => {
      toast({
        title: "Album updated successfully!",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["adminAlbums"] });
      queryClient.invalidateQueries({ queryKey: ["album", id] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update album",
        description: `${error}`,
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("_csrf", csrfToken || "");
      return await galleryApi.uploadImage(id!, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["album", id] });
    },
    onError: (error) => {
      console.error("Image upload error:", error);
      toast({
        variant: "destructive",
        title: "Failed to upload image",
        description: `${error}`,
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) => galleryApi.deleteImage(imageId),
    onSuccess: () => {
      toast({
        title: "Image deleted",
        description: "Image has been removed from the album.",
      });
      queryClient.invalidateQueries({ queryKey: ["album", id] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete image",
        description: `${error}`,
      });
    },
  });

  const onSubmit = async (values: AlbumFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedImages(Array.from(e.target.files));
    }
  };

  const handleImageUpload = async () => {
    if (!isEditing || uploadedImages.length === 0) {
      console.log("Cannot upload: isEditing=", isEditing, "uploadedImages.length=", uploadedImages.length);
      return;
    }

    console.log("Starting image upload for", uploadedImages.length, "files");
    setIsUploading(true);

    try {
      const uploadResults = [];
      for (const file of uploadedImages) {
        console.log(`Uploading file: ${file.name} (${file.size} bytes)`);
        const result = await uploadImageMutation.mutateAsync(file);
        uploadResults.push(result);
      }

      console.log("All uploads completed:", uploadResults);
      setUploadedImages([]);

      // Refresh album data to get updated images
      console.log("Refreshing album data...");
      const updatedAlbumData = await galleryApi.getAlbumById(id!);
      console.log("Updated album data:", updatedAlbumData);
      setAlbumImages(updatedAlbumData.images || []);

      toast({
        title: "Images uploaded successfully",
        description: `${uploadedImages.length} image(s) have been added to the album.`,
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Failed to upload one or more images. Please try again.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = (imageId: string) => {
    if (window.confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate(imageId);
    }
  };

  if (isLoadingAlbum && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (albumError && isEditing) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/admin/gallery")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Albums
          </Button>
        </div>
        <ApiError
          title="Failed to load album"
          error={albumError}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (isCsrfLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Setting up secure connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/gallery")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Albums
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Album" : "Create Album"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter album title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter album description (optional)"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="mr-2"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                Save Album
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/gallery")}
              >
                Cancel
              </Button>
            </form>
          </Form>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Album Images</h3>

            <div className="border rounded-md p-4 mb-4">
              <div className="flex items-center mb-4">
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="flex-1 mr-2"
                />
                {isEditing ? (
                  <Button
                    type="button"
                    onClick={handleImageUpload}
                    disabled={uploadedImages.length === 0 || isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Upload
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {uploadedImages.length > 0 ? (
                      <p>Images will be uploaded after album creation</p>
                    ) : (
                      <p>Select images to upload after creating the album</p>
                    )}
                  </div>
                )}
              </div>

              {uploadedImages.length > 0 && (
                <div className="mb-4 text-sm text-muted-foreground">
                  {uploadedImages.length} file(s) selected for upload
                </div>
              )}
            </div>

            {isEditing && (
              <>
                {albumImages.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {albumImages.map((image) => (
                      <div key={image._id} className="relative group">
                        <div className="aspect-square rounded-md overflow-hidden border bg-muted">
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/gallery/${image.albumId}/${image.filename}`}
                            alt="Gallery image"
                            className="w-full h-full object-cover"
                            loading="lazy"
                            crossOrigin="anonymous"
                            onLoad={() => console.log(`Image loaded successfully: ${image.filename}`)}
                            onError={(e) => {
                              console.error(`Failed to load image: ${image.filename}`);
                              console.error(`Image URL: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/gallery/${image.albumId}/${image.filename}`);
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleImageDelete(image._id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center border rounded-md p-8">
                    <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No images in this album yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminGalleryEditPage;
