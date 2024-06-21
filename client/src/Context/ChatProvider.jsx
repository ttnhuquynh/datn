import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "../Context/AuthContext";
import axios from "axios";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [notification, setNotification] = useState([]);
  const [chats, setChats] = useState([]);
  const [myChat, setMyChat] = useState(null);
  const { authUser } = useAuthContext();

  useEffect(() => {
    const getDataMyChat = async () => {
      if (!authUser) return;

      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      try {
        const response = await axios.get(
          `/api/chat/myself/${authUser._id}`,
          config
        );
        setMyChat(response.data[0]);
      } catch (error) {
        console.error("Error fetching my chat data:", error);
      }
    };

    getDataMyChat();
  }, [authUser]);

  return (
    <ChatContext.Provider
      value={{
        selectedChat,
        setSelectedChat,
        notification,
        setNotification,
        chats,
        setChats,
        myChat,
        setMyChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;