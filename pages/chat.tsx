import { useEffect, useRef, useState } from "react";
import useUser from "@/hooks/useUser";
import { Socket } from "socket.io-client";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDemo from "@/hooks/useDemo";
import useAuthToken from "@/hooks/useAuthToken";
import subscribeToPush from "@/components/Push";
import { useSocket } from "@/hooks/useSocket";
import {
  ShieldAlert,
  Camera,
  ShieldBan,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { compressImage } from "@/lib/imageUtils";
import { useRouter } from "next/router";

export interface Message {
  id: string;
  senderId?: string;
  deviceId?: string;
  organizationId: number;
  text: string;
  status: string;
  createdAt: Date;
  latitude?: number;
  longitude?: number;
  type: "TEXT" | "ALARM" | "IMAGE";
  imageUrl?: string;
  sender?: {
    firstName: string;
    lastName: string;
    email: string;
    id: number;
  };
  device?: {
    id: number;
    name: string;
  };
}

export default function Chat() {
  const { data: user } = useUser();
  const socketConnection = useSocket();
  const token = useAuthToken();
  const { isDemoActive } = useDemo();
  const [messages, setMessages] = useState<Message[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (user?.id && token) {
      subscribeToPush({
        token,
        userId: !user?.isDevice ? user?.id : undefined,
        deviceId: user?.isDevice ? user?.id : undefined,
      });
    }
  }, [token, user?.id, user?.isDevice]);

  const handleNewMessage = (message: Message) => {
    setMessages((prev) => {
      const exists = prev.some((m) => m.id === message.id);
      if (exists) return prev;
      return [...prev.slice(-99), message];
    });
  };

  const fetchMessages = async (
    organizationId: number | undefined,
    token: string | null
  ) => {
    if (organizationId && token) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API}/api/messages?organizationId=${organizationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.status === 401) {
          window.location.href = "/login";
        }

        if (response.ok) {
          const data = await response.json();
          setMessages(data.reverse());
          setLoading(false);
        } else {
          console.error("Chyba při načítání zpráv.");
        }
      } catch (error) {
        console.error("Chyba při načítání zpráv:", error);
      }
    }
  };

  useEffect(() => {
    if (!socketConnection || !user?.organizationId || !token) return;

    setSocket(socketConnection);

    socketConnection.emit("joinOrganization", user.organizationId);

    socketConnection.on("newMessage", handleNewMessage);

    fetchMessages(user.organizationId, token);

    return () => {
      socketConnection.off("newMessage", handleNewMessage);
    };
  }, [socketConnection, token, user?.organizationId]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (fileToSend?: File) => {
    const file = fileToSend || imageFile;

    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("senderId", String(user?.id ?? ""));
      formData.append("organizationId", String(user?.organizationId ?? ""));
      formData.append("type", "IMAGE");

      const tempId = `temp-${Date.now()}`;

      const optimisticMessage: Message = {
        id: tempId,
        senderId: String(user?.id),
        text: "",
        status: "SENT",
        organizationId: Number(user?.organizationId),
        createdAt: new Date(),
        type: "IMAGE",
        imageUrl: URL.createObjectURL(file), // použití URL pro okamžité zobrazení
        sender:
          user && !user.isDevice
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                id: user.id,
              }
            : undefined,
        device: user?.isDevice
          ? {
              id: user.id,
              name: user.name || "Zařízení",
            }
          : undefined,
      };

      // Okamžitě přidej obrázek do chatu
      setMessages((prev) => [...prev, optimisticMessage]);

      setImageFile(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API}/api/messages/image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const data = await response.json();

        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? data : msg))
        );
      } else {
        console.error("Chyba při nahrávání obrázku");
      }
      return;
    }

    if (text) {
      const messageData = {
        text,
        senderId: user?.isDevice ? undefined : user?.id,
        deviceId: user?.isDevice ? user?.id : undefined,
        organizationId: user?.organizationId ?? "",
      };

      socket?.emit("sendMessage", messageData);
      setText("");
    }
  };

  const COLORS = [
    "#1f77b4", // modrá
    "#ff7f0e", // oranžová
    "#2ca02c", // zelená
    "#d62728", // červená
    "#9467bd", // fialová
    "#8c564b", // hnědá
    "#e377c2", // růžová
    "#7f7f7f", // šedá
    "#17becf", // tyrkysová
    "#bcbd22", // limetka
  ];

  const stringToColorIndex = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % COLORS.length;
    return COLORS[index];
  };

  return (
    <div className="flex relative h-[calc(100vh_-_32px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] lg:!h-[calc(100vh_-_20px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] landscape:h-[calc(100vh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe border-0 mx-auto max-w-4xl w-full">
      <div
        className="absolute top-[22px] z-50"
        style={{ left: `calc(1rem + env(safe-area-inset-left))` }}
      >
        <Button
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/alert");
            }
          }}
          variant="outline"
          size="icon"
          className="bg-[#f8f8f8] text-black border border-gray-300"
        >
          <ArrowLeft
            className="text-current transition-colors duration-300 ease-in-out"
            strokeWidth={2}
          />
          <span className="sr-only">Zpět</span>
        </Button>
      </div>
      <main className="relative overflow-hidden flex flex-col flex-grow">
        {isDemoActive && (
          <div className="absolute bg-[#982121] text-white font-sm w-full text-center font-bold text-sm">
            DEMO
          </div>
        )}
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
        <div className="flex flex-col flex-grow items-center min-h-0">
          <div className="flex flex-col w-full max-w-3xl flex-grow min-h-0">
            <div
              ref={containerRef}
              className="flex flex-col-reverse flex-grow overflow-y-auto scroll-smooth px-4 gap-y-4 min-h-0"
            >
              {loading ? (
                <div className="flex justify-center items-center">
                  <Spinner size="lg" className="mt-[20px] bg-black" />
                </div>
              ) : (
                messages
                  .slice()
                  .reverse()
                  .map((msg) => {
                    const createdAt = new Date(msg.createdAt);
                    const time = createdAt.toLocaleTimeString("cs-CZ", {
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                    const date = createdAt
                      .toLocaleDateString("cs-CZ", {
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })
                      .replace(/\s/g, "");

                    const formattedDate = `${time}\u00A0\u00A0${date}`;
                    const isCurrentUser =
                      user &&
                      (String(msg.senderId) === String(user.id) ||
                        String(msg.deviceId) === String(user.id));

                    let senderName = "Neznámý odesílatel";
                    if (msg.sender?.firstName && msg.sender?.lastName) {
                      senderName = `${msg.sender.firstName} ${msg.sender.lastName}`;
                    } else if (msg.device?.name) {
                      senderName = msg.device.name;
                    }

                    const isSystem = msg.type === "ALARM";
                    const color = stringToColorIndex(
                      senderName || msg.sender?.email || "unknown"
                    );

                    if (isSystem) {
                      const isActive = msg.status === "ACTIVE";

                      const background = isActive
                        ? "from-red-100 to-red-200"
                        : "from-green-100 to-green-200";

                      return (
                        <div key={msg.id} className="flex justify-center gap-2">
                          <div className="space-y-1 max-w-xs">
                            <div
                              className={`${background} px-2 py-2 leading-[1.2] rounded-xl flex flex-col text-sm max-w-sm text-center bg-gradient-to-br backdrop-blur-sm`}
                            >
                              <span
                                className="text-[8px] text-center font-medium"
                                style={{ color }}
                              >
                                {!isCurrentUser && `${senderName}`}
                              </span>
                              <span>
                                {isActive ? (
                                  <ShieldAlert className="inline-block h-5 mt-[-3px] text-red-500" />
                                ) : (
                                  <ShieldBan className="inline-block h-5 mt-[-3px] text-green-600" />
                                )}
                                {msg.text}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 text-center">
                              {formattedDate}
                              {isActive && msg.latitude && msg.longitude && (
                                <a
                                  href={`https://maps.google.com/?q=${msg.latitude},${msg.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-800 hover:underline transition-colors"
                                  aria-label="Zobrazit polohu na mapě"
                                >
                                  <MapPin className="inline-block ml-1 w-3 h-3 mt-[-3px] text-current" />
                                  Zobrazit na mapě
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (msg.type === "IMAGE") {
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${
                            isCurrentUser ? "justify-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`space-y-1 max-w-[200px] ${
                              isCurrentUser ? "text-right" : ""
                            }`}
                          >
                            <div className="rounded-xl flex flex-col text-sm">
                              {!isCurrentUser && (
                                <span
                                  className="text-[8px] font-medium"
                                  style={{ color }}
                                >
                                  {senderName}
                                </span>
                              )}
                              <img
                                src={`https://api.redalert.cz${msg.imageUrl}`}
                                onClick={() =>
                                  setFullscreenImage(
                                    `https://api.redalert.cz${msg.imageUrl}`
                                  )
                                }
                                alt="Obrázek"
                                className="rounded w-[45vw] max-h-[35vh] object-cover cursor-pointer"
                              />
                              {msg.text?.trim() && (
                                <p className="mt-1">{msg.text}</p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formattedDate}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (msg.type === "TEXT" && msg.text?.trim()) {
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2 ${
                            isCurrentUser ? "justify-end" : "items-start"
                          }`}
                        >
                          <div
                            className={`space-y-1 max-w-xs ${
                              isCurrentUser ? "text-right" : ""
                            }`}
                          >
                            <div
                              className={`px-2 py-2 leading-[1.2] rounded-xl flex flex-col text-md text-left ${
                                isCurrentUser
                                  ? "bg-gradient-to-br text-black backdrop-blur-sm from-sky-100 to-sky-200"
                                  : "bg-gradient-to-br backdrop-blur-sm from-gray-100 to-gray-200"
                              }`}
                            >
                              <span
                                className="text-[8px] text-left font-medium"
                                style={{ color }}
                              >
                                {!isCurrentUser && `${senderName}`}
                              </span>
                              {msg.text}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formattedDate}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })
              )}
            </div>
            <div className="sticky bottom-0 border-t p-3 flex gap-2 bg-white">
              <div className="flex gap-2 items-center">
                <label className="cursor-pointer bg-gray-100 rounded px-3 py-1 text-sm border border-gray-300 hover:bg-gray-200">
                  <Camera />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const fixedBlob = await compressImage(file);
                        const fixedFile = new File([fixedBlob], file.name, {
                          type: file.type,
                        });
                        setImageFile(fixedFile);

                        // rovnou zavoláme sendMessage
                        await sendMessage(fixedFile);

                        // vyčistíme input (pokud chceš)
                        e.target.value = "";
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
              <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Napište zprávu..."
              />
              <Button onClick={() => sendMessage()}>Odeslat</Button>
            </div>
          </div>
        </div>
      </main>
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Fullscreen"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
