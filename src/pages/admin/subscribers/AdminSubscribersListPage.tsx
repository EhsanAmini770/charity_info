import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Loader, Search, Trash2, Download, RefreshCw, CheckCircle, XCircle, Filter } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { subscribersApi } from "@/services/api";
import { ApiError } from "@/components/ui/api-error";
import { useCsrf } from "@/hooks/use-csrf";

export function AdminSubscribersListPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isSearching, setIsSearching] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subscriberToDelete, setSubscriberToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { csrfToken, isLoading: isCsrfLoading } = useCsrf();

  // Fetch subscribers
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["subscribers", page, limit, filterStatus, isSearching ? searchTerm : null],
    queryFn: () => subscribersApi.getAll(page, limit, filterStatus, isSearching ? searchTerm : ""),
  });

  // Delete subscriber mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscribersApi.deleteSubscriber(id, csrfToken),
    onSuccess: () => {
      toast({
        title: "Subscriber deleted",
        description: "The subscriber has been successfully deleted.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["subscribers"] });
      setDeleteDialogOpen(false);
      setSubscriberToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscriber. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle search
  const handleSearch = () => {
    setIsSearching(true);
    setPage(1);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setIsSearching(false);
    setPage(1);
  };

  // Handle filter change
  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setPage(1);
  };

  // Handle delete
  const handleDelete = (id: string) => {
    setSubscriberToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (subscriberToDelete) {
      deleteMutation.mutate(subscriberToDelete);
    }
  };

  // Export subscribers as CSV
  const exportSubscribers = () => {
    if (!data || !data.subscribers || data.subscribers.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no subscribers to export.",
        variant: "destructive",
      });
      return;
    }

    // Create CSV content
    const headers = ["Name", "Email", "Status", "Subscribed At", "Unsubscribed At"];
    const csvContent = [
      headers.join(","),
      ...data.subscribers.map((subscriber: any) => [
        subscriber.name ? `"${subscriber.name.replace(/"/g, '""')}"` : "",
        `"${subscriber.email.replace(/"/g, '""')}"`,
        subscriber.subscribed ? "Active" : "Unsubscribed",
        subscriber.subscribedAt ? format(new Date(subscriber.subscribedAt), "yyyy-MM-dd HH:mm:ss") : "",
        subscriber.unsubscribedAt ? format(new Date(subscriber.unsubscribedAt), "yyyy-MM-dd HH:mm:ss") : "",
      ].join(","))
    ].join("\n");

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `subscribers_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate pagination
  const totalPages = data?.pagination?.pages || 1;
  const paginationItems = [];
  
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= page - 1 && i <= page + 1)
    ) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={page === i}
            onClick={() => setPage(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    } else if (i === page - 2 || i === page + 2) {
      paginationItems.push(
        <PaginationItem key={i}>
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
  }

  if (isError) {
    return <ApiError error={error as Error} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Subscribers Management</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Subscribers List</CardTitle>
          <CardDescription>
            Manage newsletter subscribers and their subscription status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by email or name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button
                variant="secondary"
                onClick={handleSearch}
                disabled={!searchTerm}
              >
                Search
              </Button>
              {isSearching && (
                <Button
                  variant="ghost"
                  onClick={clearSearch}
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <div className="w-40">
                <Select
                  value={filterStatus}
                  onValueChange={handleFilterChange}
                >
                  <SelectTrigger>
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscribers</SelectItem>
                    <SelectItem value="active">Active Only</SelectItem>
                    <SelectItem value="inactive">Unsubscribed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                variant="outline"
                onClick={exportSubscribers}
                disabled={isLoading || !data?.subscribers?.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : data?.subscribers?.length ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Subscribed At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.subscribers.map((subscriber: any) => (
                      <TableRow key={subscriber._id}>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || "-"}</TableCell>
                        <TableCell>
                          {subscriber.subscribed ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50 flex items-center w-fit">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50 flex items-center w-fit">
                              <XCircle className="h-3 w-3 mr-1" />
                              Unsubscribed
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {subscriber.subscribedAt
                            ? format(new Date(subscriber.subscribedAt), "MMM d, yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(subscriber._id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {data.subscribers.length} of {data.pagination.total} subscribers
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                      />
                    </PaginationItem>
                    {paginationItems}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {isSearching
                ? "No subscribers found matching your search criteria."
                : "No subscribers found."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscriber? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
