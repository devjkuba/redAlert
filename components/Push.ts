const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_KEY;

const subscribeToPush = async (userId: number, token: string) => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
    });

    const rawKey = subscription.getKey('p256dh');
    const rawAuth = subscription.getKey('auth');

    const p256dh = rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : '';
    const auth = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : '';
  
    await fetch(`${process.env.NEXT_PUBLIC_API}api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh,
          auth,
        },
      }),
      credentials: 'include',
    });
  };

  export function urlBase64ToUint8Array(base64String?: string): Uint8Array {
    if (!base64String) {
      throw new Error("Base64 string is required");
    }
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
  
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
  }

  export default subscribeToPush;