import React, { useState, useEffect } from "react";
import Conversation from "../components/Conversation/Conversation";
import Friends from "../components/Friends/index";
import Sidebar from "../layouts/Sidebar";
import { ChatState } from "../Context/ChatProvider";
import { Categories } from "../components/Conversation/Categories";
import { OurCategoriesProvider } from "../components/Conversation/useOurCategories";
import { useAuthContext } from "../Context/AuthContext";

const Chats = () => {
  const [open, setOpen] = useState(false);
  
  const { authUser } = useAuthContext();

  useEffect(() => {
    // Example of useEffect usage if needed
    if (authUser) {
      // Perform some action if authUser exists
    }
  }, [authUser]);

  if (!authUser) return  (
    <div >
      <h1>Unauthorized</h1>
    </div>);

  return (
    // {authUser ? }
    <OurCategoriesProvider>
      <div className="h-5/6  w-full flex flex-row gap-4 m-4">
        <div className="w-1/5 rounded-xl shadow-md bg-white hidden lg:flex ml-4 justify-center">
          <Sidebar />
        </div>

        <div className="flex-1  rounded-xl shadow-md bg-white flex">
          <Conversation
            setOpen={setOpen}
          />
          {/* <categories/> */}
          {open && (
            <div className="w-1/3 rounded-xl shadow-md bg-white">
              <Categories
              />
            </div>
          )}
        </div>
        <div className="w-1/5 rounded-xl shadow-md bg-white hidden lg:flex mr-4 justify-center">
          <Friends />
        </div>
      </div>
    </OurCategoriesProvider>
  );
};

export default Chats;
