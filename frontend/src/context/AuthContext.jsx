import React, { createContext, useEffect, useState } from "react";
import api from "../api/client.js";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (email, password) => {
    await api.post("/auth/log-in", { email, password });
    await fetchMe();
  };

  const signup = async (data) => {
    await api.post("/auth/sign-up", data);
    await fetchMe();
  };

  const logout = async () => {
    await api.post("/auth/sign-out");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
