export type AuthSignInError =
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password';

export type AuthSignOutError =
  | 'auth/invalid-user-token'
  | 'auth/user-token-expired'
  | 'auth/null-useRef'
  | 'auth/tenant-id-mismatch';
