import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  adminId?: string;
  createdAt: any;
  onboardingAnswers?: {
    financialGoal: string;
    investmentAmount: string;
    advisoryPreference: string;
    interactionMode: string;
    completedAt: any;
  };
}

export interface Transaction {
  id?: string;
  userId: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description?: string;
  paymentMethod: 'Carteira' | 'Banco' | 'Cartão de Crédito';
  account?: string;
  creditCardId?: string;
  installments?: number;
  installmentIndex?: number;
  installmentId?: string;
  date: any;
  createdAt: any;
}

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: any;
  createdAt: any;
}

export interface CategoryBudget {
  id?: string;
  userId: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM
}

export interface Reminder {
  id?: string;
  userId: string;
  title: string;
  date: any;
  type: 'bill' | 'goal' | 'custom';
  completed: boolean;
}

export interface Account {
  id?: string;
  userId: string;
  name: string;
  type: 'Banco' | 'Carteira' | 'Cartão de Crédito';
  initialBalance: number;
  createdAt: any;
}

export interface Category {
  id?: string;
  userId: string;
  name: string;
  type: 'income' | 'expense';
  createdAt: any;
}

export interface CreditCard {
  id?: string;
  userId: string;
  bankAccountId: string;
  name: string;
  brand?: 'Visa' | 'Mastercard' | 'Elo' | 'Amex' | 'Outro';
  lastDigits?: string;
  totalLimit: number;
  closingDay: number;
  dueDay?: number;
  createdAt: any;
}

export interface Planning {
  id?: string;
  userId: string;
  month: string; // YYYY-MM
  budgetLimit: number;
  adminInstructions: string;
  userNotes: string;
  updatedAt: any;
}

export const handleFirestoreError = (error: any, operationType: string, path: string | null = null) => {
  console.error(`Firestore Error [${operationType}] at ${path}:`, error);
  throw JSON.stringify({
    error: error.message,
    operationType,
    path,
    authInfo: {
      userId: auth.currentUser?.uid || 'anonymous',
      email: auth.currentUser?.email || '',
      emailVerified: auth.currentUser?.emailVerified || false,
    }
  });
};
