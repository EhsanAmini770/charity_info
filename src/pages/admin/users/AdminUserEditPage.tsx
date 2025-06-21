
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { userApi } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCsrf } from "@/hooks/use-csrf";
import { UserFormValues } from "@/types/user";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Define the validation schema
const userSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must not exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal('')),
  role: z.enum(["super-admin", "editor"])
});

export function AdminUserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const { csrfToken, isLoading: isCsrfLoading } = useCsrf();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      password: "",
      role: "editor",
    },
  });

  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["adminUser", id],
    queryFn: () => isEditing ? userApi.getById(id!) : Promise.resolve(null),
    enabled: isEditing,
  });

  useEffect(() => {
    if (isEditing && userData) {
      form.reset({
        username: userData.username,
        password: "", // Don't populate password field for security
        role: userData.role as "super-admin" | "editor",
      });
    }
  }, [userData, form, isEditing]);

  const createMutation = useMutation({
    mutationFn: async (data: UserFormValues) => {
      const user = await userApi.create(data);
      return user;
    },
    onSuccess: () => {
      toast({
        title: "User created successfully!",
        description: `User "${form.getValues().username}" has been created.`,
      });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      navigate("/admin/users");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error.message || "Something went wrong",
      });
      console.error("Create error:", error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UserFormValues) => userApi.update(id!, data),
    onSuccess: () => {
      toast({
        title: "User updated successfully!",
        description: "Your changes have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      queryClient.invalidateQueries({ queryKey: ["adminUser", id] });
      navigate("/admin/users");
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Failed to update user",
        description: `${error}`,
      });
    },
  });

  const onSubmit = async (values: UserFormValues) => {
    // If editing and password is empty, remove it from the payload
    if (isEditing && (!values.password || values.password.trim() === "")) {
      const { password, ...dataWithoutPassword } = values;
      if (isEditing) {
        updateMutation.mutate(dataWithoutPassword as UserFormValues);
      }
    } else {
      if (isEditing) {
        updateMutation.mutate(values);
      } else {
        createMutation.mutate(values);
      }
    }
  };

  if (isLoadingUser && isEditing) {
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
        <Button variant="ghost" onClick={() => navigate("/admin/users")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Users
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit User" : "Create User"}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormDescription>
                      Username can only contain letters, numbers, underscores and hyphens.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isEditing ? "New Password (leave empty to keep current)" : "Password"}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder={isEditing ? "Enter new password (optional)" : "Enter password"}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEditing ?
                        "Leave this field empty if you don't want to change the password." :
                        "Password must be at least 6 characters long."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="super-admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Editors can manage content. Super Admins can manage users and have full access.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update User" : "Create User"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/admin/users")}
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

export default AdminUserEditPage;
