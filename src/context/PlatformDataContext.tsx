import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  auth,
  BOOTSTRAPPED_SUPERADMIN_EMAIL,
  formatFirestoreErrorMessage,
  googleProvider,
} from '../lib/firebase';
import {
  getAdminUserByUid,
  subscribeBuyerProfile,
  subscribeCorridors,
  subscribeDocumentTemplates,
  subscribeHistoricalPrices,
  subscribePlatformSettings,
  subscribeProducts,
  subscribePublishedInsights,
} from '../lib/firestoreRepo';
import { seedInitialDatabase, type SeedResult } from '../lib/seedDatabase';
import {
  EMPTY_PERMISSIONS,
  FULL_PERMISSIONS,
  hasAnyConsolePermission,
  normalizePermissions,
} from '../data/roles';
import type {
  AdminPermissions,
  AdminRole,
  AdminUser,
  BuyerProfile,
  CurrencyCode,
  FaqItem,
  HistoricalPricePoint,
  Incoterm,
  MarketInsight,
  PermissionKey,
  PlatformSettings,
  Product,
  RegionalDesk,
  TradeCorridor,
} from '../types/domain';
import type { TradeDocumentTemplate } from '../data/documents';

export interface PlatformDataContextValue {
  // Public live Firestore datasets
  products: Product[];
  corridors: TradeCorridor[];
  insights: MarketInsight[];
  historicalPrices: HistoricalPricePoint[];
  documentTemplates: TradeDocumentTemplate[];
  settings: PlatformSettings | null;
  fxRates: Record<CurrencyCode, number>;
  incotermDeltas: Record<Incoterm, number>;
  regionalDesks: RegionalDesk[];
  faqs: FaqItem[];
  loading: boolean;
  error: string | null;
  isDatabaseEmpty: boolean;

  // Authentication & RBAC state
  authUser: User | null;
  authLoading: boolean;
  buyerProfile: BuyerProfile | null;
  adminRecord: AdminUser | null;
  adminRole: AdminRole | null;
  adminRoleName: string | null;
  userPermissions: AdminPermissions;
  hasPermission: (key: PermissionKey) => boolean;
  hasConsoleAccess: boolean;
  isSuperAdmin: boolean;
  isAdminOrEditor: boolean;
  isAdminOrDesk: boolean;
  seeding: boolean;
  authError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  triggerSeedDatabase: (force?: boolean) => Promise<SeedResult | null>;
}

const DEFAULT_FX_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  EUR: 0.92,
  AED: 3.6725,
};

const DEFAULT_INCOTERM_DELTAS: Record<Incoterm, number> = {
  FOB: 0,
  FCA: 0,
  CFR: 28,
  CIF: 34,
  CPT: 42,
  DAP: 58,
};

const PlatformDataContext = createContext<PlatformDataContextValue | null>(null);

