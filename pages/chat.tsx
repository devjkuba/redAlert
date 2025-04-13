import { useEffect, useRef, useState } from "react";
import useUser from "@/hooks/useUser";
import { io, Socket } from "socket.io-client";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MessageItem from "@/components/MessageItem";

export interface Message {
  id: string;
  senderId: string;
  text: string;
  sender: {
    firstName: string;
    lastName: string;
    email: string;
    id: number;
  }
}

export default function Chat() {
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const socketConnection = io("http://localhost:4000", {
      withCredentials: true,
    });
    setSocket(socketConnection);

    socketConnection.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev.slice(-99), message]);
    });

    const fetchMessages = async () => {
      if (user?.organizationId) {
        try {
          const response = await fetch(
            `http://localhost:4000/api/messages?organizationId=${user.organizationId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            console.log(response);
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
      socketConnection.disconnect();
    };
  }, [user?.organizationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
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

  return (
    <div className="flex min-h-screen !pt-safe !px-safe pb-safe">
      <main className="relative overflow-hidden flex flex-col flex-grow">
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-center">
          <img src="/logo.png" alt="Logo" className="w-48 h-auto mb-2" />
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
          <div className="flex flex-col w-full max-w-lg overflow-scroll h-[calc(100vh_-_109px_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))]">
            <div className="flex-1 overflow-y-auto space-y-3 px-4 py-2 shadow-inner shadow-gray-300">
              {loading ? (
                <div className="flex justify-center items-center">
                  <Spinner
                    size="sm"
                    className="bg-white float-right ml-2.5 mt-[5px]"
                  />
                </div>
              ) : (
                messages.map((msg) => {
                  return <MessageItem user={user} message={msg} key={msg.id} />;
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="sticky bottom-0 border-t p-3 flex gap-2 bg-white">
              <Input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Napište zprávu..."
              />
              <Button onClick={sendMessage}>Odeslat</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
