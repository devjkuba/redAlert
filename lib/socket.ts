import { io, Socket } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_API;

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  socket ??= io(URL, {
    transports: ["websocket"],
    withCredentials: true,
  });
  return socket;
};