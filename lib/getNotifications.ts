export interface Notification {
  id: number;
  type: string;
  message: string;
  status: string;
  triggeredById: number;
  organizationId: number;
  createdAt: string;
  triggeredBy: {
    id: number;
    firstName: string;
    lastName: string;
    organizationId: number;
    email: string;
    password: string;
    createdAt: string;
    role: string;
    isActive: boolean;
  };
  triggeredByDevice: {
    name: string;
  }
}

export async function getNotifications(
  token: string | null,
  organizationId: number
): Promise<Notification[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API}/api/notifications?orgId=${organizationId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 401) {
    window.location.href =  '/login';
  }

  if (!response.ok) {
    throw new Error("Error fetching notifications");
  }

  return response.json();
}
