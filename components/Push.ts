const PUBLIC_VAPID_KEY = process.env.NEXT_PRIVATE_KEY ?? '';

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

  export default subscribeToPush;