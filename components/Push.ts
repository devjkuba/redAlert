const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_KEY;

interface SubscribeParams {
  token: string;
  userId?: number;
  deviceId?: number;
}

const subscribeToPush = async ({ token, userId, deviceId }: SubscribeParams) => {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY) as BufferSource,
    });

    const rawKey = subscription.getKey('p256dh');
    const rawAuth = subscription.getKey('auth');

    const p256dh = rawKey ? btoa(String.fromCharCode(...new Uint8Array(rawKey))) : '';
    const auth = rawAuth ? btoa(String.fromCharCode(...new Uint8Array(rawAuth))) : '';

    const body: {
      endpoint: string;
      keys: { p256dh: string; auth: string };
      userId?: number;
      deviceId?: number;
    } = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh,
        auth,
      },
    };

    if (userId) body.userId = userId;
    if (deviceId) body.deviceId = deviceId;
  
    await fetch(`${process.env.NEXT_PUBLIC_API}/api/push/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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