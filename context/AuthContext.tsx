"use client";

import { createContext, useContext, useEffect, useState } from "react";

// define the shape of the logged-in user
interface SessionUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

// define what the box actually holds: the user (may be null if nobody's logged in),
// a loading flag, and a way to ask it to re-check
interface AuthContextType {
  user: SessionUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

// 1- Create the context. Undefined here ONLY ever means "used outside the Provider"
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2- Create the Auth Provider that contains all the logic
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Pulled into its own function so it can be reused, not just run once on mount
  const refreshUser = async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// 3- Create the hook itself
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
