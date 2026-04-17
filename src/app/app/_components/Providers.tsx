"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useState } from "react";

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
      <SearchProvider>{children}</SearchProvider>
    </SessionProvider>
  );
}
