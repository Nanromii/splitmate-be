export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type RequestMetadata = {
  userAgent?: string;
  ipAddress?: string;
};
