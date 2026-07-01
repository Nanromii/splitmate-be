import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleTokenInfo, GoogleUserProfile } from '../../common/interfaces';
import { AUTH_ERROR_MESSAGES } from '../../common/messages';

@Injectable()
export class GoogleTokenService {
  constructor(private readonly configService: ConfigService) {}

  async verifyIdToken(idToken: string): Promise<GoogleUserProfile> {
    const tokenInfo = await this.fetchTokenInfo(idToken);
    const clientId = this.configService.getOrThrow<string>(
      'auth.google.clientId',
    );

    if (tokenInfo.aud !== clientId) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.GOOGLE_TOKEN_INVALID);
    }

    if (!tokenInfo.sub || !tokenInfo.email) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.GOOGLE_TOKEN_INVALID);
    }

    if (!this.isEmailVerified(tokenInfo.email_verified)) {
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.GOOGLE_EMAIL_NOT_VERIFIED,
      );
    }

    const expiresAt = Number(tokenInfo.exp ?? 0) * 1000;

    if (!expiresAt || expiresAt <= Date.now()) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.GOOGLE_TOKEN_EXPIRED);
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
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.GOOGLE_TOKEN_INVALID);
    }

    return (await response.json()) as GoogleTokenInfo;
  }

  private isEmailVerified(value: boolean | string | undefined): boolean {
    return value === true || value === 'true';
  }
}
