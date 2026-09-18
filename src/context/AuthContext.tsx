import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types.ts';

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: (email: string, name?: string, avatarUrl?: string) => Promise<boolean>;
  loginWithGmail: (email: string, name?: string, avatarUrl?: string) => Promise<boolean>;
  loginWithGoogleOAuthCode: (code: string) => Promise<boolean>;
  loginWithAdminCredentials: (password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<boolean>;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from storage (does NOT auto-log-in guests)
  useEffect(() => {
    const storedAccess = localStorage.getItem('solevault_access_token');
    const storedRefresh = localStorage.getItem('solevault_refresh_token');

    if (storedAccess && storedRefresh) {
      setAccessToken(storedAccess);
      setRefreshToken(storedRefresh);

      // Verify token
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedAccess}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          // Try refresh
          return refreshAccessToken(storedRefresh);
        })
        .then((data) => {
          if (data?.user) {
            setUser(data.user);
          } else {
            clearSession();
          }
        })
        .catch(() => clearSession())
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const refreshAccessToken = async (rToken: string) => {
    try {
      const res = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        setUser(data.user);
        localStorage.setItem('solevault_access_token', data.accessToken);
        localStorage.setItem('solevault_refresh_token', data.refreshToken);
        return data;
      }
    } catch (err) {
      console.error('Failed to refresh access token:', err);
    }
    return null;
  };

  const clearSession = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('solevault_access_token');
    localStorage.removeItem('solevault_refresh_token');
    sessionStorage.removeItem('solevault_active_order');
  };

  const loginWithGoogle = async (email: string, name?: string, avatarUrl?: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login-google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, avatarUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to sign in with Google');
      }

      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      localStorage.setItem('solevault_access_token', data.accessToken);
      localStorage.setItem('solevault_refresh_token', data.refreshToken);
      return true;
    } catch (err: any) {
      alert(err.message || 'Google sign-in failed');
      return false;
    }
  };

  const loginWithGmail = loginWithGoogle;

  const loginWithGoogleOAuthCode = async (code: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/google/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Google OAuth code exchange failed');
      }

      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      localStorage.setItem('solevault_access_token', data.accessToken);
      localStorage.setItem('solevault_refresh_token', data.refreshToken);
      return true;
    } catch (err: any) {
      console.error('Google OAuth error:', err);
      alert(err.message || 'Google OAuth sign-in failed');
      return false;
    }
  };

  const loginWithAdminCredentials = async (
    password: string,
    email = 'admin@solevault.com'
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        return { success: false, error: err.error || 'Invalid admin credentials' };
      }

      const data = await res.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      localStorage.setItem('solevault_access_token', data.accessToken);
      localStorage.setItem('solevault_refresh_token', data.refreshToken);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Admin login failed' };
    }
  };

  const logout = async () => {
    const tokenToRevoke = refreshToken;
    clearSession();
    if (tokenToRevoke) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: tokenToRevoke }),
        });
      } catch (e) {
        // network error on logout can be ignored
      }
    }
  };

  const updateUserProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!accessToken) return false;
    try {
      const res = await fetchWithAuth('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const resData = await res.json();
        setUser(resData.user);
        return true;
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
    return false;
  };

  // Authenticated fetch wrapper with automatic JWT token refresh on 401
  const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
    let token = accessToken;
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    let response = await fetch(url, { ...options, headers });

    // Handle token expiration & refresh
    if (response.status === 401 && refreshToken) {
      const refreshResult = await refreshAccessToken(refreshToken);
      if (refreshResult?.accessToken) {
        headers.set('Authorization', `Bearer ${refreshResult.accessToken}`);
        response = await fetch(url, { ...options, headers });
      }
    }

    return response;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        loginWithGoogle,
        loginWithGmail,
        loginWithGoogleOAuthCode,
        loginWithAdminCredentials,
        logout,
        updateUserProfile,
        fetchWithAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
