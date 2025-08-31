import Navbar from "@/components/Navbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Spinner } from "@/components/ui/spinner";
import useAuthToken from "@/hooks/useAuthToken";
import { Organization } from "@/hooks/useUser";
import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Notification = {
  id: number;
  type: string;
  message: string;
  status: string;
  createdAt: string;
  organizationId: number;
};

let socket: Socket | null = null;

export default function Monitoring() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [notifications, setNotifications] = useState<
    Record<number, Notification[]>
  >({});
  const [loadingNotifications, setLoadingNotifications] = useState<
    Record<number, boolean>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthToken();

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setIsLoading(true);

      try {
        // 1️⃣ Načíst organizace, které sledujeme
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/adminOrganizations`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();

        const orgs = data?.filter(
          (org: Organization) => org.watching.length > 0
        );
        setOrganizations(orgs);

        // 2️⃣ Připojit socket jen jednou
        if (!socket) {
          socket = io(process.env.NEXT_PUBLIC_API!, {
            transports: ["websocket"],
            auth: { token },
          });
        }

        // 3️⃣ Přihlásit se do místností pro všechny sledované organizace
        orgs.forEach((org: Organization) => {
          org.watching.forEach((watched) => {
            socket?.emit("join", `org-${watched.id}`);
          });
        });

        const initialLoading: Record<number, boolean> = {};
        orgs.forEach((org: { watching: { id: number }[] }) => {
          org.watching.forEach((watched) => {
            initialLoading[watched.id] = true;
          });
        });
        setLoadingNotifications(initialLoading);

        // 4️⃣ Načíst historii notifikací z DB
        const allNotifications: Record<number, Notification[]> = {};
        for (const org of orgs) {
          for (const watched of org.watching) {
            const notifRes = await fetch(
              `${process.env.NEXT_PUBLIC_API}/api/notifications?orgId=${watched.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            const notifData: Notification[] = notifRes.ok
              ? await notifRes.json()
              : [];
            allNotifications[watched.id] = notifData;

            setNotifications((prev) => ({ ...prev, [watched.id]: notifData }));
            setLoadingNotifications((prev) => ({
              ...prev,
              [watched.id]: false,
            }));
          }
        }
        setNotifications(allNotifications);

        // 5️⃣ Socket: přijímat nové notifikace realtime
        socket.on("newNotification", (notif: Notification) => {
          console.log("Přišla notifikace:", notif);

          // zjistíme správné watchedId
          let watchedOrgId: number | null = null;
          orgs.forEach((org: { watching: { id: number }[] }) => {
            org.watching.forEach((watched) => {
              if (watched.id === notif.organizationId) {
                watchedOrgId = watched.id;
              }
            });
          });
          const targetId = watchedOrgId ?? notif.organizationId;

          setNotifications((prev) => ({
            ...prev,
            [targetId]: [notif, ...(prev[targetId] || [])].slice(0, 20),
          }));
        });
      } catch (err) {
        console.error("Chyba při načítání organizací nebo notifikací:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    return () => {
      if (socket) {
        organizations.forEach((org) => {
          org.watching.forEach((watched) => {
            socket?.emit("leave", `org-${watched.id}`);
          });
        });
        socket.off("newNotification");
      }
    };
  }, [token]);

  return (
    <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe mx-auto max-w-4xl w-full">
      <main className="relative overflow-hidden flex flex-col flex-grow items-center justify-start">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto" />
        </div>
        <Navbar />
        <Breadcrumb className="w-full max-w-4xl px-4 py-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>Monitoring</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-full px-4 flex-grow overflow-auto">
          {isLoading && <Spinner size="lg" className="ml-auto mr-auto mt-4 bg-gray-700" />}
          {!isLoading && organizations.length === 0 ? (
            <p>Žádné organizace nejsou aktuálně sledovány.</p>
          ) : (
            <ul className="space-y-4">
              {organizations.map((org) => (
                <li
                  key={org.id}
                  className="p-3 border rounded-xl shadow-sm flex flex-col"
                >
                  {org.watching.length > 0 ? (
                    <ul className="space-y-2">
                      {org.watching.map((watched) => (
                        <li
                          key={watched.id}
                          className="p-2 border rounded-md bg-gray-50"
                        >
                          <div className="font-medium text-sm">
                            {watched.name} – {watched.city}, {watched.country}
                          </div>

                          <ul className="mt-1 text-xs text-gray-700 space-y-1">
                            {loadingNotifications[watched.id] ? (
                              <li className="flex justify-center p-2">
                                <Spinner size="sm" className="ml-auto mr-auto mt-4 bg-gray-700" />
                              </li>
                            ) : (
                              (notifications[watched.id] || [])
                                .slice(0, 10)
                                .map((n) => (
                                  <li
                                    key={n.id}
                                    className="p-1 border rounded bg-white shadow-sm"
                                  >
                                    <span className="font-semibold">
                                      {n.type}
                                    </span>{" "}
                                    – {n.message}{" "}
                                    <span className="text-gray-500">
                                      (
                                      {new Date(
                                        n.createdAt
                                      ).toLocaleTimeString()}
                                      )
                                    </span>
                                  </li>
                                ))
                            )}
                            {!loadingNotifications[watched.id] &&
                              (!notifications[watched.id] ||
                                notifications[watched.id].length === 0) && (
                                <li className="text-gray-400 italic">
                                  Žádné notifikace
                                </li>
                              )}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-gray-500">
                      Sleduje žádné organizace
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
