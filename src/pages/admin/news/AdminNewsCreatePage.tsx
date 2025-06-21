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
import { newsApi } from "@/services/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCsrf } from "@/hooks/use-csrf";

const newsSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200, "Title must not exceed 200 characters"),
  body: z.string().min(10, "Body content must be at least 10 characters"),
  publishDate: z.date(),
  expiryDate: z.date().optional().nullable(),
});

type NewsFormValues = z.infer<typeof newsSchema>;

export function AdminNewsCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { csrfToken, isLoading: isCsrfLoading } = useCsrf();

  const form = useForm<NewsFormValues>({
    resolver: zodResolver(newsSchema),
    defaultValues: {
      title: "",
      body: "",
      publishDate: new Date(),
      expiryDate: null,
    },
  });

  const [isUploading, setIsUploading] = useState(false);

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
          formData.append("_csrf", csrfToken || "");

          console.log("Uploading attachment with CSRF token:", csrfToken);
          await newsApi.uploadAttachment(data._id, formData);

          toast({
            title: "Article created with attachment!",
            description: `"${data.title}" has been created with attachment "${selectedFile.name}".`,
          });

          setSelectedFile(null);
        } catch (error) {
          console.error("Error uploading attachment:", error);
          toast({
            variant: "destructive",
            title: "Attachment upload failed",
            description: "Article was created but attachment could not be uploaded. Please try again in edit mode.",
          });
        } finally {
          setIsUploading(false);
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

  const onSubmit = async (values: NewsFormValues) => {
    createMutation.mutate(values);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
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
        <Button variant="ghost" onClick={() => navigate("/admin/news")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to News
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Article</CardTitle>
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

              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Attachment</h3>
                <div className="border rounded-md p-4 mb-4">
                  <div className="flex items-center">
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      className="flex-1 mr-2"
                    />
                    <div className="text-sm text-muted-foreground">
                      {selectedFile ? (
                        <p>File will be uploaded after article creation</p>
                      ) : (
                        <p>Select a file to upload after creating the article</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  Create Article
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
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminNewsCreatePage;
