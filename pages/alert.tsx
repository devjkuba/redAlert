import { twMerge } from "tailwind-merge";
import GPSPopover from "@/components/GPSPopover";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import subscribeToPush from "@/components/Push";
import {
  Flame,
  HeartPulse,
  DoorOpen,
  PlugZap,
  LogOut,
  AlertTriangle,
  SprayCan,
} from "lucide-react";
import { GunIcon } from "@/components/GunIcon";
import { GasIcon } from "@/components/GasIcon";
import { FightIcon } from "@/components/FightIcon";
import useUser from "@/hooks/useUser";
import useDemo from "@/hooks/useDemo";
import { getNotifications, Notification } from "@/lib/getNotifications";
import useAuthToken from "@/hooks/useAuthToken";
import { useSocket } from "@/hooks/useSocket";

const createNotification = async (
  token: string | null,
  type: string,
  message: string,
  status: string,
  triggeredById: number,
  organizationId: number,
  isDemo: boolean = false,
  latitude: number | null = null,
  longitude: number | null = null
) => {
  if (isDemo) return;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API}/api/notifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type,
          message,
          status,
          triggeredById,
          organizationId,
          latitude,
          longitude,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }
      throw new Error("Error creating notification");
    }
    return;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
      toast.error("Chyba při vytváření notifikace.");
    } else {
      toast.error("An unexpected error occurred.");
    }
  }
};

const alertButtons = [
  {
    label: "Zdravotní pomoc",
    icon: HeartPulse,
    className: "from-red-500 to-pink-600",
  },
  { label: "Požár", icon: Flame, className: "from-orange-500 to-red-500 " },
  {
    label: "Vniknutí",
    icon: DoorOpen,
    className: "from-indigo-600 to-indigo-700",
  },
  {
    label: "Rvačka",
    icon: FightIcon,
    className: "from-purple-500 to-purple-600",
  },
  { label: "Evakuace", icon: LogOut, className: "from-green-500 to-green-600" },
  {
    label: "Vandalismus",
    icon: SprayCan,
    className: "from-pink-500 to-pink-600",
  },
  {
    label: "Výpadek proudu",
    icon: PlugZap,
    className: "from-yellow-500 to-orange-700",
  },
  {
    label: "Aktivní útočník",
    icon: GunIcon,
    className: "from-gray-500 to-gray-900",
  },
  {
    label: "Únik plynu",
    icon: GasIcon,
    className: "from-yellow-500 to-lime-600",
  },
];

