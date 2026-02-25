import React, { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

export const WebSocketContext = createContext();

const WebSocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io("https://real-time-collaboration-gvfg.onrender.com", {
      withCredentials: true
    });

    setSocket(s);

    return () => s.disconnect();
  }, []);

  const joinBoard = (boardId) => {
    socket?.emit("join_board", boardId);
  };

  return (
    <WebSocketContext.Provider value={{ socket, joinBoard }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
