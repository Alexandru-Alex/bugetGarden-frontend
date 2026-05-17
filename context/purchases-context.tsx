import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Purchases, {
  Offerings,
  PurchasesPackage,
} from "react-native-purchases";
import { Platform } from "react-native";
import {
  getOfferings,
  isCancelledError,
  purchasePackage,
  rcLogIn,
  rcLogOut,
  restorePurchases,
} from "@/lib/purchases";

interface PurchasesState {
  offerings:  Offerings | null;
  isLoading:  boolean;
  error:      string | null;
  purchase:   (pkg: PurchasesPackage) => Promise<void>;
  restore:    () => Promise<void>;
  refresh:    () => Promise<void>;
  loginUser:  (userId: string) => Promise<void>;
  logoutUser: () => Promise<void>;
}

const PurchasesContext = createContext<PurchasesState | null>(null);

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [offerings, setOfferings] = useState<Offerings | null>(null);
  const [isLoading, setIsLoading] = useState(Platform.OS !== "web");
  const [error,     setError]     = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (Platform.OS === "web") return;
    try {
      setError(null);
      setOfferings(await getOfferings());
    } catch (e) {
      setError(e != null && typeof e === "object" && "message" in e ? (e as any).message : "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    setIsLoading(true);
    setError(null);
    try {
      await purchasePackage(pkg);
      // Coins are granted server-side via RevenueCat webhook → your backend.
      // Invalidate the account query so the balance refreshes.
    } catch (e) {
      if (isCancelledError(e)) throw e;
      const msg = e != null && typeof e === "object" && "message" in e ? (e as any).message : "Purchase failed";
      setError(msg);
      throw e;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await restorePurchases();
    } catch (e) {
      setError(e != null && typeof e === "object" && "message" in e ? (e as any).message : "Restore failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginUser = useCallback(async (userId: string) => {
    await rcLogIn(userId);
    await refresh();
  }, [refresh]);

  const logoutUser = useCallback(async () => {
    await rcLogOut();
  }, []);

  const value = useMemo<PurchasesState>(
    () => ({ offerings, isLoading, error, purchase, restore, refresh, loginUser, logoutUser }),
    [offerings, isLoading, error, purchase, restore, refresh, loginUser, logoutUser]
  );

  return (
    <PurchasesContext.Provider value={value}>
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases(): PurchasesState {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error("usePurchases must be inside PurchasesProvider");
  return ctx;
}
