import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const getStoredUser = () => {
  const storedUser = localStorage.getItem("agilewheel_user");
  return storedUser ? JSON.parse(storedUser) : null;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  const login = (email) => {
    // Temporary login - accept any email/password combo
    // In production, this would validate against a backend
    const userData = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      role: "developer", // Default role
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("agilewheel_user", JSON.stringify(userData));
    setUser(userData);
    return { success: true, user: userData };
  };

  const signup = (email, name) => {
    // Temporary signup - create user in localStorage
    const userData = {
      id: crypto.randomUUID(),
      email,
      name: name || email.split("@")[0],
      role: "developer",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("agilewheel_user", JSON.stringify(userData));
    setUser(userData);
    return { success: true, user: userData };
  };

  const logout = () => {
    localStorage.removeItem("agilewheel_user");
    setUser(null);
  };

  const updateUserRole = (role) => {
    if (user) {
      const updatedUser = { ...user, role };
      localStorage.setItem("agilewheel_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUserRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
