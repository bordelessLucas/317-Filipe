import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";

// Tenta importar Constants do Expo, mas não falha se não estiver disponível
let Constants: any;
try {
  Constants = require('expo-constants');
} catch (e) {
  // Expo constants não disponível, usar apenas process.env
  Constants = { expoConfig: { extra: {} } };
}

// Firebase configuration from environment variables
// Fallback para as chaves do projeto se as variáveis de ambiente não estiverem configuradas
const firebaseConfig = {
  apiKey: Constants?.expoConfig?.extra?.firebaseApiKey || 
          process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 
          'AIzaSyCuWUfpMJy0-Qact-j80l3PLfC9ORild0g',
  authDomain: Constants?.expoConfig?.extra?.firebaseAuthDomain || 
              process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 
              'filipe-2cf31.firebaseapp.com',
  projectId: Constants?.expoConfig?.extra?.firebaseProjectId || 
             process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 
             'filipe-2cf31',
  storageBucket: Constants?.expoConfig?.extra?.firebaseStorageBucket || 
                 process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                 'filipe-2cf31.firebasestorage.app',
  messagingSenderId: Constants?.expoConfig?.extra?.firebaseMessagingSenderId || 
                     process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 
                     '1077307405869',
  appId: Constants?.expoConfig?.extra?.firebaseAppId || 
         process.env.EXPO_PUBLIC_FIREBASE_APP_ID || 
         '1:1077307405869:web:ed138fea5441f9bb952aa4',
};

// Validate that all required config values are present
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

if (missingKeys.length > 0) {
  console.warn(`⚠️ Firebase config missing keys: ${missingKeys.join(', ')}`);
  console.warn('⚠️ Algumas funcionalidades podem não funcionar sem as configurações do Firebase.');
}

// Initialize Firebase
let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

try {
  if (getApps().length === 0) {
    // Sempre tenta inicializar com as configurações disponíveis
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
    console.log('✅ Firebase inicializado com sucesso!');
  } else {
    app = getApps()[0];
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    storageInstance = getStorage(app);
    console.log('✅ Firebase já estava inicializado, reutilizando instância.');
  }
} catch (error) {
  console.error('❌ Erro ao inicializar Firebase:', error);
  // Mesmo com erro, tenta continuar
  console.warn('⚠️ Continuando sem Firebase. Algumas funcionalidades podem não estar disponíveis.');
}

// Initialize Firebase services
export const auth: Auth | null = authInstance;
export const db: Firestore | null = dbInstance;
export const storage: FirebaseStorage | null = storageInstance;

// Verificação final
if (!dbInstance) {
  console.error('❌ Firebase Firestore (db) não foi inicializado!');
} else {
  console.log('✅ Firebase Firestore (db) inicializado e pronto para uso!');
}

// Export the app instance
export default app;
