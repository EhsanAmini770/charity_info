import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { galleryApi } from "@/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCsrf } from "@/hooks/use-csrf";

const albumSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  description: z.string().optional(),
});

type AlbumFormValues = z.infer<typeof albumSchema>;

export function AdminGalleryCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const { csrfToken, isLoading: isCsrfLoading } = useCsrf();

  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AlbumFormValues) => {
      const album = await galleryApi.createAlbum(data);
      return album;
    },
    onSuccess: async (data) => {
      // If there are images to upload, upload them automatically
      if (uploadedImages.length > 0) {
        try {
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

  const onSubmit = async (values: AlbumFormValues) => {
    createMutation.mutate(values);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedImages(Array.from(e.target.files));
    }
  };

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
          <CardTitle>Create Album</CardTitle>
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
                    <div className="text-sm text-muted-foreground">
                      {uploadedImages.length > 0 ? (
                        <p>Images will be uploaded after album creation</p>
                      ) : (
                        <p>Select images to upload after creating the album</p>
                      )}
                    </div>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="mb-4 text-sm text-muted-foreground">
                      {uploadedImages.length} file(s) selected for upload
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="mr-2"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                Create Album
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
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminGalleryCreatePage;