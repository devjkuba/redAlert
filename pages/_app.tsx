import Head from 'next/head'
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PushNotifications } from '@capacitor/push-notifications'
import Footer from '@/components/Footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Capacitor } from '@capacitor/core';

const checkUserPermissions = (token: string | null) => {
  return token !== null;
};

const protectedRoutes = ['/alert', '/rescueTeams', '/profile', '/settings', 'settings/notifications', 'settings/users', '/logout']; 

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    const token = localStorage.getItem('token');
    const { pathname } = router;

    if (protectedRoutes.includes(pathname) && !checkUserPermissions(token)) {
      router.replace('/login');
    } else if (checkUserPermissions(token) && pathname === '/') {
      router.replace('/alert');
    }
  }, [router]);

  useEffect(() => {
    const setupPush = async () => {
      if ((window as { Capacitor?: typeof Capacitor }).Capacitor && (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android')) {
        await PushNotifications.requestPermissions()
        await PushNotifications.register()

        PushNotifications.addListener('registration', (token) => {
          console.log('Push registration success:', token.value)
          // Uložení tokenu na server
        })

        PushNotifications.addListener('registrationError', (err) => {
          console.error('Push registration error:', err)
        })

        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push received:', notification)
        })

        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push action performed', notification)
        })
      }
    }

    setupPush()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <Head>
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Component {...pageProps} />
      <Footer />
    </QueryClientProvider>
  );
}
