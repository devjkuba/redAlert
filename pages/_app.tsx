import Head from 'next/head'
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const checkUserPermissions = (token: string | null) => {
  return token !== null;
};

const protectedRoutes = ['/alert', '/rescueTeams', '/profile', '/logout']; 

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const { pathname } = router;

    if (protectedRoutes.includes(pathname) && !checkUserPermissions(token)) {
      router.replace('/login');
    } else if (checkUserPermissions(token) && pathname === '/') {
      router.replace('/alert');
    }
  }, [router]);

  return (
    <>
      <Head>
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
