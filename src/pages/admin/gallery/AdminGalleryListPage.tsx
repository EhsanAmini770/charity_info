
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash, Loader, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { galleryApi } from "@/services/api";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
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

export function AdminGalleryListPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminAlbums"],
    queryFn: galleryApi.getAllAlbums,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => galleryApi.deleteAlbum(id),
    onSuccess: () => {
      toast({
        title: "Album deleted",
        description: "The album has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["adminAlbums"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete album",
        description: `${error}`,
      });
    },
  });

  const handleDeleteClick = (albumId: string) => {
    setAlbumToDelete(albumId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (albumToDelete) {
      deleteMutation.mutate(albumToDelete);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gallery Management</h1>
        <Button asChild>
          <Link to="/admin/gallery/create">
            <Plus className="mr-2 h-4 w-4" /> Create Album
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
            <p className="text-destructive mb-4">Failed to load albums.</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["adminAlbums"] })}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Albums</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Images</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.albums?.length > 0 ? (
                    data.albums.map((album: any) => (
                      <TableRow key={album._id}>
                        <TableCell className="font-medium">{album.title}</TableCell>
                        <TableCell>
                          {format(new Date(album.createdAt), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>{album.imageCount || 0}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/admin/gallery/edit/${album._id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(album._id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No albums found. Create your first album.
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
              This will permanently delete the album and all its images.
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

export default AdminGalleryListPage;
