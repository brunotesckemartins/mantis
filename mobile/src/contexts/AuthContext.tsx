// mobile/src/contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Platform } from 'react-native';
import * as SecureStore from '../api/secureStore';
import api from '../api/client';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'requester' | 'technician' | 'manager';
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const storedToken = await SecureStore.getItemAsync('mantis_token');
        const storedUser = await SecureStore.getItemAsync('mantis_user');

        if (storedToken && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do storage', error);
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  async function signIn(email: string, pass: string) {
    try {
      const response = await api.post('/auth/login', {
        user: { email, password: pass }
      });

      const token = response.headers['authorization']?.split(' ')[1];
      const loggedUser = response.data.user;

      if (token && loggedUser) {
        await SecureStore.setItemAsync('mantis_token', token);
        await SecureStore.setItemAsync('mantis_user', JSON.stringify(loggedUser));
        setUser(loggedUser);
      } else {
        throw new Error("Token ou usuário não retornados pela API.");
      }
    } catch (error: any) {
      console.error("ERRO NO LOGIN:", error);
      const msg = error.response?.data?.message || error.message || 'Erro desconhecido';
      throw new Error(`Erro: ${msg}`);
    }
  }

  async function signOut() {
    try {
      await SecureStore.deleteItemAsync('mantis_token');
      await SecureStore.deleteItemAsync('mantis_user');
      setUser(null);

      // Correção crucial para a versão Web: 
      // Força o recarregamento da página para limpar o estado do React Navigation
      if (Platform.OS === 'web') {
        window.location.reload();
      }
    } catch (error) {
      console.error('Erro ao fazer logout', error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};