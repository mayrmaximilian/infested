"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SocialTabId = "discover" | "friends" | "chat";

type TabState = {
  latest: number;
  lastSeen: number;
};

type SocialTabContextValue = {
  activeTab: SocialTabId;
  setActiveTab: (tab: SocialTabId) => void;
  setBaseline: (tab: SocialTabId, timestamp: number) => void;
  notify: (tab: SocialTabId, timestamp: number) => void;
  markSeen: (tab: SocialTabId) => void;
  hasNew: (tab: SocialTabId) => boolean;
};

const SocialTabContext = createContext<SocialTabContextValue | null>(null);

const initialState: Record<SocialTabId, TabState> = {
  discover: { latest: 0, lastSeen: 0 },
  friends: { latest: 0, lastSeen: 0 },
  chat: { latest: 0, lastSeen: 0 },
};

type SocialTabProviderProps = {
  defaultTab: SocialTabId;
  children: ReactNode;
};

export function SocialTabProvider({
  defaultTab,
  children,
}: SocialTabProviderProps) {
  const [activeTab, setActiveTabState] =
    useState<SocialTabId>(defaultTab);
  const [tabState, setTabState] =
    useState<Record<SocialTabId, TabState>>(initialState);
  const activeRef = useRef<SocialTabId>(activeTab);

  useEffect(() => {
    activeRef.current = activeTab;
  }, [activeTab]);

  const markSeen = useCallback((tab: SocialTabId) => {
    setTabState((prev) => {
      const current = prev[tab];
      if (current.lastSeen === current.latest) return prev;
      return {
        ...prev,
        [tab]: { ...current, lastSeen: current.latest },
      };
    });
  }, []);

  const setActiveTab = useCallback(
    (tab: SocialTabId) => {
      setActiveTabState(tab);
      markSeen(tab);
    },
    [markSeen]
  );

  useEffect(() => {
    setActiveTab(defaultTab);
  }, [defaultTab, setActiveTab]);

  const setBaseline = useCallback((tab: SocialTabId, timestamp: number) => {
    if (!timestamp) return;
    setTabState((prev) => {
      const current = prev[tab];
      if (current.latest !== 0 || current.lastSeen !== 0) return prev;
      return {
        ...prev,
        [tab]: { latest: timestamp, lastSeen: timestamp },
      };
    });
  }, []);

  const notify = useCallback((tab: SocialTabId, timestamp: number) => {
    if (!timestamp) return;
    setTabState((prev) => {
      const current = prev[tab];
      const nextLatest = Math.max(current.latest, timestamp);
      if (nextLatest === current.latest) return prev;
      const isActive = activeRef.current === tab;
      return {
        ...prev,
        [tab]: {
          latest: nextLatest,
          lastSeen: isActive ? nextLatest : current.lastSeen,
        },
      };
    });
  }, []);

  const hasNew = useCallback(
    (tab: SocialTabId) => tabState[tab].latest > tabState[tab].lastSeen,
    [tabState]
  );

  const value = useMemo(
    () => ({
      activeTab,
      setActiveTab,
      setBaseline,
      notify,
      markSeen,
      hasNew,
    }),
    [activeTab, hasNew, markSeen, notify, setActiveTab, setBaseline]
  );

  return (
    <SocialTabContext.Provider value={value}>
      {children}
    </SocialTabContext.Provider>
  );
}

export function useSocialTabs() {
  const context = useContext(SocialTabContext);
  if (!context) {
    throw new Error("useSocialTabs must be used within SocialTabProvider");
  }
  return context;
}
