import React from 'react';
import { useAuth } from '../lib/auth';

export default function SignInButtons() {
  console.log('🔄 SIGN-IN BUTTON: Component rendered');
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    console.log('==========================================');
    console.log('🔵 SIGN-IN BUTTON: Sign-in button clicked');
    console.log('🔵 SIGN-IN BUTTON: Timestamp:', new Date().toISOString());
    console.log('🔵 SIGN-IN BUTTON: Current URL:', window.location.href);
    
    try {
      console.log('🔵 SIGN-IN BUTTON: Starting Google sign-in process...');
      console.log('🔵 SIGN-IN BUTTON: Calling signIn function...');
      
      await signIn();
      
      console.log('🟢 SIGN-IN BUTTON: Google sign-in completed successfully!');
      console.log('🟢 SIGN-IN BUTTON: Sign-in process finished');
      console.log('==========================================');
      
    } catch (e: any) {
      console.log('==========================================');
      console.error('🔴 SIGN-IN BUTTON: Google sign-in failed in button handler');
      console.error('🔴 SIGN-IN BUTTON: Error object:', e);
      console.error('🔴 SIGN-IN BUTTON: Error message:', e?.message);
      console.error('🔴 SIGN-IN BUTTON: Error name:', e?.name);
      console.error('🔴 SIGN-IN BUTTON: Error stack:', e?.stack);
      
      // More user-friendly error messages
      let errorMessage = 'Sign-in failed. ';
      if (e.message.includes('popup')) {
        console.error('🔴 SIGN-IN BUTTON: Popup-related error detected');
        errorMessage += 'Please allow popups and try again.';
      } else if (e.message.includes('unauthorized-domain')) {
        console.error('🔴 SIGN-IN BUTTON: Unauthorized domain error detected');
        errorMessage += 'Domain not authorized. Please add this domain to Firebase Console.';
      } else if (e.message.includes('network')) {
        console.error('🔴 SIGN-IN BUTTON: Network error detected');
        errorMessage += 'Network error. Please check your connection.';
      } else if (e.message.includes('blocked')) {
        console.error('🔴 SIGN-IN BUTTON: Blocked popup error detected');
        errorMessage += 'Please allow popups for this site and try again.';
      } else {
        console.error('🔴 SIGN-IN BUTTON: Unknown error type');
        errorMessage += e.message || 'Please try again.';
      }
      
      console.error('🔴 SIGN-IN BUTTON: Final error message for user:', errorMessage);
      alert(errorMessage);
      console.log('==========================================');
    }
  };

  return (
    <div className="signInButtons">
      <button type="button" className="googleSignInBtn focus-ring" onClick={handleSignIn}>
        <svg className="googleIcon" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.37 0 6.4 1.16 8.78 3.43l6.56-6.56C35.73 2.63 30.4 0 24 0 14.62 0 6.51 5.38 2.56 13.19l7.96 6.18C12.24 13.31 17.63 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.5 24c0-1.57-.14-3.08-.41-4.53H24v9.06h12.68c-.55 2.98-2.23 5.51-4.76 7.2l7.3 5.67C43.85 37.6 46.5 31.25 46.5 24z"/>
          <path fill="#FBBC05" d="M10.52 28.37A14.42 14.42 0 0 1 9.5 24c0-1.52.26-2.98.74-4.33l-7.68-5.98A23.94 23.94 0 0 0 0 24c0 3.86.93 7.5 2.56 10.71l7.96-6.18z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.89-5.81l-7.3-5.67c-2.02 1.35-4.62 2.14-8.59 2.14-6.37 0-11.76-3.81-13.48-9.87l-7.96 6.18C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        <span>Continue with Google</span>
      </button>
    </div>
  );
}
