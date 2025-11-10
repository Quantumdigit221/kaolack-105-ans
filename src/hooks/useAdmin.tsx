import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

export const useAdmin = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const checkAdminStatus = () => {
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Vérifier si l'utilisateur a le rôle admin
      const adminStatus = user.role === 'admin';
      setIsAdmin(adminStatus);
      setLoading(false);
    };

    checkAdminStatus();
  }, [user, isAuthenticated]);

  return { isAdmin, loading };
};
