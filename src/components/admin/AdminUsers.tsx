import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const AdminUsers = () => {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      return response.data.users;
    }
  });

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, isCurrentlyAdmin }: { userId: number; isCurrentlyAdmin: boolean }) => {
      const newRole = isCurrentlyAdmin ? 'user' : 'admin';
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Statut administrateur modifié");
    },
    onError: (error) => {
      console.error("Error toggling admin:", error);
      toast.error("Erreur lors de la modification");
    }
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des utilisateurs</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user: any) => {
              const isAdmin = user.role === 'admin' || user.is_admin;
              
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.full_name || user.first_name + ' ' + user.last_name || "Non défini"}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <Badge className="bg-gradient-to-r from-primary to-accent">
                        <Shield className="h-3 w-3 mr-1" />
                        Administrateur
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <User className="h-3 w-3 mr-1" />
                        Utilisateur
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant={isAdmin ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleAdmin.mutate({ userId: user.id, isCurrentlyAdmin: isAdmin })}
                    >
                      {isAdmin ? "Retirer admin" : "Promouvoir admin"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default AdminUsers;
export { AdminUsers };
