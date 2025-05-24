import { useState, useEffect } from "react";
import useAuthToken from "./useAuthToken";

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  isActive: boolean;
}

export const useUsers = (organizationId: number) => {
  const token = useAuthToken();
  const [users, setUsers] = useState<User[]>([]); // Stav pro seznam uživatelů
  const [loading, setLoading] = useState<boolean>(true); // Stav pro načítání
  const [error, setError] = useState<string | null>(null); // Stav pro chyby

  useEffect(() => {
    const fetchUsers = async () => {
      setError(null); // Resetování chybového stavu před načítáním
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/users?organizationId=${organizationId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 401) {
          window.location.href = '/login';
        }

        if (!response.ok) {
          throw new Error('Chyba při načítání uživatelů');
        }

        const data = await response.json();
        setUsers(data.users);
      } catch {
        setError('Došlo k chybě při načítání uživatelů');
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchUsers();
    }
  }, [organizationId]);

  return { users, loading, error };
};
