import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from '../lib/firebase';

// Helper to check if Firebase is properly configured
const checkFirebaseEnabled = () => {
  return auth && auth.app && auth.app.options && auth.app.options.apiKey && !auth.app.options.apiKey.includes('Placeholder') && !auth.app.options.apiKey.includes('FakeKeyPlaceholder');
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          // Bypass Firebase for demo account
          if (email === 'demo@vendorbridge.com' && password === 'demo123') {
            const res = await authAPI.login({ email, password });
            const { user, token } = res.data;
            localStorage.setItem('vb_token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });
            return { success: true };
          }

          const firebaseEnabled = checkFirebaseEnabled();
          
          if (firebaseEnabled) {
            // 1. Authenticate with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const fbUser = userCredential.user;
            
            // 2. Sync user profile with Node.js backend
            const res = await authAPI.firebaseSync({
              email: fbUser.email,
              uid: fbUser.uid
            });
            
            const { user, token } = res.data;
            localStorage.setItem('vb_token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });
            return { success: true };
          } else {
            // Fallback to standard backend login (which supports both Supabase and mock fallback)
            const res = await authAPI.login({ email, password });
            const { user, token } = res.data;
            localStorage.setItem('vb_token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });
            return { success: true };
          }
        } catch (err) {
          set({ isLoading: false });
          const errorMsg = err.code ? `Firebase: ${err.message}` : (err.response?.data?.error || 'Login failed');
          return { success: false, error: errorMsg };
        }
      },

      register: async (formData) => {
        set({ isLoading: true });
        try {
          const firebaseEnabled = checkFirebaseEnabled();
          
          if (firebaseEnabled) {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const fbUser = userCredential.user;
            
            // 2. Sync profile details to backend
            const res = await authAPI.firebaseSync({
              email: fbUser.email,
              uid: fbUser.uid,
              first_name: formData.first_name,
              last_name: formData.last_name,
              role: formData.role,
              phone: formData.phone,
              country: formData.country,
              additional_info: formData.additional_info
            });
            
            const { user, token } = res.data;
            localStorage.setItem('vb_token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });
            return { success: true };
          } else {
            // Fallback to standard backend registration
            const res = await authAPI.register(formData);
            const { user, token } = res.data;
            localStorage.setItem('vb_token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });
            return { success: true };
          }
        } catch (err) {
          set({ isLoading: false });
          const errorMsg = err.code ? `Firebase: ${err.message}` : (err.response?.data?.error || 'Registration failed');
          return { success: false, error: errorMsg };
        }
      },

      googleLogin: async () => {
        set({ isLoading: true });
        try {
          const { signInWithPopup, auth, googleProvider } = await import('../lib/firebase');
          const result = await signInWithPopup(auth, googleProvider);
          const fbUser = result.user;

          // Sync with backend
          const res = await authAPI.firebaseSync({
            email: fbUser.email,
            uid: fbUser.uid,
            first_name: fbUser.displayName?.split(' ')[0] || 'Google',
            last_name: fbUser.displayName?.split(' ').slice(1).join(' ') || 'User',
            role: 'Procurement Officer'
          });
          
          const { user, token } = res.data;
          localStorage.setItem('vb_token', token);
          set({ user, token, isAuthenticated: true, isLoading: false });
          return { success: true, user };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, error: err.message || 'Google sign-in failed' };
        }
      },

      logout: async () => {
        try {
          if (checkFirebaseEnabled()) {
            await signOut(auth);
          }
        } catch (err) {
          console.warn('Firebase signOut error:', err.message);
        }
        localStorage.removeItem('vb_token');
        localStorage.removeItem('vb_user');
        sessionStorage.removeItem('assistant_chats');
        set({ user: null, token: null, isAuthenticated: false });
        toast.success('Logged out successfully');
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'vb_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
