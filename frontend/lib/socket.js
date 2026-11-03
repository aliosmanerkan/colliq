import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";
    socket = io(socketUrl, {
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export default getSocket;
