"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Enquiry, Flat, FlatInput } from "@/lib/types";
import {
  createId,
  isAdminAuthenticated,
  loadEnquiries,
  loadFavorites,
  loadFlats,
  resetFlatsToSeed,
  saveEnquiries,
  saveFavorites,
  saveFlats,
  setAdminAuthenticated,
} from "@/lib/storage";
import { ADMIN_CREDENTIALS } from "@/lib/seed";

type AppContextValue = {
  ready: boolean;
  flats: Flat[];
  enquiries: Enquiry[];
  favorites: string[];
  isAdmin: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addFlat: (input: FlatInput) => Flat;
  updateFlat: (id: string, input: FlatInput) => Flat | null;
  deleteFlat: (id: string) => void;
  resetData: () => void;
  toggleFavorite: (id: string) => void;
  submitEnquiry: (enquiry: Omit<Enquiry, "id" | "createdAt">) => Enquiry;
  clearEnquiries: () => void;
  getFlat: (id: string) => Flat | undefined;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setFlats(loadFlats());
    setEnquiries(loadEnquiries());
    setFavorites(loadFavorites());
    setIsAdmin(isAdminAuthenticated());
    setReady(true);
  }, []);

  const persistFlats = useCallback((next: Flat[]) => {
    setFlats(next);
    saveFlats(next);
  }, []);

  const login = useCallback((username: string, password: string) => {
    const ok =
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password;
    if (ok) {
      setAdminAuthenticated(true);
      setIsAdmin(true);
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setAdminAuthenticated(false);
    setIsAdmin(false);
  }, []);

  const addFlat = useCallback(
    (input: FlatInput) => {
      const now = new Date().toISOString();
      const flat: Flat = {
        ...input,
        id: createId("flat"),
        listedAt: now,
        updatedAt: now,
      };
      persistFlats([flat, ...flats]);
      return flat;
    },
    [flats, persistFlats],
  );

  const updateFlat = useCallback(
    (id: string, input: FlatInput) => {
      const index = flats.findIndex((f) => f.id === id);
      if (index < 0) return null;
      const updated: Flat = {
        ...flats[index],
        ...input,
        id,
        updatedAt: new Date().toISOString(),
      };
      const next = [...flats];
      next[index] = updated;
      persistFlats(next);
      return updated;
    },
    [flats, persistFlats],
  );

  const deleteFlat = useCallback(
    (id: string) => {
      persistFlats(flats.filter((f) => f.id !== id));
      const nextFav = favorites.filter((fid) => fid !== id);
      setFavorites(nextFav);
      saveFavorites(nextFav);
    },
    [favorites, flats, persistFlats],
  );

  const resetData = useCallback(() => {
    const seeded = resetFlatsToSeed();
    setFlats(seeded);
    setEnquiries([]);
    saveEnquiries([]);
    setFavorites([]);
    saveFavorites([]);
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = favorites.includes(id)
        ? favorites.filter((fid) => fid !== id)
        : [...favorites, id];
      setFavorites(next);
      saveFavorites(next);
    },
    [favorites],
  );

  const submitEnquiry = useCallback(
    (enquiry: Omit<Enquiry, "id" | "createdAt">) => {
      const entry: Enquiry = {
        ...enquiry,
        id: createId("enq"),
        createdAt: new Date().toISOString(),
      };
      const next = [entry, ...enquiries];
      setEnquiries(next);
      saveEnquiries(next);
      return entry;
    },
    [enquiries],
  );

  const clearEnquiries = useCallback(() => {
    setEnquiries([]);
    saveEnquiries([]);
  }, []);

  const getFlat = useCallback(
    (id: string) => flats.find((f) => f.id === id),
    [flats],
  );

  const value = useMemo(
    () => ({
      ready,
      flats,
      enquiries,
      favorites,
      isAdmin,
      login,
      logout,
      addFlat,
      updateFlat,
      deleteFlat,
      resetData,
      toggleFavorite,
      submitEnquiry,
      clearEnquiries,
      getFlat,
    }),
    [
      ready,
      flats,
      enquiries,
      favorites,
      isAdmin,
      login,
      logout,
      addFlat,
      updateFlat,
      deleteFlat,
      resetData,
      toggleFavorite,
      submitEnquiry,
      clearEnquiries,
      getFlat,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
