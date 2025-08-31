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
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthToken();

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/adminOrganizations`,
          {
            method: "GET",
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

        // připojit se na socket jen jednou
        if (!socket) {
          socket = io(process.env.NEXT_PUBLIC_API!, {
            transports: ["websocket"],
            auth: { token },
          });
        }

        // přihlášení do místností pro sledované organizace
        orgs.forEach((org: Organization) => {
          org.watching.forEach((watched) => {
            socket?.emit("join", `org-${watched.id}`);
          });
        });

        socket.on("newNotification", (notif: Notification) => {
          console.log("Přišla notifikace:", notif);

          // zjistíme, jestli notif.organizationId odpovídá některému watched.id
          let watchedOrgId: number | null = null;

          orgs.forEach((org: { watching: { id: number | null }[] }) => {
            org.watching.forEach((watched: { id: number | null }) => {
              if (watched.id === notif.organizationId) {
                watchedOrgId = watched.id;
              }
            });
          });

          // fallback: pokud jsme nenašli match, zkusíme použít přímo organizationId
          const targetId = watchedOrgId ?? notif.organizationId;

          setNotifications((prev) => ({
            ...prev,
            [targetId]: [notif, ...(prev[targetId] || [])].slice(0, 20),
          }));
        });
      } catch (err) {
        console.error("Chyba při načítání organizací:", err);
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
        <div className="w-full px-4">
          {isLoading && <Spinner size="lg" className="ml-auto mr-auto mt-4" />}
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

                          {/* seznam notifikací pro tuto sledovanou organizaci */}
                          <ul className="mt-1 text-xs text-gray-700 space-y-1">
                            {(notifications[watched.id] || []).map((n) => (
                              <li
                                key={n.id}
                                className="p-1 border rounded bg-white shadow-sm"
                              >
                                <span className="font-semibold">{n.type}</span>{" "}
                                – {n.message}{" "}
                                <span className="text-gray-500">
                                  ({new Date(n.createdAt).toLocaleTimeString()})
                                </span>
                              </li>
                            ))}
                            {(!notifications[watched.id] ||
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
