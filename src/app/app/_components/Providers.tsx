"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useState } from "react";
import NotificationRingerProvider from "./NotificationRinger";
import CallScreen from "./CallScreen";

// ============ Call Context (Twilio WebRTC) ============
type CallTarget = {
  prospectId: string;
  prospectPhone: string;
  prospectName?: string | null;
  prospectVehicle?: string | null;
  prospectPrice?: number | null;
  prospectNotes?: string | null;
};

type CallContextValue = {
  startCall: (target: CallTarget) => void;
  activeCall: CallTarget | null;
};

const CallContext = createContext<CallContextValue>({
  startCall: () => {},
  activeCall: null,
});

export function useCall() {
  return useContext(CallContext);
}

function CallProvider({ children }: { children: React.ReactNode }) {
  const [activeCall, setActiveCall] = useState<CallTarget | null>(null);
  return (
    <CallContext.Provider value={{ startCall: (t) => setActiveCall(t), activeCall }}>
      {children}
      {activeCall && (
        <CallScreen
          prospectId={activeCall.prospectId}
          prospectPhone={activeCall.prospectPhone}
          prospectName={activeCall.prospectName}
          prospectVehicle={activeCall.prospectVehicle}
          prospectPrice={activeCall.prospectPrice}
          prospectNotes={activeCall.prospectNotes}
          onClose={() => setActiveCall(null)}
        />
      )}
    </CallContext.Provider>
  );
}

// ============ Search Context ============
type SearchContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

const SearchContext = createContext<SearchContextValue>({
  open: false,
  setOpen: () => {},
  toggle: () => {},
});

export function useSearchPanel() {
  return useContext(SearchContext);
}

function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <SearchContext.Provider value={{ open, setOpen, toggle: () => setOpen((v) => !v) }}>
      {children}
    </SearchContext.Provider>
  );
}

// ============ Providers ============
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationRingerProvider>
        <CallProvider>
          <SearchProvider>{children}</SearchProvider>
        </CallProvider>
      </NotificationRingerProvider>
    </SessionProvider>
  );
}
