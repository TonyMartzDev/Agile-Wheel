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

    // Check if user already exists in localStorage
    const existingUser = getStoredUser();
    if (existingUser && existingUser.email === email) {
      // User exists, use their existing data including role
      setUser(existingUser);
      return { success: true, user: existingUser };
    }

    // New user - create with default role
    const userData = {
      id: crypto.randomUUID(),
      email,
      name: email.split("@")[0],
      role: "developer", // Default role for new users
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("agilewheel_user", JSON.stringify(userData));
    setUser(userData);
    return { success: true, user: userData };
  };

  const signup = (email, name, role = "developer") => {
    // Temporary signup - create user in localStorage
    const userData = {
      id: crypto.randomUUID(),
      email,
      name: name || email.split("@")[0],
      role,
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

  const updateUser = (updates) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      localStorage.setItem("agilewheel_user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return true;
    }
    return false;
  };

  const deleteAccount = () => {
    if (user) {
      // Remove user data
      localStorage.removeItem("agilewheel_user");

      // Remove user's personal chats
      localStorage.removeItem(`agilewheel_personal_chats_${user.id}`);

      // Note: Team chats are shared and should remain for other team members
      // In production, backend would handle removing user from team chats

      setUser(null);
      return true;
    }
    return false;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    updateUserRole,
    updateUser,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
