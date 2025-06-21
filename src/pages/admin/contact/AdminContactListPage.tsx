import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Trash2,
  Search,
  Filter,
  Mail,
  CheckCircle,
  Clock,
  Archive,
  RefreshCw,
  Loader
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { contactApi, ContactMessage } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function AdminContactListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [contactToDelete, setContactToDelete] = useState<ContactMessage | null>(null);
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(null);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch contact messages
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-contacts", page, limit, statusFilter],
    queryFn: () => contactApi.getAll(page, limit, statusFilter),
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'new' | 'read' | 'replied' | 'archived' }) =>
      contactApi.updateStatus(id, status),
    onSuccess: (data) => {
      toast({
        title: "Status updated",
        description: `The message status has been updated to "${data.contact.status}".`,
      });
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });

      // If we're viewing a message and updating its status, update the selected contact
      if (selectedContact && selectedContact._id === data.contact._id) {
        setSelectedContact(data.contact);
      }
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update message status. Please try again.",
      });
      console.error("Update status error:", error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactApi.delete(id),
    onSuccess: () => {
      toast({
        title: "Message deleted",
        description: "The contact message has been deleted successfully.",
      });
      setContactToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete message. Please try again.",
      });
      console.error("Delete error:", error);
    },
  });

  // Handle status change
  const handleStatusChange = (contact: ContactMessage, status: 'new' | 'read' | 'replied' | 'archived') => {
    updateStatusMutation.mutate({ id: contact._id, status });
  };

  // Handle delete
  const handleDelete = () => {
    if (contactToDelete) {
      deleteMutation.mutate(contactToDelete._id);
    }
  };

  // Handle view message
  const handleViewMessage = (contact: ContactMessage) => {
    setSelectedContact(contact);
    // If the message is new, mark it as read
    if (contact.status === 'new') {
      updateStatusMutation.mutate({ id: contact._id, status: 'read' });
    }
  };

  // Filter contacts based on search term
  const filteredContacts = data?.contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="default" className="bg-blue-500">New</Badge>;
      case 'read':
        return <Badge variant="outline" className="border-green-500 text-green-500">Read</Badge>;
      case 'replied':
        return <Badge variant="outline" className="border-purple-500 text-purple-500">Replied</Badge>;
      case 'archived':
        return <Badge variant="outline" className="border-gray-500 text-gray-500">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'read':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'replied':
        return <RefreshCw className="h-4 w-4 text-purple-500" />;
      case 'archived':
        return <Archive className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 p-4 rounded-md">
          <h3 className="text-red-800 font-medium">Error loading contact messages</h3>
          <p className="text-red-700 mt-2">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Contact Messages</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Search messages..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              {statusFilter ? `Status: ${statusFilter}` : "Filter by Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter("")}>
              All Messages
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("new")}>
              New
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("read")}>
              Read
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("replied")}>
              Replied
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("archived")}>
              Archived
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
          <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No messages found</h3>
          <p className="text-gray-500">
            {searchTerm
              ? "No messages match your search criteria."
              : statusFilter
              ? `No messages with status "${statusFilter}".`
              : "There are no contact messages yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact._id} className={contact.status === 'new' ? 'bg-blue-50' : ''}>
                    <TableCell>{getStatusBadge(contact.status)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] truncate">{contact.subject}</div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(contact.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMessage(contact)}
                        >
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Status
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(contact, 'new')}
                              disabled={contact.status === 'new' || updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending &&
                               updateStatusMutation.variables?.id === contact._id &&
                               updateStatusMutation.variables?.status === 'new' ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Clock className="mr-2 h-4 w-4" />
                              )}
                              Mark as New
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(contact, 'read')}
                              disabled={contact.status === 'read' || updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending &&
                               updateStatusMutation.variables?.id === contact._id &&
                               updateStatusMutation.variables?.status === 'read' ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                              )}
                              Mark as Read
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(contact, 'replied')}
                              disabled={contact.status === 'replied' || updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending &&
                               updateStatusMutation.variables?.id === contact._id &&
                               updateStatusMutation.variables?.status === 'replied' ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="mr-2 h-4 w-4" />
                              )}
                              Mark as Replied
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(contact, 'archived')}
                              disabled={contact.status === 'archived' || updateStatusMutation.isPending}
                            >
                              {updateStatusMutation.isPending &&
                               updateStatusMutation.variables?.id === contact._id &&
                               updateStatusMutation.variables?.status === 'archived' ? (
                                <Loader className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Archive className="mr-2 h-4 w-4" />
                              )}
                              Archive
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setContactToDelete(contact)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    aria-disabled={page === 1}
                    className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((pageNum) => {
                  // Show current page, first, last, and pages around current
                  const shouldShow =
                    pageNum === 1 ||
                    pageNum === data.pagination.pages ||
                    (pageNum >= page - 1 && pageNum <= page + 1);

                  // Show ellipsis for gaps
                  const showEllipsisBefore = pageNum === 2 && page > 3;
                  const showEllipsisAfter = pageNum === data.pagination.pages - 1 && page < data.pagination.pages - 2;

                  if (showEllipsisBefore) {
                    return (
                      <PaginationItem key={`ellipsis-before`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (showEllipsisAfter) {
                    return (
                      <PaginationItem key={`ellipsis-after`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  if (shouldShow) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(pageNum);
                          }}
                          isActive={pageNum === page}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < data.pagination.pages) setPage(page + 1);
                    }}
                    aria-disabled={page === data.pagination.pages}
                    className={page === data.pagination.pages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact message from {contactToDelete?.name}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Message Dialog */}
      <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {selectedContact?.subject}
            </DialogTitle>
            <DialogDescription className="flex items-center justify-between">
              <div>
                From: <span className="font-medium">{selectedContact?.name}</span> ({selectedContact?.email})
              </div>
              <div className="flex items-center gap-2">
                {selectedContact && getStatusIcon(selectedContact.status)}
                <span className="text-sm">
                  {selectedContact && format(new Date(selectedContact.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 border-t pt-4">
            <div className="whitespace-pre-wrap">{selectedContact?.message}</div>
          </div>

          <DialogFooter className="flex justify-between items-center gap-4 mt-6">
            <div className="flex-1">
              {selectedContact && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact, 'read')}
                    disabled={selectedContact.status === 'read' || updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'read' ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact, 'replied')}
                    disabled={selectedContact.status === 'replied' || updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'replied' ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Mark as Replied
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusChange(selectedContact, 'archived')}
                    disabled={selectedContact.status === 'archived' || updateStatusMutation.isPending}
                  >
                    {updateStatusMutation.isPending && updateStatusMutation.variables?.status === 'archived' ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Archive className="mr-2 h-4 w-4" />
                    )}
                    Archive
                  </Button>
                </div>
              )}
            </div>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminContactListPage;
