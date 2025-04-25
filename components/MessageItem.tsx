import { User } from "@/hooks/useUser";
import { Message } from "@/pages/chat";

export default function MessageItem({
  message,
  user,
}: {
  readonly message: Message;
  readonly user: User | null | undefined;
}) {
  return (
    <div className="p-2 border rounded-md text-sm even:bg-gray-100">
      <strong>
        {message.sender
          ? `${message.sender.firstName} ${message.sender.lastName.charAt(0)}.`
          : `${user?.firstName} ${user?.lastName.charAt(0)}`}:{" "}
      </strong>
      <span className="break-words">{message.text}</span>
    </div>
  );
}
