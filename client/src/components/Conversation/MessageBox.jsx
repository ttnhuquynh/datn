import clsx from "clsx";
import { useRef, useEffect, useState } from "react";
import { Badge, Avatar } from "@material-tailwind/react";
import { format } from "date-fns";
import ScrollableFeed from "react-scrollable-feed";
import axios from "axios";
import { toast } from "react-toastify";
import { apiUrl } from "../../../setupAxios";


import { ChatState } from "../../Context/ChatProvider";
import { useAuthContext } from "../../Context/AuthContext";
import { useOurCategoriesContext } from "./useOurCategories";
import Message from "./Message";

const MessageBox = () => {
  const { authUser } = useAuthContext();
  const { selectedChat } = ChatState();
  const { messages, setMessages } = useOurCategoriesContext();


  useEffect(() => {
    const getMessages = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${authUser.token}`,
          },
        };
        const { data } = await axios.get(
          `${apiUrl}/api/message/${selectedChat?._id}`,
          config
        );

        setMessages(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        // setLoading(false);
      }
    };

    if (selectedChat?._id) getMessages();
  }, [selectedChat?._id, setMessages]);



  const [isOwn, setIsOwn] = useState(false);
  const image = false;
  const isLast = true;

  const container = clsx("flex gap-3 p-4 justify-start ");
  // const container = clsx("flex gap-3 p-4");

  const avatar = clsx(isOwn && "order-2 ");
  const body = clsx("flex flex-col gap-2", isOwn && "items-end");

  const messageOwn = clsx(
    "text-sm w-fit overflow-hidden",
    "bg-blue-100 text-gray",
    image ? "rounded-md p-0" : "rounded-full py-2 px-3"
  );

  const messageNotOwn = clsx(
    "text-sm w-fit overflow-hidden",
    "bg-gray-100",
    image ? "rounded-md p-0" : "rounded-full py-2 px-3"
  );

  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${authUser.token}`,
        },
      };

      // setLoading(true);

      const { data } = await axios.get(
        `${apiUrl}/api/message/${selectedChat._id}`,
        config
      );
      setMessages(data);
      // setLoading(false);

      // socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.log(error);
    }
  };
   useEffect(() => {
     if (!selectedChat) return;
     fetchMessages();

     // selectedChatCompare = selectedChat;
     // eslint-disable-next-line
   }, [selectedChat]);

  return (
    <>
      {selectedChat ? (
        <ScrollableFeed>
          {messages &&
            messages.map((m) => {
              return (
                <Message
                  m={m}
                  key={m._id}
                  messages={messages}
                  setMessages={setMessages}
                />
              );
            })}
        </ScrollableFeed>
      ) : (
        <div className="h-full bg-white text-gray-500 p-6 rounded-lg shadow-lg flex items-center justify-center">
          <span className="text-2xl font-semibold">
            Chọn một đoạn chat để bắt đầu chat
          </span>
        </div>
      )}
    </>
  );
};

export default MessageBox;
