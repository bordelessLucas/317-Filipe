import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../lib/firebaseconfig';
import type { User, LoginCredentials, RegisterCredentials, authState } from '../../src/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = '@auth_user';

// Helper para converter Firebase Timestamp para Date
const convertTimestamp = (timestamp: any): Date => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  if (timestamp.toDate) return timestamp.toDate();
  if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
  return new Date(timestamp);
};

// Helper para converter User do Firestore para o tipo User
const convertFirestoreUser = (data: any, firebaseUser: FirebaseUser): User => {
  return {
    id: firebaseUser.uid,
    name: data.name || firebaseUser.displayName || '',
    email: firebaseUser.email || '',
    username: data.username || '',
    bio: data.bio || '',
    phone: data.phone || '',
    photoURL: data.photoURL || firebaseUser.photoURL || '',
    bannerURL: data.bannerURL || '',
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt) || new Date(),
    verified: data.verified || false,
    verificationBadge: data.verificationBadge,
    verificationRemovedReason: data.verificationRemovedReason,
    twoFactorEnabled: data.twoFactorEnabled || false,
    isBanned: data.isBanned || false,
    banReason: data.banReason,
    bannedUntil: data.bannedUntil,
    warnings: data.warnings || 0,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth não está disponível');
      setIsLoading(false);
      return;
    }

    // Monitora mudanças no estado de autenticação
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Usuário está logado, busca dados no Firestore
          await loadUserFromFirestore(firebaseUser);
        } else {
          // Usuário não está logado
          setUser(null);
          await AsyncStorage.removeItem(STORAGE_KEY);
        }
      } catch (err: any) {
        console.error('Error in auth state change:', err);
        setError(err.message || 'Erro ao verificar autenticação');
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserFromFirestore = async (firebaseUser: FirebaseUser) => {
    if (!db) {
      console.warn('Firestore não está disponível');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const convertedUser = convertFirestoreUser(userData, firebaseUser);
        setUser(convertedUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(convertedUser));
      } else {
        // Cria documento do usuário se não existir
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || '',
          email: firebaseUser.email || '',
          username: '',
          bio: '',
          phone: '',
          photoURL: firebaseUser.photoURL || '',
          bannerURL: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          verified: false,
          twoFactorEnabled: false,
          isBanned: false,
          warnings: 0,
        };

        await setDoc(userDocRef, {
          name: newUser.name,
          email: newUser.email,
          username: newUser.username,
          bio: newUser.bio,
          phone: newUser.phone,
          photoURL: newUser.photoURL,
          bannerURL: newUser.bannerURL,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          verified: false,
          twoFactorEnabled: false,
          isBanned: false,
          warnings: 0,
        });

        setUser(newUser);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      }
    } catch (err: any) {
      console.error('Error loading user from Firestore:', err);
      
      // Mensagem mais específica para erros de permissão
      if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
        const errorMsg = 'Erro de permissão: Verifique as regras do Firestore. Veja FIREBASE_FIRESTORE_RULES.md';
        console.error('❌', errorMsg);
        setError(errorMsg);
      } else {
        setError(err.message || 'Erro ao carregar dados do usuário');
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!auth) {
      setError('Firebase Auth não está disponível');
      return false;
    }

    setError(null);
    setIsLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged vai ser chamado automaticamente e carregar os dados
      return true;
    } catch (err: any) {
      console.error('Error logging in:', err);
      let errorMessage = 'Erro ao fazer login';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Usuário desabilitado';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        default:
          errorMessage = err.message || 'Erro ao fazer login';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials): Promise<boolean> => {
    if (!auth || !db) {
      setError('Firebase não está disponível');
      return false;
    }

    if (credentials.password !== credentials.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }

    setError(null);
    setIsLoading(true);

    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Atualiza o perfil com o nome
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: credentials.name,
        });

        // Cria documento do usuário no Firestore
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const username = credentials.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);

        const newUserData = {
          name: credentials.name,
          email: credentials.email,
          username: username,
          bio: '',
          phone: '',
          photoURL: '',
          bannerURL: '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          verified: false,
          twoFactorEnabled: false,
          isBanned: false,
          warnings: 0,
        };

        await setDoc(userDocRef, newUserData);

        // onAuthStateChanged vai ser chamado automaticamente e carregar os dados
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error registering:', err);
      let errorMessage = 'Erro ao criar conta';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está em uso';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'Senha muito fraca';
          break;
        default:
          errorMessage = err.message || 'Erro ao criar conta';
      }
      
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    if (!auth) {
      console.warn('Firebase Auth não está disponível');
      return;
    }

    try {
      await firebaseSignOut(auth);
      await AsyncStorage.removeItem(STORAGE_KEY);
      setUser(null);
      setError(null);
      // onAuthStateChanged vai ser chamado automaticamente
    } catch (error: any) {
      console.error('Error logging out:', error);
      setError(error.message || 'Erro ao fazer logout');
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    if (!user || !db || !auth) {
      setError('Não é possível atualizar: usuário não autenticado ou Firebase não disponível');
      return;
    }

    try {
      const userDocRef = doc(db, 'users', user.id);
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Atualiza apenas os campos fornecidos
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.username !== undefined) updateData.username = userData.username;
      if (userData.bio !== undefined) updateData.bio = userData.bio;
      if (userData.phone !== undefined) updateData.phone = userData.phone;
      if (userData.photoURL !== undefined) updateData.photoURL = userData.photoURL;
      if (userData.bannerURL !== undefined) updateData.bannerURL = userData.bannerURL;
      if (userData.verified !== undefined) updateData.verified = userData.verified;
      if (userData.verificationBadge !== undefined) updateData.verificationBadge = userData.verificationBadge;
      if (userData.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = userData.twoFactorEnabled;
      if (userData.isBanned !== undefined) updateData.isBanned = userData.isBanned;
      if (userData.banReason !== undefined) updateData.banReason = userData.banReason;
      if (userData.warnings !== undefined) updateData.warnings = userData.warnings;

      await updateDoc(userDocRef, updateData);

      // Atualiza o perfil do Firebase Auth se necessário
      if (userData.name && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: userData.name,
          photoURL: userData.photoURL || auth.currentUser.photoURL || undefined,
        });
      }

      // Atualiza o estado local
      const updatedUser = { ...user, ...userData, updatedAt: new Date() };
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.message || 'Erro ao atualizar usuário');
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
