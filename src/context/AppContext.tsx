"use client";

import { usePathname } from "next/navigation";
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
import type { Enquiry, EnquiryStatus, Flat, FlatInput } from "@/lib/types";
import { loadFavorites, saveFavorites } from "@/lib/storage";
import { extrasPublicUrl, getSupabaseBrowser } from "@/lib/supabase/client";
import { applyExtra, CATALOG_COLUMNS, NEARBY_COLUMNS, rowToFlat, type FlatExtra } from "@/lib/supabase/map";
import { isStaffRole, roleCan, type StaffRole } from "@/lib/staff-roles";
import { userIsStaff } from "@/lib/supabase/staff-auth";

type AppContextValue = {
  ready: boolean;
  sessionChecked: boolean;
  loadError: string;
  flats: Flat[];
  enquiries: Enquiry[];
  favorites: string[];
  isAdmin: boolean;
  staffRole: StaffRole | null;
  login: (email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  addFlat: (input: FlatInput) => Promise<Flat>;
  updateFlat: (id: string, input: FlatInput) => Promise<Flat | null>;
  deleteFlat: (id: string) => Promise<void>;
  resetData: () => Promise<void>;
  toggleFavorite: (id: string) => void;
  submitEnquiry: (enquiry: Omit<Enquiry, "id" | "createdAt">) => Promise<Enquiry>;
  updateEnquiry: (
    id: string,
    patch: { status?: EnquiryStatus; reply?: string; followUpAt?: string | null },
  ) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  clearEnquiries: () => Promise<void>;
  getFlat: (id: string) => Flat | undefined;
  ensureFlatDetails: (id: string) => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);
const FLATS_CACHE_KEY = "nestora_flats_cache_v2";
const FLATS_CACHE_MS = 3 * 60 * 1000;

function readFlatsCache(): Flat[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(FLATS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; flats: Flat[] };
    if (!Array.isArray(parsed.flats) || Date.now() - parsed.at > FLATS_CACHE_MS) return null;
    return parsed.flats;
  } catch {
    return null;
  }
}

function writeFlatsCache(flats: Flat[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(FLATS_CACHE_KEY, JSON.stringify({ at: Date.now(), flats }));
  } catch {
    /* ignore quota errors */
  }
}

