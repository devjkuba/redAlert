import { useEffect, useState } from "react";
import useAuthToken from "./useAuthToken";

export const useOrganizations = () => {
  const token = useAuthToken();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!token) return;

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/adminOrganizations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Chyba při načítání organizací");
        }

        const data = await response.json();
        setOrganizations(data);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Chyba při načítání organizací");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [token]);

  return { organizations, loading, error };
};
