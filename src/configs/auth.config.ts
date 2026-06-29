export default () => ({
  auth: {
    accessTokenExpiresIn:
      process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',

    refreshTokenExpiresIn:
      process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
  },
});