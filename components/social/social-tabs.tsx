"use client";

import { ReactNode, useMemo } from "react";
import { cn } from "@/lib/utils";
import { SocialTabProvider, useSocialTabs, type SocialTabId } from "@/components/social/social-tab-context";

type SocialTabsProps = {
  defaultTab?: SocialTabId;
  discover: ReactNode;
  friends: ReactNode;
  chat: ReactNode;
};

function SocialTabsContent({
  discover,
  friends,
  chat,
}: Omit<SocialTabsProps, "defaultTab">) {
  const { activeTab, setActiveTab, hasNew } = useSocialTabs();

  const tabs = useMemo(
    () => [
      { id: "discover" as SocialTabId, label: "Activity" },
      { id: "friends" as SocialTabId, label: "Friends" },
      { id: "chat" as SocialTabId, label: "Chat" },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-full border border-white/10 bg-white/5 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
              activeTab === tab.id
                ? "bg-[#22D3EE]/15 text-white"
                : "text-white/60 hover:text-white"
            )}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            <span>{tab.label}</span>
            {hasNew(tab.id) ? (
              <span
                aria-hidden="true"
                className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#D946EF] shadow-[0_0_8px_rgba(217,70,239,0.8)]"
              />
            ) : null}
          </button>
        ))}
      </div>

      <div role="tabpanel" hidden={activeTab !== "discover"}>
        {discover}
      </div>
      <div role="tabpanel" hidden={activeTab !== "friends"}>
        {friends}
      </div>
      <div role="tabpanel" hidden={activeTab !== "chat"}>
        {chat}
      </div>
    </div>
  );
}

export function SocialTabs({
  defaultTab = "discover",
  discover,
  friends,
  chat,
}: SocialTabsProps) {
  return (
    <SocialTabProvider defaultTab={defaultTab}>
      <SocialTabsContent discover={discover} friends={friends} chat={chat} />
    </SocialTabProvider>
  );
}