export default function Alert() {
  const { data: user } = useUser();
  const socket = useSocket();
  const [latitude, setLatitude] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [longitude, setLongitude] = useState<number | null>(null);

  const { isDemoActive } = useDemo();
  const token = useAuthToken();

  const [activeStates, setActiveStates] = useState(
    alertButtons.map(() => false)
  );
  const [mainActive, setMainActive] = useState(false);

  useEffect(() => {
    if (user?.id && token) {
      subscribeToPush(user?.id, token);
    }
  }, [token, user?.id]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notifications = await getNotifications(
          token,
          Number(user?.organizationId)
        );
        const latestNotifications = notifications.reduce<{
          [key: string]: Notification;
        }>((acc: { [x: string]: Notification }, notification: Notification) => {
          if (!acc[notification.type]) {
            acc[notification.type] = notification;
          }
          return acc;
        }, {});

        const updatedStates = alertButtons.map(
          ({ label }) => latestNotifications[label]?.status === "ACTIVE"
        );

        setMainActive(
          latestNotifications["Hlavní poplach"]?.status === "ACTIVE"
        );

        setActiveStates(updatedStates);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Error:", error.message);
          toast.error("Chyba při vytváření notifikace.");

          if (
            (error as { response?: { status?: number } })?.response?.status ===
            401
          ) {
            window.location.href = "/login";
          }
        } else {
          console.error("An unexpected error occurred.");
          toast.error("An unexpected error occurred.");
        }
      }
    };

    if (user?.organizationId) {
      fetchNotifications();
    }
  }, [token, user?.organizationId]);

  useEffect(() => {
    if (!user?.organizationId || !socket) return;

    socket.emit("joinOrganization", user.organizationId);

    const handleNotification = (notification: Notification) => {
      if (
        Number(notification.organizationId) !== Number(user?.organizationId)
      ) {
        return;
      }

      if (user?.id !== notification.triggeredById) {
        const classNames =
          notification.status !== "ACTIVE"
            ? {
                toast:
                  "!bg-green-100 border-l-4 !border-green-500 !text-green-700 p-4 shadow-lg rounded-lg",
                title: "font-bold !text-green-700",
                description: "!text-green-600",
                icon: "!text-green-500",
                closeButton: "!text-green-500 !hover:text-green-700",
              }
            : {
                toast:
                  "!bg-red-100 border-l-4 !border-red-500 !text-red-700 p-4 shadow-lg rounded-lg",
                title: "font-bold text-red-700",
                description: "text-red-600",
                icon: "text-red-500",
                closeButton: "text-red-500 hover:text-red-700",
              };

        toast(`${notification.message}`, {
          duration: 5000,
          classNames,
        });
      }

      if (notification.type === "Hlavní poplach") {
        setMainActive(notification.status === "ACTIVE");
        return;
      }

      const index = alertButtons.findIndex(
        (btn) => btn.label === notification.type
      );

      if (index !== -1) {
        setActiveStates((prev) => {
          const newStates = [...prev];
          newStates[index] = notification.status === "ACTIVE";
          return newStates;
        });
      }
    };

    socket.on("newNotification", handleNotification);

    return () => {
      socket.off("newNotification", handleNotification);
    };
  }, [socket, user?.id, user?.organizationId]);

  const toggleAlert = async (index: number) => {
    if (sending) {
      toast("Počkejte prosím, notifikace se právě odesílá.", {
        duration: 2000,
      });
      return;
    }
    setSending(true);

    const updatedStates = [...activeStates];
    updatedStates[index] = !updatedStates[index];
    setActiveStates(updatedStates);

    const userId = Number(user?.id);
    const organizationId = Number(user?.organizationId);

    if (!userId || !organizationId) {
      toast.error("Chyba: Uživatel nebo organizace není definována.", {
        duration: 5000,
        classNames: {
          toast:
            "!bg-yellow-100 border-l-4 !border-yellow-500 !text-yellow-700 p-4 shadow-lg rounded-lg",
          title: "font-bold text-yellow-700",
          description: "text-yellow-600",
          icon: "text-yellow-500",
          closeButton: "text-yellow-500 hover:text-yellow-700",
        },
      });
      return;
    }

    try {
      const alert = alertButtons[index];
      if (updatedStates[index]) {
        toast.error(`Poplach "${alert.label}" byl aktivován.`, {
          duration: 5000,
          classNames: {
            toast:
              "!bg-red-100 border-l-4 !border-red-500 !text-red-700 p-4 shadow-lg rounded-lg",
            title: "font-bold text-red-700",
            description: "text-red-600",
            icon: "text-red-500",
            closeButton: "text-red-500 hover:text-red-700",
          },
        });
        await createNotification(
          token,
          alert.label,
          `${alert.label} aktivován.`,
          "ACTIVE",
          userId,
          organizationId,
          isDemoActive,
          latitude,
          longitude
        ); // replace with actual user and organization IDs
      } else {
        toast.success(`Poplach "${alert.label}" byl deaktivován.`, {
          duration: 5000,
          classNames: {
            toast:
              "!bg-green-100 border-l-4 !border-green-500 !text-green-700 p-4 shadow-lg rounded-lg",
            title: "font-bold !text-green-700",
            description: "!text-green-600",
            icon: "!text-green-500",
            closeButton: "!text-green-500 !hover:text-green-700",
          },
        });
        await createNotification(
          token,
          alert.label,
          `${alert.label} deaktivován.`,
          "INACTIVE",
          userId,
          organizationId,
          isDemoActive,
          latitude,
          longitude
        );
      }
    } finally {
      setSending(false);
    }
  };

  const toggleMainAlert = async () => {
    setMainActive((prev) => !prev);
    const toastMessage = mainActive
      ? "Hlavní poplach deaktivován."
      : "Hlavní poplach aktivován.";
    const toastType = mainActive ? toast.success : toast.error;
    toastType(toastMessage, {
      duration: 5000,
      classNames: {
        toast: mainActive
          ? "!bg-green-100 border-l-4 !border-green-500 !text-green-700 p-4 shadow-lg rounded-lg"
          : "!bg-red-100 border-l-4 !border-red-500 !text-red-700 p-4 shadow-lg rounded-lg",
        title: "font-bold",
        description: mainActive ? "!text-green-600" : "text-red-600",
        icon: mainActive ? "!text-green-500" : "text-red-500",
        closeButton: mainActive
          ? "!text-green-500 !hover:text-green-700"
          : "text-red-500 hover:text-red-700",
      },
    });

    await createNotification(
      token,
      "Hlavní poplach",
      toastMessage,
      mainActive ? "INACTIVE" : "ACTIVE",
      Number(user?.id),
      Number(user?.organizationId),
      isDemoActive,
      latitude,
      longitude
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full mx-auto max-w-4xl bg-white text-black !pt-safe !px-safe overflow-hidden">
      {/* <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe border-0 mx-auto max-w-4xl w-full"> */}
      <main className="relative flex flex-col flex-grow">
        {isDemoActive && (
          <div className="absolute bg-[#982121] text-white font-sm w-full text-center font-bold text-sm">
            DEMO
          </div>
        )}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto" />
        </div>
        <Navbar />
        <div className="w-full mx-auto max-w-sm text-center px-4 space-y-6 overflow-auto overscroll-none max-h-[calc(100vh_-_79px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
          <GPSPopover
            latitude={latitude}
            longitude={longitude}
            setLatitude={setLatitude}
            setLongitude={setLongitude}
          />
          <div className="mt-6 grid grid-cols-3 gap-4">
            {alertButtons.map(({ label, className, icon: Icon }, index) => (
              <button
                key={index}
                disabled={sending}
                onClick={() => toggleAlert(index)}
                className={twMerge(
                  "group relative aspect-square rounded-3xl bg-gradient-to-br shadow-xl hover:scale-105 hover:shadow-2xl active:scale-95 transition-all duration-300 border border-white/20 backdrop-blur-sm",
                  className,
                  activeStates[index] &&
                    "bg-gradient-to-br from-red-600 to-red-900 text-white shadow-none animate-pulse-soft"
                )}
              >
                <div className="absolute inset-0 bg-black/20 rounded-3xl"></div>
                <div className="relative h-full flex flex-col items-center justify-center space-y-2 p-3">
                  <div className="text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="lucide lucide-heart w-7 h-7" />
                  </div>
                  <span className="text-xs font-semibold text-center text-white drop-shadow-lg leading-tight whitespace-pre-line">
                    {label}
                  </span>
                </div>
              </button>
            ))}
          </div>
          <div className="px-6 mb-20 flex justify-center">
            <button
              onClick={toggleMainAlert}
              disabled={sending}
              className={twMerge(
                "relative max-w-[200px] group bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-500 hover:via-red-600 hover:to-red-700 rounded-3xl px-12 py-6 hover:shadow-red-500/60 active:scale-95 transition-all duration-300 border-2 border-red-400/30 min-w-[200px]",
                mainActive &&
                  "bg-gradient-to-br !from-red-600 !to-red-900 text-white shadow-none animate-pulse-soft"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-transparent rounded-3xl" />
              <div className="relative flex flex-col items-center space-y-3">
                <AlertTriangle className="lucide lucide-triangle-alert w-10 h-10 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                <div className="text-center">
                  <div className="text-lg font-bold text-white drop-shadow-lg">
                    {mainActive ? "Poplach aktivní" : "Aktivovat poplach"}
                  </div>
                </div>
              </div>
            </button>
          </div>
          <Toaster
            position="bottom-center"
            toastOptions={{
              classNames: {
                toast: "border-l-4 p-4 shadow-lg rounded-lg",
                title: "font-bold",
                description: "text-red-600",
              },
            }}
          />
        </div>
      </main>
    </div>
  );
}
