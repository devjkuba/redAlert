import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface EmergencyServiceData {
  number: string;
  id: number;
  organizationId: number;
  createdAt: Date;
  label: string;
  icon: string;
  iconColor?: string;
  hasSms: boolean;
  updatedAt: Date;
  order: number;
}

// Fetcher
const fetchServices = async (orgId: number, token: string | null) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/api/emergency-services?organizationId=${orgId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Error fetching services");
  return res.json();
};

// CRUD hook
export const useEmergencyServices = (orgId: number, token: string | null) => {
  const queryClient = useQueryClient();

   const enabled = !!orgId && !!token;

  // Načtení seznamu služeb
  const {
    data: services,
    isLoading,
    isError,
    error,
  } = useQuery<EmergencyServiceData[]>({
    queryKey: ["emergencyServices", orgId],
    queryFn: () => fetchServices(orgId, token),
    enabled,
  });

  type EditServiceInput = { id: number; data: EmergencyServiceData };

  const addService = useMutation<
    EmergencyServiceData,
    Error,
    EmergencyServiceData
  >({
    mutationFn: (newService: EmergencyServiceData) =>
      fetch(`${process.env.NEXT_PUBLIC_API}/api/emergency-services?organizationId=${orgId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newService),
      }).then((res) => {
        if (!res.ok) throw new Error("Error creating service");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyServices", orgId] });
    },
  });

  const editService = useMutation<void, Error, EditServiceInput>({
    mutationFn: ({ id, data }: EditServiceInput) =>
      fetch(`${process.env.NEXT_PUBLIC_API}/api/emergency-services?id=${id}&organizationId=${orgId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Error updating service");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyServices", orgId] });
    },
  });

  // Mutace: smazání
  const removeService = useMutation<number, Error, number>({
    mutationFn: (id: number) =>
      fetch(`${process.env.NEXT_PUBLIC_API}/api/emergency-services?id=${id}&organizationId=${orgId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        if (!res.ok) throw new Error("Error deleting service");
        return id;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyServices", orgId] });
    },
  });

  const reorderServices = useMutation<void, Error, { id: number; order: number }[]>({
    mutationFn: (reorderData) =>
      fetch(`${process.env.NEXT_PUBLIC_API}/api/emergency-services?organizationId=${orgId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reorderData),
      }).then((res) => {
        if (!res.ok) throw new Error("Error reordering services");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergencyServices", orgId] });
    },
  });

  const resetServices = useMutation<EmergencyServiceData[], Error, void>({
    mutationFn: () =>
      fetch(
        `${process.env.NEXT_PUBLIC_API}/api/emergency-services?organizationId=${orgId}&reset=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Error resetting services");
        return res.json() as Promise<EmergencyServiceData[]>;
      }),
    onSuccess: (newList) => {
      // Aktualizujeme cache přímo na nový seznam
      queryClient.setQueryData(
        ["emergencyServices", orgId],
        newList
      );
    },
  });

  return {
    services,
    isLoading,
    isError,
    error,
    isResetting: resetServices.isPending,
    addService: addService.mutate,
    editService: editService.mutate,
    removeService: removeService.mutate,
    reorderServices: reorderServices.mutate,
    resetServices: resetServices.mutate,      
  };
};
