import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, RiderLevel, Discipline } from '../types';
import { INITIAL_USER } from '../data/mockFeed';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (userData: {
    name: string;
    email: string;
    weightKg: number;
    riderLevel: RiderLevel;
    homeSpot: string;
    disciplines: Discipline[];
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updatedData: Partial<UserProfile>) => void;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'kiteninja_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_USER;
      }
    }
    return INITIAL_USER; // Start with default loaded profile (Tarcyo Alves) as requested
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (email: string): Promise<boolean> => {
    // Simulated cloud login
    const loggedUser: UserProfile = {
      ...INITIAL_USER,
      email: email || INITIAL_USER.email,
      name: email.split('@')[0].toUpperCase() || INITIAL_USER.name,
    };
    setUser(loggedUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const register = async (data: {
    name: string;
    email: string;
    weightKg: number;
    riderLevel: RiderLevel;
    homeSpot: string;
    disciplines: Discipline[];
  }): Promise<boolean> => {
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: data.name,
      email: data.email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(data.name)}`,
      riderId: `${Math.floor(1000 + Math.random() * 9000)} (130-2026.8)`,
      nationality: 'Brasil',
      countryFlag: '🇧🇷',
      weightKg: data.weightKg || 75,
      riderLevel: data.riderLevel || 'Intermediário',
      homeSpot: data.homeSpot || 'Praia Ponta do Mel',
      disciplines: data.disciplines.length > 0 ? data.disciplines : ['Kitesurf Twintip'],
      totalSessions: 0,
      totalHours: 0,
      totalKm: 0,
      maxKnotsRidden: 0,
      bio: `Velejador no ${data.homeSpot || 'Litoral'}!`,
    };
    setUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updatedData: Partial<UserProfile>) => {
    setUser(prev => (prev ? { ...prev, ...updatedData } : null));
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
