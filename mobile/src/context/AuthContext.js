import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(['auth_token', 'auth_user']).then((pairs) => {
      const storedToken = pairs[0][1];
      const storedUser = pairs[1][1];
      if (storedToken) {
        setToken(storedToken);
        if (storedUser) setUser(JSON.parse(storedUser));
      }
      setLoading(false);
    });
  }, []);

  const signIn = async (email, password) => {
    const data = await apiLogin(email, password);
    await AsyncStorage.multiSet([
      ['auth_token', data.token],
      ['auth_user', JSON.stringify(data.user)],
    ]);
    setToken(data.token);
    setUser(data.user);
  };

  const signUp = async (name, email, password) => {
    // /auth/register returns the user but no token, so sign in afterwards to
    // obtain one and land the user straight in the app.
    await apiRegister(name, email, password);
    const data = await apiLogin(email, password);
    await AsyncStorage.multiSet([
      ['auth_token', data.token],
      ['auth_user', JSON.stringify(data.user)],
    ]);
    setToken(data.token);
    setUser(data.user);
  };

  const signOut = async () => {
    await AsyncStorage.multiRemove(['auth_token', 'auth_user']);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, signIn, signUp, signOut, isAuthenticated: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
