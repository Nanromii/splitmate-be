jest.mock('uuid', () => ({
  v7: jest.fn(() => '01980000-0000-7000-8000-000000000010'),
}));

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthService } from '../src/modules/auth/auth.service';
import { AuthController } from '../src/modules/auth/auth.controller';
import { JwtAuthGuard } from '../src/modules/auth/guards/jwt-auth.guard';

type AuthResponseBody = {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
};

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  const authService = {
    refresh: jest.fn(),
    validateAccessToken: jest.fn(),
  };

  beforeEach(async () => {
    authService.refresh.mockResolvedValue({
      user: {
        id: '01980000-0000-7000-8000-000000000001',
        email: 'user@example.com',
        displayName: 'Split Mate',
        avatarUrl: null,
        provider: 'google',
        role: 'user',
        status: 'active',
      },
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      sessionId: '01980000-0000-7000-8000-000000000002',
      expiresIn: 900,
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        JwtAuthGuard,
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  it('POST /auth/refresh returns rotated tokens', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({
        refreshToken: 'refresh-token',
      })
      .expect(201)
      .expect(({ body }: { body: AuthResponseBody }) => {
        expect(body.accessToken).toBe('new-access-token');
        expect(body.refreshToken).toBe('new-refresh-token');
        expect(body.sessionId).toBe('01980000-0000-7000-8000-000000000002');
      });
  });

  it('GET /auth/me rejects requests without bearer token', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });
});
