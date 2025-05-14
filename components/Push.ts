const PUBLIC_VAPID_KEY = urlBase64ToUint8Array(process.env.NEXT_PUBLIC_KEY);

const subscribeToPush = async (userId: number, token: string) => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: PUBLIC_VAPID_KEY,
    });
  
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.toJSON().keys,
      }),
      credentials: 'include',
    });
  };

  export function urlBase64ToUint8Array(base64String?: string): Uint8Array {
    if (!base64String) {
      throw new Error("Base64 string is required");
    }
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
  
    return outputArray;
  }

  export default subscribeToPush;