export interface GoogleTokenInfo {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  exp?: string;
}

export interface GoogleUserProfile {
  providerAccountId: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
}
