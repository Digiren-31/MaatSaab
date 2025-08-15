import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db, googleProvider } from './firebase';
import { onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signOut, User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import type { UserProfile, EducationLevel } from './types';

export type AuthCtx = {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>; // Google only
  signOutApp: () => Promise<void>;
  updateProfile: (data: { educationLevel: EducationLevel; targetExaminations: string[]; }) => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as any);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('🔄 AUTH PROVIDER: Initializing AuthProvider...');
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AUTH PROVIDER: Setting up auth state listener...');
    return onAuthStateChanged(auth, async (u) => {
      console.log('🔄 AUTH STATE CHANGE: Auth state changed, user:', u?.uid || 'null');
      
      if (u) {
        console.log('👤 AUTH STATE CHANGE: User details:', {
          uid: u.uid,
          email: u.email,
          displayName: u.displayName,
          photoURL: u.photoURL,
          emailVerified: u.emailVerified,
          providerId: u.providerId,
          providerData: u.providerData.map(p => ({
            providerId: p.providerId,
            uid: p.uid,
            displayName: p.displayName,
            email: p.email,
          }))
        });

        console.log('💾 AUTH STATE CHANGE: Preparing user data for Firestore...');
        const ref = doc(db, 'users', u.uid);
        console.log('💾 AUTH STATE CHANGE: Firestore document reference created:', ref.path);
        
        try {
          console.log('🔍 AUTH STATE CHANGE: Checking if user document exists...');
          const snap = await getDoc(ref);
          console.log('🔍 AUTH STATE CHANGE: Document exists:', snap.exists());
          
          const base = {
            uid: u.uid,
            email: u.email ?? null,
            displayName: u.displayName ?? null,
            photoURL: u.photoURL ?? null,
            providerIds: u.providerData.map(p => p.providerId),
            updatedAt: serverTimestamp(),
          };
          console.log('📝 AUTH STATE CHANGE: Base user data prepared:', base);
          
          if (!snap.exists()) {
            console.log('➕ AUTH STATE CHANGE: Creating new user document...');
            const newUserData: Partial<UserProfile> = { 
              ...base, 
              educationLevel: null,
              targetExaminations: [],
              profileCompleted: false,
              createdAt: serverTimestamp() 
            };
            console.log('📝 AUTH STATE CHANGE: New user data:', newUserData);
            await setDoc(ref, newUserData);
            console.log('✅ AUTH STATE CHANGE: New user document created successfully');
            setUserProfile(newUserData as UserProfile);
          } else {
            console.log('🔄 AUTH STATE CHANGE: Updating existing user document...');
            console.log('📄 AUTH STATE CHANGE: Existing document data:', snap.data());
            await updateDoc(ref, base as any);
            console.log('✅ AUTH STATE CHANGE: User document updated successfully');
            
            // Get the complete profile data
            const profileData = snap.data() as UserProfile;
            setUserProfile(profileData);
          }
        } catch (firestoreError) {
          console.error('❌ AUTH STATE CHANGE: Firestore operation failed:', firestoreError);
          console.error('❌ AUTH STATE CHANGE: Error details:', {
            code: (firestoreError as any)?.code,
            message: (firestoreError as any)?.message,
          });
        }
      } else {
        console.log('🚫 AUTH STATE CHANGE: No user signed in');
        setUserProfile(null);
      }
      
      setUser(u);
      setLoading(false);
      console.log('🔄 AUTH STATE CHANGE: Auth state processing complete, loading set to false');
    });
  }, []);

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      console.log('🔍 REDIRECT CHECK: Checking for redirect result...');
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          console.log('✅ REDIRECT CHECK: Redirect result found:', {
            uid: result.user?.uid,
            email: result.user?.email,
            operationType: result.operationType,
          });
        } else {
          console.log('ℹ️ REDIRECT CHECK: No redirect result (normal for direct page loads)');
        }
      } catch (error) {
        console.error('❌ REDIRECT CHECK: Error checking redirect result:', error);
      }
    };

    checkRedirectResult();
  }, []);

  const signIn: AuthCtx['signIn'] = async () => {
    console.log('==========================================');
    console.log('🚀 GOOGLE SIGN-IN: Starting Google sign-in process...');
    console.log('🌍 GOOGLE SIGN-IN: Current URL:', window.location.href);
    console.log('🌍 GOOGLE SIGN-IN: Current domain:', window.location.hostname);
    console.log('🌍 GOOGLE SIGN-IN: Current port:', window.location.port);
    
    try {
      console.log('🔧 GOOGLE SIGN-IN: Checking auth and provider objects...');
      console.log('🔧 GOOGLE SIGN-IN: Auth object:', !!auth);
      console.log('🔧 GOOGLE SIGN-IN: Google provider object:', !!googleProvider);
      console.log('🔧 GOOGLE SIGN-IN: Provider config:', {
        providerId: googleProvider.providerId,
      });

      console.log('🔑 GOOGLE SIGN-IN: Attempting signInWithPopup first...');
      console.log('⏰ GOOGLE SIGN-IN: Timestamp:', new Date().toISOString());
      
      const result = await signInWithPopup(auth, googleProvider);
      
      console.log('🎉 GOOGLE SIGN-IN: Sign-in popup completed successfully!');
      console.log('👤 GOOGLE SIGN-IN: User result:', {
        uid: result.user?.uid,
        email: result.user?.email,
        displayName: result.user?.displayName,
        photoURL: result.user?.photoURL,
        emailVerified: result.user?.emailVerified,
      });
      console.log('🔑 GOOGLE SIGN-IN: Credential info:', {
        providerId: result.providerId,
        operationType: result.operationType,
      });
      
      if (result.user) {
        console.log('✅ GOOGLE SIGN-IN: User object exists, sign-in successful');
        console.log('🔍 GOOGLE SIGN-IN: User provider data:', result.user.providerData);
        console.log('🔍 GOOGLE SIGN-IN: Access token available:', !!(result.user as any).accessToken);
      } else {
        console.warn('⚠️ GOOGLE SIGN-IN: Warning - No user object in result');
      }
      
      console.log('✅ GOOGLE SIGN-IN: Sign-in process completed successfully');
      console.log('==========================================');
      
    } catch (error: any) {
      console.log('==========================================');
      console.error('❌ GOOGLE SIGN-IN ERROR: Popup sign-in failed, checking if we should try redirect...');
      console.error('❌ GOOGLE SIGN-IN ERROR: Error object:', error);
      console.error('❌ GOOGLE SIGN-IN ERROR: Error code:', error?.code);
      console.error('❌ GOOGLE SIGN-IN ERROR: Error message:', error?.message);
      console.error('❌ GOOGLE SIGN-IN ERROR: Error stack:', error?.stack);
      
      if (error?.customData) {
        console.error('❌ GOOGLE SIGN-IN ERROR: Custom data:', error.customData);
      }
      
      console.log('🔍 GOOGLE SIGN-IN ERROR: Current URL when error occurred:', window.location.href);
      console.log('🔍 GOOGLE SIGN-IN ERROR: Browser info:', {
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
      });

      // Try redirect if popup fails with certain errors
      if (error.code === 'auth/popup-blocked' || error.code === 'auth/cancelled-popup-request') {
        console.log('🔄 GOOGLE SIGN-IN: Popup blocked/cancelled, trying redirect method...');
        try {
          await signInWithRedirect(auth, googleProvider);
          console.log('🔄 GOOGLE SIGN-IN: Redirect initiated, waiting for return...');
          // After redirect back, onAuthStateChanged will handle the user state.
          return;
        } catch (redirectError: any) {
          console.error('❌ GOOGLE SIGN-IN ERROR: Redirect also failed:', redirectError);
          throw new Error(`Both popup and redirect sign-in failed: ${redirectError.message}`);
        }
      }
      
      // Handle specific error codes
      if (error.code === 'auth/unauthorized-domain') {
        console.error('🚫 GOOGLE SIGN-IN ERROR: Unauthorized domain error');
        console.error('🚫 GOOGLE SIGN-IN ERROR: Current domain not authorized:', window.location.hostname);
        throw new Error('This domain is not authorized for Google sign-in. Please add localhost:5173 to your Firebase authorized domains.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        console.error('👤 GOOGLE SIGN-IN ERROR: User closed popup');
        throw new Error('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/network-request-failed') {
        console.error('🌐 GOOGLE SIGN-IN ERROR: Network request failed');
        throw new Error('Network error occurred. Please check your internet connection and try again.');
      } else if (error.code === 'auth/too-many-requests') {
        console.error('⏱️ GOOGLE SIGN-IN ERROR: Too many requests');
        throw new Error('Too many sign-in attempts. Please wait a moment and try again.');
      } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
        console.error('🔧 GOOGLE SIGN-IN ERROR: Operation not supported in this environment');
        throw new Error('Sign-in is not supported in this environment. Please use a supported browser/HTTPS context.');
      } else {
        console.error('❓ GOOGLE SIGN-IN ERROR: Unknown error');
        throw new Error(`Sign-in failed: ${error.message}`);
      }
    }
  };

  const signOutApp = () => signOut(auth);

  const updateProfile = async (data: { educationLevel: EducationLevel; targetExaminations: string[]; }) => {
    if (!user) throw new Error('No user signed in');
    
    const ref = doc(db, 'users', user.uid);
    const updateData = {
      educationLevel: data.educationLevel,
      targetExaminations: data.targetExaminations,
      profileCompleted: true,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(ref, updateData);
    
    // Update local state
    if (userProfile) {
      setUserProfile({
        ...userProfile,
        ...updateData,
      });
    }
  };

  const value = useMemo(() => ({ 
    user, 
    userProfile, 
    loading, 
    signIn, 
    signOutApp, 
    updateProfile 
  }), [user, userProfile, loading]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
