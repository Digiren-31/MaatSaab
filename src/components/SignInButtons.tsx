import React from 'react';
import { useAuth } from '../lib/auth';

export default function SignInButtons() {
  const { signIn } = useAuth();

  const handleSignIn = async () => {
    try {
      await signIn();
    } catch (e) {
      console.error('Google sign-in failed:', e);
      alert('Sign-in failed. Ensure this domain is authorized in Firebase and try again.');
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
