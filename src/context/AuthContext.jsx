import { createContext, useState, useContext } from "react";
import { disconnectSocket } from "../lib/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [org, setOrg] = useState(() => {
    const saved = localStorage.getItem("org");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token, orgData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    if (orgData) localStorage.setItem("org", JSON.stringify(orgData));
    setUser(userData);
    if (orgData) setOrg(orgData);
  };

  const logout = () => {
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("org");
    setUser(null);
    setOrg(null);
  };

  return (
    <AuthContext.Provider value={{ user, org, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);