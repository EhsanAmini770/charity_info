import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Paperclip, X, Calendar, Eye } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { newsApi } from "@/services/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useCsrf } from "@/hooks/use-csrf";

const newsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  body: z.string().min(10, "Body content must be at least 10 characters"),
  publishDate: z.date(),
  expiryDate: z.date().optional().nullable(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export function AdminNewsEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const [attachments, setAttachments] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { csrfToken, isLoading: isCsrfLoading } = useCsrf();
  const [textContent, setTextContent] = useState<Record<string, { content: string, filename: string }>>({});
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      body: "",
      publishDate: new Date(),
      expiryDate: null,
    },
  });

  const { data: newsData, isLoading: isLoadingNews } = useQuery({
    queryKey: ["adminNews", id],
    queryFn: () => newsApi.getById(id!),
    enabled: isEditing,
  });

  const { data: attachmentsData } = useQuery({
    queryKey: ["newsAttachments", id],
    queryFn: () => newsApi.getAttachments(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && newsData) {
      form.reset({
        title: newsData.title,
        body: newsData.body,
        publishDate: new Date(newsData.publishDate),
        expiryDate: newsData.expiryDate ? new Date(newsData.expiryDate) : null,
      });
    }
  }, [newsData, form, isEditing]);

  useEffect(() => {
    if (attachmentsData?.attachments) {
      setAttachments(attachmentsData.attachments);
    }
  }, [attachmentsData]);

  const createMutation = useMutation({
    mutationFn: async (data: NewsFormValues) => {
      const news = await newsApi.create(data);
      return news;
    },
    onSuccess: async (data) => {
      // If there's a file to upload, upload it automatically
      if (selectedFile) {
        try {
          setIsUploading(true);

          // Create FormData and upload the attachment
          const formData = new FormData();
          formData.append("file", selectedFile);
          await newsApi.uploadAttachment(data._id, formData);

          toast({
            title: "Article created with attachment!",
            description: `"${data.title}" has been created with attachment "${selectedFile.name}".`,
          });

          setSelectedFile(null);
          setIsUploading(false);
        } catch (error) {
          console.error("Error uploading attachment:", error);
          toast({
            variant: "destructive",
            title: "Attachment upload failed",
            description: "Article was created but attachment could not be uploaded. Please try again in edit mode.",
          });
        }
      } else {
        toast({
          title: "Article created successfully!",
          description: `"${data.title}" has been created.`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["adminNews"] });
      navigate("/admin/news");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create article",
        description: error.message || "Something went wrong",
      });
      console.error("Create error:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: NewsFormValues) => newsApi.update(id!, data),
    onSuccess: () => {
      toast({
        title: "Article updated successfully!",
        description: "Your changes have been saved.",
      });
      // Invalidate both the specific news item query and the general news list
      queryClient.invalidateQueries({ queryKey: ["adminNews", id] });
      queryClient.invalidateQueries({ queryKey: ["adminNews"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update article",
        description: `${error}`,
      });
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("_csrf", csrfToken || "");
      console.log("Uploading attachment with CSRF token:", csrfToken);
      return await newsApi.uploadAttachment(id!, formData);
    },
    onSuccess: () => {
      console.log("Attachment upload successful");
      queryClient.invalidateQueries({ queryKey: ["newsAttachments", id] });
      setSelectedFile(null);
    },
    onError: (error) => {
      console.error("Attachment upload error:", error);
      toast({
        variant: "destructive",
        title: "Failed to upload attachment",
        description: `${error}`,
      });
    },
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (attachmentId: string) => newsApi.deleteAttachment(id!, attachmentId),
    onSuccess: () => {
      toast({
        title: "Attachment deleted",
        description: "Attachment has been removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["newsAttachments", id] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete attachment",
        description: `${error}`,
      });
    },
  });

  const onSubmit = async (values: NewsFormValues) => {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAttachmentUpload = async () => {
    if (!isEditing || !selectedFile) {
      console.log("Cannot upload: isEditing=", isEditing, "selectedFile=", selectedFile);
      return;
    }

    console.log("Starting attachment upload for file:", selectedFile.name);
    setIsUploading(true);

    try {
      const result = await uploadAttachmentMutation.mutateAsync(selectedFile);
      console.log("Upload result:", result);

      // Refresh attachments list
      const attachmentsData = await newsApi.getAttachments(id!);
      setAttachments(attachmentsData.attachments || []);

      toast({
        title: "Attachment uploaded successfully",
        description: `"${selectedFile.name}" has been added to the article.`,
      });
    } catch (error) {
      console.error("Error uploading attachment:", error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: `Failed to upload "${selectedFile.name}". Please try again.`,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAttachmentDelete = (attachmentId: string) => {
    if (window.confirm("Are you sure you want to delete this attachment?")) {
      deleteAttachmentMutation.mutate(attachmentId);
    }
  };

  // Function to load text content for an attachment
  const loadTextContent = async (attachmentId: string) => {
    try {
      setIsLoadingContent(true);
      const data = await newsApi.getAttachmentContent(attachmentId);
      setTextContent(prev => ({ ...prev, [attachmentId]: data }));
    } catch (error) {
      console.error('Error fetching text content:', error);
      toast({
        variant: "destructive",
        title: "Failed to load content",
        description: "Could not load the text file content.",
      });
    } finally {
      setIsLoadingContent(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  useEffect(() => {
    if (isEditing && id) {
      // Fetch attachments
      const fetchAttachments = async () => {
        try {
          const data = await newsApi.getAttachments(id);
          if (data?.attachments) {
            setAttachments(data.attachments);

            // Load text content for text files
            data.attachments.forEach((attachment: any) => {
              if (attachment.mimeType === 'text/plain' ||
                  attachment.filename.toLowerCase().endsWith('.txt')) {
                loadTextContent(attachment._id);
              }
            });
          }
        } catch (error) {
          console.error('Error fetching attachments:', error);
        }
      };

      fetchAttachments();
    }
  }, [isEditing, id]);

  if (isLoadingNews && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
        <Button variant="ghost" onClick={() => navigate("/admin/news")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Article" : "Create Article"}</CardTitle>
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
                      <Input placeholder="Enter article title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="body"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter article content"
                        rows={10}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="publishDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Publish Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal flex justify-between"
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <Calendar className="h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className="w-full pl-3 text-left font-normal flex justify-between"
                            >
                              {field.value ? format(field.value, "PPP") : <span>No expiry date</span>}
                              <Calendar className="h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            disabled={(date) => {
                              const publishDate = form.getValues("publishDate");
                              return publishDate && date < publishDate;
                            }}
                          />
                          <div className="p-2 border-t border-border">
                            <Button
                              variant="ghost"
                              className="w-full"
                              onClick={() => {
                                field.onChange(null);
                              }}
                            >
                              Clear date
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Save Article
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/news")}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Attachments</h3>

            <div className="border rounded-md p-4 mb-4">
              <div className="flex items-center">
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  className="flex-1 mr-2"
                />
                {isEditing ? (
                  <Button
                    type="button"
                    onClick={handleAttachmentUpload}
                    disabled={!selectedFile || isUploading}
                  >
                    {isUploading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="mr-2 h-4 w-4" />
                    )}
                    Upload
                  </Button>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    {selectedFile ? (
                      <p>File will be uploaded after article creation</p>
                    ) : (
                      <p>Select a file to upload after creating the article</p>
                    )}
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Selected file: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                </div>
              )}
            </div>

            {isEditing && (
              <>
                {attachments.length > 0 ? (
                  <div className="border rounded-md divide-y">
                    {attachments.map((attachment) => (
                      <div key={attachment._id}>
                        <div className="p-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                            <div>
                              <span className="font-medium">{attachment.filename}</span>
                              <span className="text-sm text-muted-foreground ml-2">
                                ({formatFileSize(attachment.size)})
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleAttachmentDelete(attachment._id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Display text content for text files */}
                        {(attachment.mimeType === 'text/plain' ||
                          attachment.filename.toLowerCase().endsWith('.txt')) && (
                          <div className="px-3 pb-3">
                            {isLoadingContent ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                              </div>
                            ) : textContent[attachment._id] ? (
                              <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-3 rounded-md border max-h-[300px] overflow-y-auto">
                                {textContent[attachment._id].content}
                              </div>
                            ) : (
                              <div className="text-center py-2 text-gray-500 text-sm">
                                Failed to load content.
                              </div>
                            )}
                          </div>
                        )}

                        {/* Display images directly */}
                        {attachment.mimeType.startsWith('image/') && (
                          <div className="px-3 pb-3">
                            <div className="rounded-md overflow-hidden border bg-muted">
                              <img
                                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${attachment._id}/content`}
                                alt={attachment.filename}
                                className="max-w-full h-auto"
                                loading="lazy"
                                crossOrigin="anonymous"
                                onLoad={() => console.log(`Image loaded successfully: ${attachment.filename}`)}
                                onError={(e) => {
                                  console.error(`Failed to load image: ${attachment.filename}`);
                                  console.error(`Image URL: ${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news/attachments/${attachment._id}/content`);
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 border rounded-md text-muted-foreground">
                    <Paperclip className="h-8 w-8 mx-auto mb-2" />
                    <p>No attachments yet</p>
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

export default AdminNewsEditPage;
