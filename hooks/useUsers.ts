import { useState, useEffect } from "react";

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
  const [users, setUsers] = useState<User[]>([]); // Stav pro seznam uživatelů
  const [loading, setLoading] = useState<boolean>(true); // Stav pro načítání
  const [error, setError] = useState<string | null>(null); // Stav pro chyby

  useEffect(() => {
    const fetchUsers = async () => {
      setError(null); // Resetování chybového stavu před načítáním
      try {
        const response = await fetch(`http://localhost:4000/api/users?organizationId=${organizationId}`);
        
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
