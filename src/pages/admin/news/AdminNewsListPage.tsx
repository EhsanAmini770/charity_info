
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash, Loader, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { newsApi } from "@/services/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

export function AdminNewsListPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminNews"],
    queryFn: () => newsApi.getAll(1, 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => newsApi.delete(id),
    onSuccess: () => {
      toast({
        title: "Article deleted",
        description: "The article has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["adminNews"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete article",
        description: `${error}`,
      });
    },
  });

  const handleDeleteClick = (newsId: string) => {
    setNewsToDelete(newsId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (newsToDelete) {
      deleteMutation.mutate(newsToDelete);
      setDeleteDialogOpen(false);
    }
  };

  // Check if a news article is published based on dates
  const isPublished = (article: any) => {
    const now = new Date();
    const publishDate = new Date(article.publishDate);
    const expiryDate = article.expiryDate ? new Date(article.expiryDate) : null;
    
    return publishDate <= now && (!expiryDate || expiryDate > now);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">News Management</h1>
        <Button asChild>
          <Link to="/admin/news/create">
            <Plus className="mr-2 h-4 w-4" /> Create Article
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <p className="text-destructive mb-4">Failed to load news articles.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminNews"] })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.news?.length > 0 ? (
                    data.news.map((article: any) => (
                      <TableRow key={article._id}>
                        <TableCell className="font-medium">
                          {article.title}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {format(new Date(article.publishDate), "MMM d, yyyy")}
                          </div>
                          {article.expiryDate && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Expires: {format(new Date(article.expiryDate), "MMM d, yyyy")}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={isPublished(article) ? "default" : "outline"}>
                            {isPublished(article) ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>{article.author?.username || "System"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/news/edit/${article._id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(article._id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No articles found. Create your first article.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the article and all its attachments.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminNewsListPage;
