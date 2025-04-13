
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
}

export async function getNotifications(organizationId: number): Promise<Notification[]> {
    const response = await fetch(`http://localhost:4000/api/notifications?orgId=${organizationId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  
    if (!response.ok) {
      throw new Error('Error fetching notifications');
    }
  
    return response.json();
  }