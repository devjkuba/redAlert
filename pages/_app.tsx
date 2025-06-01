import Head from "next/head";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { PushNotifications } from "@capacitor/push-notifications";
import Footer from "@/components/Footer";
import { QueryClientProvider } from "@tanstack/react-query";
import { Capacitor } from "@capacitor/core";

const checkUserPermissions = (token: string | null) => {
  return token !== null;
};

const protectedRoutes = [
  "/alert",
  "/rescueTeams",
  "/profile",
  "/monitoring",
  "/settings",
  "settings/notifications",
  "settings/users",
  "settings/edit/[id]",
  "/logout",
];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const { pathname } = router;

    if (protectedRoutes.includes(pathname) && !checkUserPermissions(token)) {
      router.replace("/login");
    } else if (checkUserPermissions(token) && pathname === "/") {
      router.replace("/alert");
    }
  }, [router]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.log('Service Worker registration failed', err));
    }
  }, []);

  useEffect(() => {
    const setupPush = async () => {
      if (
        (window as { Capacitor?: typeof Capacitor }).Capacitor &&
        (Capacitor.getPlatform() === "ios" ||
          Capacitor.getPlatform() === "android")
      ) {
        await PushNotifications.requestPermissions();
        await PushNotifications.register();

        PushNotifications.addListener("registration", (token) => {
          console.log("Push registration success:", token.value);
          // Uložení tokenu na server
        });

        PushNotifications.addListener("registrationError", (err) => {
          console.error("Push registration error:", err);
        });

        PushNotifications.addListener(
          "pushNotificationReceived",
          (notification) => {
            console.log("Push received:", notification);
          }
        );

        PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (notification) => {
            console.log("Push action performed", notification);
          }
        );
      }
    };

    setupPush();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <Head>
          <meta
            name="viewport"
            content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
          />
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" href="/icons/icon-48.webp" />
          <link rel="apple-touch-icon" href="/icons/icon-192.webp" />

        </Head>
        <Component {...pageProps} />
        <Footer />
      </I18nextProvider>
    </QueryClientProvider>
  );
}
