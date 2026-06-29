import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GoogleProfile = {
  providerAccountId: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
};

type GoogleTokenInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  exp?: string;
};

@Injectable()
export class GoogleTokenService {
  constructor(private readonly configService: ConfigService) {}

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    const tokenInfo = await this.fetchTokenInfo(idToken);
    const clientId = this.configService.getOrThrow<string>(
      'auth.google.clientId',
    );

    if (tokenInfo.aud !== clientId) {
      throw new UnauthorizedException('Google token invalid');
    }

    if (!tokenInfo.sub || !tokenInfo.email) {
      throw new UnauthorizedException('Google token invalid');
    }

    if (!this.isEmailVerified(tokenInfo.email_verified)) {
      throw new UnauthorizedException('Google email is not verified');
    }

    const expiresAt = Number(tokenInfo.exp ?? 0) * 1000;

    if (!expiresAt || expiresAt <= Date.now()) {
      throw new UnauthorizedException('Google token expired');
    }

    return {
      providerAccountId: tokenInfo.sub,
      email: tokenInfo.email.toLowerCase(),
      displayName: tokenInfo.name || tokenInfo.email,
      avatarUrl: tokenInfo.picture ?? null,
    };
  }

  private async fetchTokenInfo(idToken: string): Promise<GoogleTokenInfo> {
    const url = new URL('https://oauth2.googleapis.com/tokeninfo');
    url.searchParams.set('id_token', idToken);

    const response = await fetch(url);

    if (!response.ok) {
      throw new UnauthorizedException('Google token invalid');
    }

    return (await response.json()) as GoogleTokenInfo;
  }

  private isEmailVerified(value: boolean | string | undefined): boolean {
    return value === true || value === 'true';
  }
}
