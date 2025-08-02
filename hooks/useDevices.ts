import { useState, useEffect } from "react";
import useAuthToken from "./useAuthToken";

export interface Device {
  id: number;
  name: string;
  phoneNumber: string;
  organizationId: number;
  createdAt: string;
  isActive: boolean;
}

export const useDevices = (organizationId: number) => {
  const token = useAuthToken();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      setError(null);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/devices?organizationId=${organizationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!response.ok) {
          throw new Error("Chyba při načítání zařízení");
        }

        const data = await response.json();
        setDevices(data.devices);
      } catch (error) {
        console.error("Chyba při načítání zařízení:", error);
        setError("Došlo k chybě při načítání zařízení");
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) {
      fetchDevices();
    }
  }, [organizationId, token]);

  // ✅ Funkce pro aktualizaci zařízení
  const updateDevice = async (id: number, updates: Partial<Device>) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API}/api/devices/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Nepodařilo se aktualizovat zařízení");
      }

      const updated = await response.json();
      setDevices((prev) =>
        prev.map((device) => (device.id === id ? updated.device : device))
      );
      return updated.device;
    } catch (error) {
      console.error("Chyba při aktualizaci zařízení:", error);
      throw error;
    }
  };

  return { devices, loading, error, updateDevice };
};
