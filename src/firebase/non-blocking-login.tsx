'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

/** Initiate anonymous sign-in. */
export function initiateAnonymousSignIn(authInstance: Auth) {
  return signInAnonymously(authInstance);
}

/** Initiate email/password sign-up. */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string) {
  return createUserWithEmailAndPassword(authInstance, email, password);
}

/** Initiate email/password sign-in. */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string) {
  return signInWithEmailAndPassword(authInstance, email, password);
}

/** Initiate Google Cloud Identity sign-in with account selection prompt. */
export function initiateGoogleSignIn(authInstance: Auth) {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account',
  });
  return signInWithPopup(authInstance, provider);
}

/** Fallback: Initiate Google sign-in via redirect for restricted environments. */
export function initiateGoogleSignInRedirect(authInstance: Auth) {
  const provider = new GoogleAuthProvider();
  return signInWithRedirect(authInstance, provider);
}

/** Retrieve result from redirect sign-in. */
export function getGoogleRedirectResult(authInstance: Auth) {
  return getRedirectResult(authInstance);
}
