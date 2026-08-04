import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { adminLoginApi, adminLogoutApi } from '../api/admin/adminAuth';
import { ADMIN_SESSION_KEY } from '../api/admin/adminHttp';
import type { AdminSession } from '../types/admin/adminAuth';
import { getJwtExpiryMs } from '../utils/jwtUtils';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Fallback session lifetime when the JWT `exp` claim cannot be decoded.
 * Should never be needed in normal operation.
 */
const ADMIN_SESSION_FALLBACK_MS = 60 * 60_000; // 60 minutes

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves expiry timestamp from the JWT access token.
 * Falls back to ADMIN_SESSION_FALLBACK_MS if the claim is unreadable.
 */
const resolveExpiresAt = (accessToken: string): number => {
  const jwtExpiry = getJwtExpiryMs(accessToken);
  return jwtExpiry ?? Date.now() + ADMIN_SESSION_FALLBACK_MS;
};

/**
 * Reads the persisted admin session from localStorage.
 * Returns null if missing, expired, or corrupted.
 */
const loadStoredAdminSession = (): AdminSession | null => {
  try {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (raw === null) return null;

    const parsed = JSON.parse(raw) as Partial<AdminSession>;

    if (
      typeof parsed.accessToken !== 'string' ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt <= Date.now()
    ) {
      localStorage.removeItem(ADMIN_SESSION_KEY);
      return null;
    }

    return parsed as AdminSession;
  } catch {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    return null;
  }
};

// ─── Context shape ────────────────────────────────────────────────────────────

export interface AdminAuthContextValue {
  /** True when a valid (non-expired) admin session exists in localStorage. */
  isAdminAuthenticated: boolean;
  /** The raw JWT token, or null if not authenticated. */
  adminToken: string | null;
  /** True while the login mutation is in flight. */
  isAdminLoginPending: boolean;
  /** Error message from the last failed login attempt, or null. */
  adminLoginError: string | null;
  /**
   * Calls POST /auth/login with email + password.
   * Saves the token to localStorage on success.
   * Throws on failure (caller can catch for form error display).
   */
  adminLogin: (email: string, password: string) => Promise<void>;
  /**
   * Calls POST /auth/logout to blacklist the token, then clears localStorage.
   * Route guards will redirect to /admin/login once isAdminAuthenticated is false.
   */
  adminLogout: () => void;
}

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = (): AdminAuthContextValue => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const storedSession = loadStoredAdminSession();

  const [adminSession, setAdminSession] = useState<AdminSession | null>(
    () => storedSession,
  );
  const [isAdminLoginPending, setIsAdminLoginPending] = useState(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // ─── Login ────────────────────────────────────────────────────────────────

  const adminLogin = useCallback(async (email: string, password: string): Promise<void> => {
    setIsAdminLoginPending(true);
    setAdminLoginError(null);

    try {
      const response = await adminLoginApi({ email, password });
      /* adminLoginApi already unwraps the ApiResponse envelope */
      const { accessToken } = response;
      const expiresAt = resolveExpiresAt(accessToken);
      const session: AdminSession = { accessToken, expiresAt };

      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      setAdminSession(session);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setAdminLoginError(message);
      throw err;
    } finally {
      setIsAdminLoginPending(false);
    }
  }, []);

  // ─── Logout ───────────────────────────────────────────────────────────────

  const adminLogout = useCallback((): void => {
    // Best-effort server-side token blacklist; ignore errors so the UI still clears.
    adminLogoutApi().catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`Admin logout API call failed: ${msg}`);
    });

    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminSession(null);
    setAdminLoginError(null);
  }, []);

  // ─── Derived values ───────────────────────────────────────────────────────

  const isAdminAuthenticated = adminSession !== null;
  const adminToken = adminSession?.accessToken ?? null;

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      isAdminAuthenticated,
      adminToken,
      isAdminLoginPending,
      adminLoginError,
      adminLogin,
      adminLogout,
    }),
    [isAdminAuthenticated, adminToken, isAdminLoginPending, adminLoginError, adminLogin, adminLogout],
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
};
