import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AlertTypeData {
  id: number;
  label: string;
  icon: string;
  className?: string;
  order: number;
  organizationId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Fetcher
const fetchAlertTypes = async (orgId: number, token: string | null) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API}/api/alert-types?organizationId=${orgId}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!res.ok) throw new Error("Error fetching alert types");
  const data = await res.json();
  return data as AlertTypeData[];
};

// CRUD hook
export const useAlertTypes = (orgId: number, token: string | null) => {
  const queryClient = useQueryClient();

  // GET list
  const {
    data: alerts,
    isLoading,
    isError,
    error,
  } = useQuery<AlertTypeData[]>({
    queryKey: ["alertTypes", orgId],
    enabled: orgId !== 0 && !!token,
    queryFn: () => fetchAlertTypes(orgId, token),
  });

  type EditAlertInput = { id: number; data: AlertTypeData };

  // POST new alert
  const addAlert = useMutation<AlertTypeData, Error, AlertTypeData>({
    mutationFn: (newAlert: AlertTypeData) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API}/api/alert-types?organizationId=${orgId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newAlert),
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Error creating alert type");
        return res.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertTypes", orgId] });
    },
  });

  // PUT update alert
  const editAlert = useMutation<void, Error, EditAlertInput>({
    mutationFn: ({ id, data }: EditAlertInput) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API}/api/alert-types?id=${id}&organizationId=${orgId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Error updating alert type");
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertTypes", orgId] });
    },
  });

  // DELETE alert
  const removeAlert = useMutation<number, Error, number>({
    mutationFn: (id: number) =>
      fetch(
        `${process.env.NEXT_PUBLIC_API}/api/alert-types?id=${id}&organizationId=${orgId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Error deleting alert type");
        return id;
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertTypes", orgId] });
    },
  });

  // PUT reorder
  const reorderAlerts = useMutation<void, Error, { id: number; order: number }[]>(
    {
      mutationFn: (reorderData) =>
        fetch(
          `${process.env.NEXT_PUBLIC_API}/api/alert-types?organizationId=${orgId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(reorderData),
          }
        ).then((res) => {
          if (!res.ok) throw new Error("Error reordering alert types");
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["alertTypes", orgId] });
      },
    }
  );

  // POST reset
  const resetAlerts = useMutation<AlertTypeData[], Error, void>({
    mutationFn: () =>
      fetch(
        `${process.env.NEXT_PUBLIC_API}/api/alert-types?organizationId=${orgId}&reset=true`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      ).then((res) => {
        if (!res.ok) throw new Error("Error resetting alert types");
        return res.json() as Promise<AlertTypeData[]>;
      }),
    onSuccess: (newList) => {
      queryClient.setQueryData(["alertTypes", orgId], newList);
    },
  });

  return {
    alerts,
    isLoading,
    isError,
    error,
    isResetting: resetAlerts.isPending,
    addAlert: addAlert.mutate,
    editAlert: editAlert.mutate,
    removeAlert: removeAlert.mutate,
    reorderAlerts: reorderAlerts.mutate,
    resetAlerts: resetAlerts.mutate,
  };
};
