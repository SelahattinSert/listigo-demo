import React, { createContext, useState, useEffect, useCallback } from 'react';
import { AuthContextType, AuthResponse, UserDto, UserMetadata, UserResponse } from '../types';
import apiService from '../services/apiService';
import { LOCAL_STORAGE_KEYS, ROLES } from '../constants';
import { jwtDecode } from 'jwt-decode';
import Spinner from '../components/ui/Spinner';

interface DecodedToken {
  sub: string;
  roles: string[];
  iat: number;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserMetadata | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[] | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const clearAuthData = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRoles(null);
    setIsAuthenticated(false);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_ROLES);
  }, []);

  const decodeAndSetTokenData = useCallback((token: string, userData?: UserMetadata) => {
    try {
      const decodedToken = jwtDecode<DecodedToken>(token);
      const newRoles = decodedToken.roles || [ROLES.USER];
      
      setAccessToken(token);
      setIsAuthenticated(true);
      setRoles(newRoles);
      localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(LOCAL_STORAGE_KEYS.USER_ROLES, JSON.stringify(newRoles));

      if (userData) {
        setUser(userData);
        localStorage.setItem(LOCAL_STORAGE_KEYS.USER_INFO, JSON.stringify(userData));
      } else {
        const storedUserString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_INFO);
        if (storedUserString) {
          try {
            const storedUser = JSON.parse(storedUserString) as UserMetadata;
            if (storedUser.userId === decodedToken.sub) {
              setUser(storedUser);
            } else {
              localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
              setUser(null);
            }
          } catch (parseError) {
            console.error("Failed to parse stored user info:", parseError);
            localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error("Failed to decode token or set auth data:", error);
      clearAuthData();
    }
  }, [clearAuthData]);

  const logout = useCallback(() => {
    clearAuthData();
  }, [clearAuthData]);

  useEffect(() => {
    setLoading(true);
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
    
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp * 1000 > Date.now()) {
          decodeAndSetTokenData(storedToken);
        } else {
          logout();
        }
      } catch (e) {
        console.error("Error initializing auth state from localStorage:", e);
        logout();
      }
    }
    setLoading(false);
  }, [decodeAndSetTokenData, logout]);


  const login = async (data: AuthResponse): Promise<void> => {
    decodeAndSetTokenData(data.accessToken, data.user);
  };

  const register = async (userData: UserDto): Promise<UserResponse> => {
    const response = await apiService<UserResponse, UserDto>('POST', '/auth/register', userData);
    return response;
  };

  const updateUserContext = (updatedUser: UserMetadata) => {
    setUser(updatedUser);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER_INFO, JSON.stringify(updatedUser));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, roles, accessToken, login, logout, register, updateUserContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;