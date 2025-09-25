import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { isNonEmpty, isValidUsername } from '../utils/validators';

type UserRole = 'admin' | 'member';

interface StoredUser {
  username: string;
  password: string;
  name: string;
  role: UserRole;
}

type SessionUser = Omit<StoredUser, 'password'>;

interface AuthContextValue {
  user: SessionUser | null;
  token: string | null;
  users: SessionUser[];
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSuccess>;
  register: (payload: RegisterPayload) => Promise<SessionUser>;
  logout: () => void;
  updateUserRole: (username: string, role: UserRole) => void;
  removeUser: (username: string) => void;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  password: string;
  confirmPassword: string;
}

interface AuthSuccess extends SessionUser {
  token: string;
}

const SESSION_STORAGE_KEY = 'aurora-nexus-auth';
const TOKEN_STORAGE_KEY = 'aurora-nexus-token';
const USERS_STORAGE_KEY = 'aurora-nexus-users';

const DEFAULT_USERS: ReadonlyArray<StoredUser> = [
  {
    username: 'admin',
    password: 'admin123',
    name: 'Aurora Admin',
    role: 'admin',
  },
];

const sanitiseUser = ({ password, ...rest }: StoredUser): SessionUser => rest;

const readJSON = <T,>(key: string): T | null => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    console.warn(`Unable to parse localStorage key: ${key}`, error);
    return null;
  }
};

const createToken = (username: string): string => {
  const base = `${username}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  if (typeof btoa === 'function') {
    return `mock-${btoa(base)}`;
  }
  return `mock-${base}`;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const readStoredUsers = (): StoredUser[] => {
    const stored = readJSON<StoredUser[]>(USERS_STORAGE_KEY);
    if (Array.isArray(stored) && stored.length) {
      return stored;
    }
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
    return [...DEFAULT_USERS];
  };

  const [users, setUsers] = useState<StoredUser[]>(readStoredUsers);
  const [user, setUser] = useState<SessionUser | null>(() => readJSON<SessionUser>(SESSION_STORAGE_KEY));
  const [token, setToken] = useState<string | null>(() => window.localStorage.getItem(TOKEN_STORAGE_KEY));
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    if (user) {
      window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  const persistUsers = (
    updater: StoredUser[] | ((prevUsers: StoredUser[]) => StoredUser[])
  ): void => {
    setUsers((prevUsers) => {
      const nextUsers = typeof updater === 'function' ? updater(prevUsers) : updater;
      window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
      return nextUsers;
    });
  };

  const login = ({ username, password }: LoginCredentials): Promise<AuthSuccess> => {
    setIsAuthenticating(true);

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalisedUsername = username.trim().toLowerCase();
        if (!isValidUsername(normalisedUsername)) {
          reject(new Error('Enter a valid username (letters, numbers, underscore).'));
        } else if (!password || password.length < 4) {
          reject(new Error('Password must be at least 4 characters.'));
        } else {
          const existingUser = users.find(
            (entry) => entry.username === normalisedUsername && entry.password === password
          );

          if (!existingUser) {
            reject(new Error('We could not find an account with those credentials.'));
          } else {
            const sessionUser = sanitiseUser(existingUser);
            const sessionToken = createToken(sessionUser.username);
            setUser(sessionUser);
            setToken(sessionToken);
            resolve({ ...sessionUser, token: sessionToken });
          }
        }
        setIsAuthenticating(false);
      }, 380);
    });
  };

  const register = ({ username, password, confirmPassword }: RegisterPayload): Promise<SessionUser> => {
    return new Promise((resolve, reject) => {
      const normalisedUsername = username.trim().toLowerCase();
      if (!isValidUsername(normalisedUsername)) {
        reject(new Error('Usernames should use letters, numbers, or underscores.'));
        return;
      }
      if (!isNonEmpty(password)) {
        reject(new Error('Choose a password.'));
        return;
      }
      if (password.length < 6) {
        reject(new Error('Password must be at least 6 characters long.'));
        return;
      }
      if (password !== confirmPassword) {
        reject(new Error('Passwords do not match.'));
        return;
      }

      const exists = users.some((entry) => entry.username === normalisedUsername);
      if (exists) {
        reject(new Error('That username is already taken.'));
        return;
      }

      const nextUser: StoredUser = {
        username: normalisedUsername,
        password,
        name: normalisedUsername,
        role: 'member',
      };

      persistUsers((prev) => [...prev, nextUser]);
      resolve(sanitiseUser(nextUser));
    });
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
  };

  const updateUserRole = (username: string, role: UserRole): void => {
    persistUsers((prev) => prev.map((entry) => (entry.username === username ? { ...entry, role } : entry)));
    setUser((prev) => (prev && prev.username === username ? { ...prev, role } : prev));
  };

  const removeUser = (username: string): void => {
    const normalisedUsername = username.toLowerCase();
    const isDefaultAdmin = DEFAULT_USERS.some((entry) => entry.username === normalisedUsername);
    if (isDefaultAdmin) {
      return;
    }
    persistUsers((prev) => prev.filter((entry) => entry.username !== normalisedUsername));
    setUser((prev) => (prev && prev.username === normalisedUsername ? null : prev));
  };

  const contextValue = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      users: users.map(sanitiseUser),
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      updateUserRole,
      removeUser,
      isAuthenticating,
    }),
    [user, token, users, isAuthenticating]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export type { AuthContextValue, SessionUser, UserRole };

