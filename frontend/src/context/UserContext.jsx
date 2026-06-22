import axios from "axios";
import { createContext, useEffect, useState } from "react";
export const userDataContext = createContext();
function UserContext({ children }) {
  const serverUrl =
    "https://ai-virtual-assistant-web-application-2btb.onrender.com";
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUserData(result.data);
    } catch (error) {
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { 
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        },
      );
      // Update the history locally so it appears in the UI without a refresh
      setUserData((prev) => {
        if (prev) {
          return { ...prev, history: [...(prev.history || []), command] };
        }
        return prev;
      });
      return (
        result.data || {
          type: "general",
          response: "I couldn't process that command.",
        }
      );
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.response
      ) {
        return { type: "general", response: error.response.data.response };
      }
      return {
        type: "general",
        response: "Sorry, I couldn't reach the server right now.",
      };
    }
  };

  const clearUserHistory = async () => {
    try {
      await axios.delete(`${serverUrl}/api/user/history`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setUserData((prev) => (prev ? { ...prev, history: [] } : prev));
    } catch (error) {}
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);
  const value = {
    serverUrl,
    userData,
    setUserData,
    loading,
    backendImage,
    setBackendImage,
    frontendImage,
    setFrontendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
    clearUserHistory,
  };
  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
}

export default UserContext;
