export async function getNotifications(organizationId: number) {
    const response = await fetch(`http://localhost:4000/api/notifications?orgId=${organizationId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
  
    if (!response.ok) {
      throw new Error('Error fetching notifications');
    }
  
    return response.json();
  }