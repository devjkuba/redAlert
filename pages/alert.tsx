import { twMerge } from "tailwind-merge"; // Přidejte import knihovny
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
import { io } from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_API}`, {
  transports: ["websocket"],
  withCredentials: true,
});

const createNotification = async (
  token: string | null,
  type: string,
  message: string,
  status: string,
  triggeredById: number,
  organizationId: number,
  isDemo: boolean = false
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
  { label: "Zdravotní pomoc", icon: HeartPulse },
  { label: "Požár", icon: Flame },
  { label: "Vniknutí", icon: DoorOpen },
  { label: "Rvačka", icon: FightIcon },
  { label: "Evakuace", icon: LogOut },
  { label: "Vandalismus", icon: SprayCan },
  { label: "Výpadek proudu", icon: PlugZap },
  { label: "Aktivní útočník", icon: GunIcon },
  { label: "Únik plynu", icon: GasIcon },
];

export default function Alert() {
  const { data: user } = useUser();
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
    if (!user?.organizationId) return;
  
    socket.emit("joinOrganization", user.organizationId);
  
    const handleNotification = (notification: Notification) => {
      if (
        Number(notification.organizationId) !== Number(user?.organizationId)
      ) {
        return;
      }
  
      if (user?.id !== notification.triggeredById) {
        const classNames = notification.status !== "ACTIVE" ? {
          toast:
            "!bg-green-100 border-l-4 !border-green-500 !text-green-700 p-4 shadow-lg rounded-lg",
          title: "font-bold !text-green-700",
          description: "!text-green-600",
          icon: "!text-green-500",
          closeButton: "!text-green-500 !hover:text-green-700",
        } : {
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
  }, [user?.organizationId]);
  

  const toggleAlert = async (index: number) => {
    const updatedStates = [...activeStates];
    updatedStates[index] = !updatedStates[index];
    setActiveStates(updatedStates);

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
        Number(user?.id),
        Number(user?.organizationId),
        isDemoActive
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
        Number(user?.id),
        Number(user?.organizationId),
        isDemoActive
      );
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
      isDemoActive
    );
  };

  return (
    <div className="flex min-h-[calc(100vh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe border-0 mx-auto max-w-4xl w-full">
      <main className="relative overflow-hidden flex flex-col flex-grow">
        {isDemoActive && (
          <div className="absolute bg-[#982121] text-white font-sm w-full text-center font-bold text-sm">
            DEMO
          </div>
        )}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-2" />
        </div>
        <Navbar />
        <div className="w-full max-w-4xl text-center px-4 space-y-6 overflow-auto overscroll-none max-h-[calc(100vh_-_100px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
          <GPSPopover />
          <div className="mt-6 grid grid-cols-3 gap-4">
            {alertButtons.map(({ label, icon: Icon }, index) => (
              <button
                key={index}
                onClick={() => toggleAlert(index)}
                className={twMerge(
                  "flex shadow-lg flex-col min-h-[106px] items-center justify-center p-4 rounded-xl border border-gray-300 transition-all",
                  activeStates[index]
                    ? "bg-[#982121] text-white shadow-none"
                    : "text-[#982121]"
                )}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span
                  className={twMerge(
                    "text-sm text-center text-gray-700 font-medium",
                    activeStates[index] && "text-white"
                  )}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <button
              onClick={toggleMainAlert}
              className={twMerge(
                "flex shadow-lg flex-col items-center justify-center w-[120px] h-[120px] p-4 rounded-xl border border-gray-300 transition-all",
                mainActive
                  ? "bg-[#982121] !text-white shadow-none"
                  : "text-[#982121]",
                "transition-colors duration-300"
              )}
            >
              <AlertTriangle className="w-6 h-6 mb-2" />
              <span className="text-sm text-center font-semibold">
                {mainActive ? "Poplach aktivní" : "Aktivovat poplach"}
              </span>
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
