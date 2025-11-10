import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCheck, UserX, Shield, User } from 'lucide-react';
import { toast } from 'sonner';

export const UsersManagement = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch user roles separately
      const userIds = data?.map(profile => profile.user_id) || [];
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", userIds);

      // Merge roles with profiles
      const profilesWithRoles = data?.map(profile => ({
        ...profile,
        roles: roles?.filter(r => r.user_id === profile.user_id) || []
      }));

      return profilesWithRoles;
    },
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, isCurrentlyAdmin }: { userId: string; isCurrentlyAdmin: boolean }) => {
      if (isCurrentlyAdmin) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", "admin");

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role: "admin" });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Rôle modifié");
    },
    onError: () => {
      toast.error("Erreur lors de la modification");
    },
  });

  if (isLoading) {
    return <div className="animate-pulse">Chargement...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date d'inscription</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {users?.map((user) => {
              const isAdmin = user.roles?.some((r: any) => r.role === "admin");
              return (
                <TableRow key={user.id}>
                  <TableCell>
                    {format(new Date(user.created_at), "dd MMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name || "Anonyme"}</TableCell>
                  <TableCell>{user.city || "-"}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1 text-primary font-semibold">
                        <Shield className="h-4 w-4" />
                        Admin
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Utilisateur</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={isAdmin ? "destructive" : "default"}
                      size="sm"
                      onClick={() =>
                        toggleAdmin.mutate({
                          userId: user.user_id,
                          isCurrentlyAdmin: isAdmin,
                        })
                      }
                      disabled={toggleAdmin.isPending}
                    >
                      {isAdmin ? (
                        <>
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Retirer admin
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4 mr-2" />
                          Promouvoir admin
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
