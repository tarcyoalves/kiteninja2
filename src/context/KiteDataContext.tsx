import React, { createContext, useContext, useState, useEffect } from 'react';
import { Spot, SessionLog, CommunityPost, SafetyOccurrence, KiteEvent, WindUnit } from '../types';
import { INITIAL_SPOTS } from '../data/mockSpots';
import { INITIAL_POSTS, INITIAL_SESSIONS, INITIAL_SAFETY_ALERTS, INITIAL_EVENTS } from '../data/mockFeed';

interface KiteDataContextType {
  spots: Spot[];
  selectedSpot: Spot | null;
  setSelectedSpot: (spot: Spot | null) => void;
  toggleFavorite: (spotId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStateFilter: string;
  setSelectedStateFilter: (state: string) => void;
  
  // Sessions (Logbook)
  sessions: SessionLog[];
  addSession: (session: Omit<SessionLog, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => void;
  deleteSession: (sessionId: string) => void;

  // Community Feed
  posts: CommunityPost[];
  addPost: (post: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'shares'>) => void;
  toggleLikePost: (postId: string) => void;
  addComment: (postId: string, text: string, userName: string) => void;

  // Safety & Events
  safetyAlerts: SafetyOccurrence[];
  addSafetyAlert: (alert: Omit<SafetyOccurrence, 'id' | 'timestamp' | 'status'>) => void;
  events: KiteEvent[];
  toggleEventRegistration: (eventId: string) => void;

  // UI States
  windUnit: WindUnit;
  setWindUnit: (unit: WindUnit) => void;
  convertWind: (knots: number) => { value: number; unitStr: string };
  beachMode: boolean; // High-contrast mode for bright sunlight on beach
  setBeachMode: (enabled: boolean | ((prev: boolean) => boolean)) => void;

  // Modals & Drawers
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isLoggerOpen: boolean;
  setIsLoggerOpen: (open: boolean) => void;
  isCalculatorOpen: boolean;
  setIsCalculatorOpen: (open: boolean) => void;
  isNewPostOpen: boolean;
  setIsNewPostOpen: (open: boolean) => void;
  isNewAlertOpen: boolean;
  setIsNewAlertOpen: (open: boolean) => void;
  activeTab: 'favoritos' | 'mapa' | 'destaques' | 'sessoes' | 'alertas' | 'perfil' | 'mais';
  setActiveTab: (tab: 'favoritos' | 'mapa' | 'destaques' | 'sessoes' | 'alertas' | 'perfil' | 'mais') => void;

  // Real-time refresh
  refreshWindData: () => void;
  isRefreshing: boolean;
}

const KiteDataContext = createContext<KiteDataContextType | undefined>(undefined);

const SPOTS_KEY = 'kiteninja_spots';
const SESSIONS_KEY = 'kiteninja_sessions';
const POSTS_KEY = 'kiteninja_posts';
const ALERTS_KEY = 'kiteninja_alerts';

export const KiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [spots, setSpots] = useState<Spot[]>(() => {
    const saved = localStorage.getItem(SPOTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SPOTS;
  });

  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');

  const [sessions, setSessions] = useState<SessionLog[]>(() => {
    const saved = localStorage.getItem(SESSIONS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem(POSTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  const [safetyAlerts, setSafetyAlerts] = useState<SafetyOccurrence[]>(() => {
    const saved = localStorage.getItem(ALERTS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SAFETY_ALERTS;
  });

  const [events, setEvents] = useState<KiteEvent[]>(INITIAL_EVENTS);
  const [windUnit, setWindUnit] = useState<WindUnit>('nós');
  const [beachMode, setBeachMode] = useState<boolean>(false);

  // Modals & Navigation
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isNewAlertOpen, setIsNewAlertOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'favoritos' | 'mapa' | 'destaques' | 'sessoes' | 'alertas' | 'perfil' | 'mais'>('favoritos');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    localStorage.setItem(SPOTS_KEY, JSON.stringify(spots));
  }, [spots]);

  useEffect(() => {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(safetyAlerts));
  }, [safetyAlerts]);

  const toggleFavorite = (spotId: string) => {
    setSpots(prev =>
      prev.map(sp => (sp.id === spotId ? { ...sp, isFavorite: !sp.isFavorite } : sp))
    );
    if (selectedSpot && selectedSpot.id === spotId) {
      setSelectedSpot(prev => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  const convertWind = (knots: number) => {
    if (windUnit === 'km/h') {
      return { value: Math.round(knots * 1.852), unitStr: 'km/h' };
    }
    if (windUnit === 'mph') {
      return { value: Math.round(knots * 1.15078), unitStr: 'mph' };
    }
    return { value: Math.round(knots), unitStr: 'nós' };
  };

  const addSession = (sessionData: Omit<SessionLog, 'id' | 'createdAt' | 'likesCount' | 'commentsCount'>) => {
    const newSession: SessionLog = {
      ...sessionData,
      id: `sess_${Date.now()}`,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
    };
    setSessions(prev => [newSession, ...prev]);

    // Also auto-post to feed if public
    if (newSession.isPublic) {
      const newPost: CommunityPost = {
        id: `post_auto_${Date.now()}`,
        authorName: newSession.userName,
        authorAvatar: newSession.userAvatar,
        authorRiderId: '4011',
        authorCountryFlag: '🇧🇷',
        title: `Velejo no spot ${newSession.spotName}`,
        content: newSession.notes || `Sessão concluída! ${newSession.durationMinutes} minutos de velejo com pipa ${newSession.kiteSizeM2}m² e vento de ${newSession.avgWindKnots} nós.`,
        spotName: newSession.spotName,
        spotLocation: newSession.spotLocation,
        timestamp: 'Agora mesmo',
        photoUrl: newSession.photoUrl,
        windReport: {
          knots: newSession.avgWindKnots,
          kiteUsed: `${newSession.kiteSizeM2}m² (${newSession.discipline})`,
          condition: newSession.waterCondition,
        },
        likes: 1,
        isLiked: true,
        comments: [],
        shares: 0,
        tag: 'Registro de Sessão',
      };
      setPosts(prev => [newPost, ...prev]);
    }
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const addPost = (postData: Omit<CommunityPost, 'id' | 'likes' | 'comments' | 'shares'>) => {
    const newPost: CommunityPost = {
      ...postData,
      id: `post_${Date.now()}`,
      likes: 0,
      isLiked: false,
      comments: [],
      shares: 0,
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const toggleLikePost = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  const addComment = (postId: string, text: string, userName: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: `c_${Date.now()}`,
                userName,
                text,
                time: 'Agora',
              },
            ],
          };
        }
        return p;
      })
    );
  };

  const addSafetyAlert = (alertData: Omit<SafetyOccurrence, 'id' | 'timestamp' | 'status'>) => {
    const newAlert: SafetyOccurrence = {
      ...alertData,
      id: `occ_${Date.now()}`,
      timestamp: 'Hoje (recente)',
      status: 'Ativo',
    };
    setSafetyAlerts(prev => [newAlert, ...prev]);
  };

  const toggleEventRegistration = (eventId: string) => {
    setEvents(prev =>
      prev.map(ev => {
        if (ev.id === eventId) {
          const isReg = !ev.isRegistered;
          return {
            ...ev,
            isRegistered: isReg,
            participantsCount: isReg ? ev.participantsCount + 1 : Math.max(0, ev.participantsCount - 1),
          };
        }
        return ev;
      })
    );
  };

  const refreshWindData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSpots(prev =>
        prev.map(sp => {
          // slight live fluctuation in knots
          const delta = (Math.random() - 0.48) * 1.8;
          const newCurrent = Math.max(8, Math.round((sp.currentKnots + delta) * 10) / 10);
          return {
            ...sp,
            currentKnots: newCurrent,
            maxKnots: Math.round(newCurrent + 5 + Math.random() * 3),
            lastUpdated: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          };
        })
      );
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <KiteDataContext.Provider
      value={{
        spots,
        selectedSpot,
        setSelectedSpot,
        toggleFavorite,
        searchQuery,
        setSearchQuery,
        selectedStateFilter,
        setSelectedStateFilter,
        sessions,
        addSession,
        deleteSession,
        posts,
        addPost,
        toggleLikePost,
        addComment,
        safetyAlerts,
        addSafetyAlert,
        events,
        toggleEventRegistration,
        windUnit,
        setWindUnit,
        convertWind,
        beachMode,
        setBeachMode,
        isSidebarOpen,
        setIsSidebarOpen,
        isLoggerOpen,
        setIsLoggerOpen,
        isCalculatorOpen,
        setIsCalculatorOpen,
        isNewPostOpen,
        setIsNewPostOpen,
        isNewAlertOpen,
        setIsNewAlertOpen,
        activeTab,
        setActiveTab,
        refreshWindData,
        isRefreshing,
      }}
    >
      {children}
    </KiteDataContext.Provider>
  );
};

export const useKiteData = () => {
  const context = useContext(KiteDataContext);
  if (!context) {
    throw new Error('useKiteData must be used within a KiteDataProvider');
  }
  return context;
};
