import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isAxiosError } from "axios";
import {
  api,
  setAuthToken,
  type Customer,
  type Session,
} from "../services/api";
import { readSession, saveSession, clearSession } from "./storage";
type State = {
  user: Customer | null;
  loading: boolean;
  accept: (session: Session) => Promise<void>;
  signOut: () => Promise<void>;
  retry: () => void;
  error: string | null;
};
const Context = createContext<State | null>(null);
export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clear = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    await clearSession();
  }, []);
  const bootstrap = useCallback(async () => {
    try {
      const value = await readSession();
      if (value) {
        const stored: unknown = JSON.parse(value);
        if (
          typeof stored !== "object" ||
          stored === null ||
          !("token" in stored) ||
          !("expiresAt" in stored) ||
          typeof stored.token !== "string" ||
          typeof stored.expiresAt !== "string" ||
          !/^[A-Za-z0-9_-]{43}$/.test(stored.token) ||
          !Number.isFinite(new Date(stored.expiresAt).getTime()) ||
          new Date(stored.expiresAt).getTime() <= Date.now()
        )
          await clear();
        else {
          setAuthToken(stored.token);
          const { data } = await api.get<Customer>("/auth/me");
          if (data.role !== "CUSTOMER") await clear();
          else setUser(data);
        }
      }
    } catch (cause) {
      if (
        cause instanceof SyntaxError ||
        (isAxiosError(cause) && cause.response?.status === 401)
      )
        await clear();
      else
        setError(
          "Could not restore your session. Check your connection and retry.",
        );
    } finally {
      setLoading(false);
    }
  }, [clear]);
  useEffect(() => {
    const id = api.interceptors.response.use(
      (response) => response,
      async (cause) => {
        if (cause.response?.status === 401) await clear();
        return Promise.reject(cause);
      },
    );
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore secure storage and validate the session with the backend on mount.
    void bootstrap();
    return () => api.interceptors.response.eject(id);
  }, [bootstrap, clear]);
  const accept = async (session: Session) => {
    if (session.user.role !== "CUSTOMER")
      throw new Error("Customer account required");
    await saveSession(
      JSON.stringify({ token: session.token, expiresAt: session.expiresAt }),
    );
    setAuthToken(session.token);
    setUser(session.user);
    setError(null);
  };
  const signOut = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      await clear();
    }
  };
  return (
    <Context.Provider
      value={{
        user,
        loading,
        error,
        accept,
        signOut,
        retry: () => {
          setLoading(true);
          setError(null);
          void bootstrap();
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useSession() {
  const value = useContext(Context);
  if (!value) throw new Error("SessionProvider is required");
  return value;
}
