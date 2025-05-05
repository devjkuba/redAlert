import { User } from "@/hooks/useUser";
import { cn } from "@/lib/utils";
import { Message } from "@/pages/chat";

export default function MessageItem({
  message,
  user,
}: {
  readonly message: Message;
  readonly user: User | null | undefined;
}) {
  let backgroundClass = "even:bg-gray-100";

  if (message.type === "ALARM") {
    backgroundClass =
      message.status === "INACTIVE" ? "bg-green-100" : "bg-red-100";
  }

  const createdAt = new Date(message.createdAt); 
  const formattedDate = createdAt.toLocaleString("cs-CZ", {
    dateStyle: "short",
    timeStyle: "short",
  });

  return (
    <div className={cn("p-2 border rounded-md text-sm", backgroundClass)}>
      <div className="flex justify-between mb-1 text-gray-500 text-xs">
        <span>
          {message.sender
            ? `${message.sender.firstName} ${message.sender.lastName.charAt(0)}.`
            : `${user?.firstName} ${user?.lastName.charAt(0)}.`}
        </span>
        <span>{formattedDate}</span>
      </div>
      <span className="break-words">{message.text}</span>
    </div>
  );
}
