import { io, Socket } from "socket.io-client";

const socket: Socket = io(process.env.NEXT_PUBLIC_API as string, {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;