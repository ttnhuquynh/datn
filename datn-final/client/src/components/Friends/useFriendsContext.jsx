// UserContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { useAuthContext } from "../../Context/AuthContext";

const FriendsContext = createContext();

export const useFriendsContext = () => {
  return useContext(FriendsContext);
};

export const FriendsProvider = ({ children }) => {
  const [friends, setFriends] = useState([]);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (!authUser) return;

    const fetchData = async () => {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };

      await axios
        .get(`/api/friend/get/${authUser._id}`, config)
        .then((response) => {
          console.log(response.data);
          setFriends(response.data);
        })
        .catch((error) => {
          console.log(error);
        });
    };
    fetchData();
  }, [authUser]);

  return (
    <FriendsContext.Provider value={{ friends, setFriends }}>
      {children}
    </FriendsContext.Provider>
  );
};