async function readSessionRole(): Promise<StaffRole | null> {
  const response = await fetch("/api/admin/me");
  if (!response.ok) return null;
  const body = (await response.json().catch(() => ({}))) as { role?: string };
  return isStaffRole(body.role) ? body.role : null;
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const body = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error || "Request failed");
  }
  return body as T;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [flats, setFlats] = useState<Flat[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [staffRole, setStaffRole] = useState<StaffRole | null>(null);
  const detailedIds = useRef(new Set<string>());
  const leadsLoaded = useRef(false);

  const loadFlats = useCallback(async (force = false) => {
    if (!force) {
      const cached = readFlatsCache();
      if (cached) {
        setFlats(cached);
        return;
      }
    }
    const [rows, extrasResponse] = await Promise.all([
      getSupabaseBrowser().from("flats").select(CATALOG_COLUMNS).order("listed_at", { ascending: false }),
      fetch(extrasPublicUrl()),
    ]);
    if (rows.error) throw new Error(rows.error.message);
    const extras: Record<string, FlatExtra> = extrasResponse.ok
      ? ((await extrasResponse.json()) as Record<string, FlatExtra>)
      : {};
    const list = (rows.data ?? []) as unknown as Parameters<typeof rowToFlat>[0][];
    const next = list.map((row) => applyExtra(rowToFlat(row), extras[row.id]));
    writeFlatsCache(next);
    setFlats(next);
  }, []);

  const loadEnquiries = useCallback(async () => {
    setEnquiries(await apiJson<Enquiry[]>("/api/enquiries"));
    leadsLoaded.current = true;
  }, []);

  const ensureFlatDetails = useCallback(async (id: string) => {
    if (detailedIds.current.has(id)) return;
    const { data, error } = await getSupabaseBrowser()
      .from("flats")
      .select(NEARBY_COLUMNS)
      .eq("id", id)
      .maybeSingle();
    detailedIds.current.add(id);
    if (error || !data) return;
    setFlats((current) =>
      current.map((flat) =>
        flat.id === id
          ? {
              ...flat,
              nearbySchools: data.nearby_schools ?? [],
              nearbyColleges: data.nearby_colleges ?? [],
              nearbyHospitals: data.nearby_hospitals ?? [],
              nearbyTransport: data.nearby_transport ?? [],
              mapUrl: data.map_url ?? flat.mapUrl ?? null,
              latitude: data.latitude ?? flat.latitude ?? null,
              longitude: data.longitude ?? flat.longitude ?? null,
            }
          : flat,
      ),
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    setFavorites(loadFavorites());
    void loadFlats()
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Could not load listings");
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loadFlats]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const admin = await userIsStaff(getSupabaseBrowser());
        if (!cancelled) setIsAdmin(admin);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!pathname.startsWith("/admin") || sessionChecked) return;
    let cancelled = false;
    void (async () => {
      let admin = false;
      try {
        admin = await userIsStaff(getSupabaseBrowser());
      } catch {
        admin = false;
      }
      if (cancelled) return;
      setIsAdmin(admin);
      if (admin) {
        try {
          setStaffRole(await readSessionRole());
        } catch {
          setStaffRole(null);
        }
      }
      if (!cancelled) setSessionChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [pathname, sessionChecked]);

  useEffect(() => {
    if (!sessionChecked || !staffRole) return;
    if (!pathname.startsWith("/admin") || pathname === "/admin/login") return;
    if (!roleCan(staffRole, "readEnquiries") || leadsLoaded.current) return;
    void loadEnquiries().catch(() => {
      leadsLoaded.current = false;
    });
  }, [pathname, sessionChecked, staffRole, loadEnquiries]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      return body.error || "Could not sign in.";
    }
    setIsAdmin(true);
    const role = await readSessionRole();
    setStaffRole(role);
    setSessionChecked(true);
    if (role && roleCan(role, "readEnquiries")) await loadEnquiries();
    return null;
  }, [loadEnquiries]);

  const logout = useCallback(async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsAdmin(false);
    setStaffRole(null);
    setEnquiries([]);
    leadsLoaded.current = false;
  }, []);

  const addFlat = useCallback(
    async (input: FlatInput) => {
      const flat = await apiJson<Flat>("/api/flats", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setFlats((current) => {
        const next = [flat, ...current.filter((item) => item.id !== flat.id)];
        writeFlatsCache(next);
        return next;
      });
      return flat;
    },
    [],
  );

  const updateFlat = useCallback(
    async (id: string, input: FlatInput) => {
      const existing = flats.find((flat) => flat.id === id);
      if (!existing) return null;
      const flat = await apiJson<Flat>(`/api/flats/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ...input, listedAt: existing.listedAt }),
      });
      setFlats((current) => {
        const next = current.map((item) => (item.id === id ? flat : item));
        writeFlatsCache(next);
        return next;
      });
      return flat;
    },
    [flats],
  );

  const deleteFlat = useCallback(async (id: string) => {
    await apiJson(`/api/flats/${id}`, { method: "DELETE" });
    setFlats((current) => {
      const next = current.filter((flat) => flat.id !== id);
      writeFlatsCache(next);
      return next;
    });
    setFavorites((current) => {
      const next = current.filter((favoriteId) => favoriteId !== id);
      saveFavorites(next);
      return next;
    });
  }, []);

  const resetData = useCallback(async () => {
    await apiJson("/api/flats/reset", { method: "POST" });
    await loadFlats(true);
    setEnquiries([]);
    leadsLoaded.current = true;
    setFavorites([]);
    saveFavorites([]);
  }, [loadFlats]);

  const toggleFavorite = useCallback(
    (id: string) => {
      const next = favorites.includes(id)
        ? favorites.filter((favoriteId) => favoriteId !== id)
        : [...favorites, id];
      setFavorites(next);
      saveFavorites(next);
    },
    [favorites],
  );

  const submitEnquiry = useCallback(async (enquiry: Omit<Enquiry, "id" | "createdAt">) => {
    const saved = await apiJson<Enquiry>("/api/enquiries", {
      method: "POST",
      body: JSON.stringify(enquiry),
    });
    if (isAdmin) setEnquiries((current) => [saved, ...current]);
    return saved;
  }, [isAdmin]);

  const updateEnquiry = useCallback(
    async (id: string, patch: { status?: EnquiryStatus; reply?: string; followUpAt?: string | null }) => {
      const note = await apiJson<{ status: EnquiryStatus; reply: string; followUpAt?: string | null }>(`/api/enquiries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      setEnquiries((current) =>
        current.map((enquiry) => (enquiry.id === id ? { ...enquiry, ...note } : enquiry)),
      );
    },
    [],
  );

  const deleteEnquiry = useCallback(async (id: string) => {
    await apiJson(`/api/enquiries/${id}`, { method: "DELETE" });
    setEnquiries((current) => current.filter((enquiry) => enquiry.id !== id));
  }, []);

  const clearEnquiries = useCallback(async () => {
    await apiJson("/api/enquiries", { method: "DELETE" });
    setEnquiries([]);
  }, []);

  const getFlat = useCallback(
    (id: string) => flats.find((flat) => flat.id === id),
    [flats],
  );

  const value = useMemo(
    () => ({
      ready,
      sessionChecked,
      loadError,
      flats,
      enquiries,
      favorites,
      isAdmin,
      staffRole,
      login,
      logout,
      addFlat,
      updateFlat,
      deleteFlat,
      resetData,
      toggleFavorite,
      submitEnquiry,
      updateEnquiry,
      deleteEnquiry,
      clearEnquiries,
      getFlat,
      ensureFlatDetails,
    }),
    [
      ready,
      sessionChecked,
      loadError,
      flats,
      enquiries,
      favorites,
      isAdmin,
      staffRole,
      login,
      logout,
      addFlat,
      updateFlat,
      deleteFlat,
      resetData,
      toggleFavorite,
      submitEnquiry,
      updateEnquiry,
      deleteEnquiry,
      clearEnquiries,
      getFlat,
      ensureFlatDetails,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
