import { useEffect, useRef, useState } from "react";
import useUser from "@/hooks/useUser";
import { Socket } from "socket.io-client";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useDemo from "@/hooks/useDemo";
import useAuthToken from "@/hooks/useAuthToken";
import subscribeToPush from "@/components/Push";
import { useSocket } from "@/hooks/useSocket";
import { ShieldAlert, Camera, ShieldBan } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { compressImage } from "@/lib/imageUtils";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  status: string;
  createdAt: Date;
  type: "TEXT" | "ALARM" | "IMAGE";
  imageUrl?: string;
  sender: {
    firstName: string;
    lastName: string;
    email: string;
    id: number;
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
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user?.id && token) {
      subscribeToPush(user?.id, token);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (!socketConnection || !user?.organizationId || !token) return;

    setSocket(socketConnection);

    socketConnection.emit("joinOrganization", user.organizationId);

    const handleNewMessage = (message: Message) => {
      setMessages((prev) => [...prev.slice(-99), message]);
    };

    socketConnection.on("newMessage", handleNewMessage);

    const fetchMessages = async () => {
      if (user?.organizationId) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API}/api/messages?organizationId=${user.organizationId}`,
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

    fetchMessages();

    return () => {
      socketConnection.off("newMessage", handleNewMessage);
    };
  }, [socketConnection, token, user?.organizationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
        createdAt: new Date(),
        type: "IMAGE",
        imageUrl: URL.createObjectURL(file), // použití URL pro okamžité zobrazení
        sender: {
          id: user?.id ?? 0,
          firstName: user?.firstName ?? "",
          lastName: user?.lastName ?? "",
          email: user?.email ?? "",
        },
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

        socket?.emit("sendMessage", data);

        // aktualizuj zprávu s reálným id a URL z backendu
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
        senderId: user?.id ?? "",
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
    <div className="flex h-[calc(100vh_-_29px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] !mt-safe !px-safe border-0 mx-auto max-w-4xl w-full">
      <main className="relative overflow-hidden flex flex-col flex-grow">
        {isDemoActive && (
          <div className="absolute bg-[#982121] text-white font-sm w-full text-center font-bold text-sm">
            DEMO
          </div>
        )}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-40 h-auto" />
        </div>
        <Navbar />
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
        <div className="flex flex-col flex-grow items-center">
          <div className="flex flex-col w-full max-w-3xl overflow-scroll h-[calc(100vh_-_109px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center">
                  <Spinner size="lg" className="mt-[20px] bg-black" />
                </div>
              ) : (
                messages.map((msg) => {
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
                    user && String(msg.senderId) === String(user.id);

                  const senderName = `${msg.sender.firstName} ${msg.sender.lastName}`;

                  const isSystem = msg.type === "ALARM";
                  const color = stringToColorIndex(
                    senderName || msg.sender.email
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
                                <ShieldAlert className="inline-block h-5 mt-[-3px]" />
                              ) : (
                                <ShieldBan className="inline-block h-5 mt-[-3px]" />
                              )}
                              {msg.text}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            {formattedDate}
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
                          className={`space-y-1 max-w-[45vw] ${
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
                              onLoad={() => {
                                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
                              }}
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
                            className={`px-2 py-2 leading-[1.2] rounded-xl flex flex-col text-sm text-left ${
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
              <div ref={messagesEndRef} />
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
