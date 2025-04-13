import { Message } from "@/pages/chat";

export default function MessageItem({
  message,
  user,
}: {
  readonly message: Message;
  readonly user: {
    readonly id: number;
    readonly firstName: string;
    readonly role: string;
    readonly organizationId: number;
    readonly lastName: string;
    readonly email: string;
  } | null;
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
