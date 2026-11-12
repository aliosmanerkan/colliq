import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket) {
    let socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";
    if (typeof window !== "undefined") {
      if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
        socketUrl = window.location.origin;
      }
    }
    socket = io(socketUrl, {
      autoConnect: true,
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
};

export default getSocket;