export function PlatformDataProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [corridors, setCorridors] = useState<TradeCorridor[]>([]);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [historicalPrices, setHistoricalPrices] = useState<HistoricalPricePoint[]>([]);
  const [documentTemplates, setDocumentTemplates] = useState<TradeDocumentTemplate[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const [loadedFlags, setLoadedFlags] = useState({
    products: false,
    corridors: false,
    insights: false,
    prices: false,
    templates: false,
    settings: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Auth & RBAC state
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [buyerProfile, setBuyerProfile] = useState<BuyerProfile | null>(null);
  const [adminRecord, setAdminRecord] = useState<AdminUser | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const autoSeedAttemptedRef = useRef(false);

  // Live Firestore public collection subscriptions
  useEffect(() => {
    const handleErr = (err: Error) => {
      setError(formatFirestoreErrorMessage(err));
    };

    const unsubProducts = subscribeProducts((data) => {
      setProducts(data);
      setLoadedFlags((prev) => ({ ...prev, products: true }));
    }, handleErr);

    const unsubCorridors = subscribeCorridors((data) => {
      setCorridors(data);
      setLoadedFlags((prev) => ({ ...prev, corridors: true }));
    }, handleErr);

    const unsubInsights = subscribePublishedInsights((data) => {
      setInsights(data);
      setLoadedFlags((prev) => ({ ...prev, insights: true }));
    }, handleErr);

    const unsubPrices = subscribeHistoricalPrices((data) => {
      setHistoricalPrices(data);
      setLoadedFlags((prev) => ({ ...prev, prices: true }));
    }, handleErr);

    const unsubTemplates = subscribeDocumentTemplates((data) => {
      setDocumentTemplates(data);
      setLoadedFlags((prev) => ({ ...prev, templates: true }));
    }, handleErr);

    const unsubSettings = subscribePlatformSettings((data) => {
      setSettings(data);
      setLoadedFlags((prev) => ({ ...prev, settings: true }));
    }, handleErr);

    return () => {
      unsubProducts();
      unsubCorridors();
      unsubInsights();
      unsubPrices();
      unsubTemplates();
      unsubSettings();
    };
  }, []);

  // Auth state & RBAC resolution
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      setAuthError(null);
      if (!user) {
        setAdminRecord(null);
        setAuthLoading(false);
        return;
      }

      try {
        const rec = await getAdminUserByUid(user.uid);
        setAdminRecord(rec);
      } catch {
        setAdminRecord(null);
      } finally {
        setAuthLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // Subscribe to signed-in buyer's own corporate profile (strict UID isolation)
  useEffect(() => {
    if (!authUser || !authUser.emailVerified) {
      setBuyerProfile(null);
      return;
    }
    const unsub = subscribeBuyerProfile(
      authUser.uid,
      (profile) => setBuyerProfile(profile),
      () => setBuyerProfile(null),
    );
    return () => unsub();
  }, [authUser]);

  const isBootstrappedSuperAdmin = Boolean(
    authUser?.emailVerified &&
      authUser.email?.toLowerCase() === BOOTSTRAPPED_SUPERADMIN_EMAIL,
  );

  const adminRole: AdminRole | null = useMemo(() => {
    if (isBootstrappedSuperAdmin) return 'superadmin';
    if (adminRecord && adminRecord.status === 'active') return adminRecord.role;
    return null;
  }, [adminRecord, isBootstrappedSuperAdmin]);

  const adminRoleName: string | null = useMemo(() => {
    if (isBootstrappedSuperAdmin) return adminRecord?.roleName || 'Superadmin';
    if (adminRecord && adminRecord.status === 'active') return adminRecord.roleName;
    return null;
  }, [adminRecord, isBootstrappedSuperAdmin]);

  const userPermissions: AdminPermissions = useMemo(() => {
    if (isBootstrappedSuperAdmin) return { ...FULL_PERMISSIONS };
    if (adminRecord && adminRecord.status === 'active') {
      if (adminRecord.role === 'superadmin') return { ...FULL_PERMISSIONS };
      return normalizePermissions(adminRecord.permissions, adminRecord.role);
    }
    return { ...EMPTY_PERMISSIONS };
  }, [adminRecord, isBootstrappedSuperAdmin]);

  const hasPermission = useCallback(
    (key: PermissionKey) => Boolean(userPermissions[key]),
    [userPermissions],
  );

  const hasConsoleAccess = useMemo(
    () => isBootstrappedSuperAdmin || hasAnyConsolePermission(userPermissions),
    [isBootstrappedSuperAdmin, userPermissions],
  );

  const isSuperAdmin = isBootstrappedSuperAdmin || userPermissions.manageRoles;
  const isAdminOrEditor =
    isSuperAdmin || userPermissions.editProductsPricing || userPermissions.editMarket;
  const isAdminOrDesk =
    hasConsoleAccess && (isAdminOrEditor || userPermissions.manageRfqs || userPermissions.viewRfqs);

  const loading = !(
    loadedFlags.products &&
    loadedFlags.corridors &&
    loadedFlags.insights &&
    loadedFlags.prices &&
    loadedFlags.templates &&
    loadedFlags.settings
  );

  const isDatabaseEmpty = !loading && products.length === 0 && !settings;

  const triggerSeedDatabase = useCallback(
    async (force = false): Promise<SeedResult | null> => {
      if (!isSuperAdmin) return null;
      setSeeding(true);
      try {
        const res = await seedInitialDatabase(force);
        return res;
      } catch (err) {
        setError(formatFirestoreErrorMessage(err));
        return null;
      } finally {
        setSeeding(false);
      }
    },
    [isSuperAdmin],
  );

  // Automatic one-time idempotent database seed when Superadmin signs in to a brand-new database
  useEffect(() => {
    if (
      !loading &&
      !authLoading &&
      isSuperAdmin &&
      isDatabaseEmpty &&
      !seeding &&
      !autoSeedAttemptedRef.current
    ) {
      autoSeedAttemptedRef.current = true;
      void triggerSeedDatabase(false);
    }
  }, [loading, authLoading, isSuperAdmin, isDatabaseEmpty, seeding, triggerSeedDatabase]);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign-in cancelled or failed.');
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    await signOut(auth);
  }, []);

  const value = useMemo<PlatformDataContextValue>(
    () => ({
      products,
      corridors,
      insights,
      historicalPrices,
      documentTemplates,
      settings,
      fxRates: settings?.fxRates ?? DEFAULT_FX_RATES,
      incotermDeltas: settings?.incotermDeltas ?? DEFAULT_INCOTERM_DELTAS,
      regionalDesks: settings?.regionalDesks ?? [],
      faqs: settings?.faqs ?? [],
      loading,
      error,
      isDatabaseEmpty,
      authUser,
      authLoading,
      buyerProfile,
      adminRecord,
      adminRole,
      adminRoleName,
      userPermissions,
      hasPermission,
      hasConsoleAccess,
      isSuperAdmin,
      isAdminOrEditor,
      isAdminOrDesk,
      seeding,
      authError,
      signInWithGoogle,
      signOutUser,
      triggerSeedDatabase,
    }),
    [
      products,
      corridors,
      insights,
      historicalPrices,
      documentTemplates,
      settings,
      loading,
      error,
      isDatabaseEmpty,
      authUser,
      authLoading,
      buyerProfile,
      adminRecord,
      adminRole,
      adminRoleName,
      userPermissions,
      hasPermission,
      hasConsoleAccess,
      isSuperAdmin,
      isAdminOrEditor,
      isAdminOrDesk,
      seeding,
      authError,
      signInWithGoogle,
      signOutUser,
      triggerSeedDatabase,
    ],
  );

  return (
    <PlatformDataContext.Provider value={value}>
      {children}
    </PlatformDataContext.Provider>
  );
}

export function usePlatformData(): PlatformDataContextValue {
  const ctx = useContext(PlatformDataContext);
  if (!ctx) {
    throw new Error('usePlatformData must be used inside PlatformDataProvider');
  }
  return ctx;
}
