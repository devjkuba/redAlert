import { Message } from "@/pages/chat";

export default function MessageItem({ message, user }: { message: Message, user: { id: number; firstName: string; role: string; organizationId: number; lastName: string; email: string } }) {  
  console.log(message);
    return (
      <div className="p-2 border rounded-md text-sm even:bg-gray-100">
        <strong>{message.sender ? `${message.sender.firstName} ${message.sender.lastName.charAt(0)}.` : `${user.firstName} ${user.lastName.charAt(0)}`}: </strong>
        <span className="break-words">{message.text}</span>
      </div>
    );
  };