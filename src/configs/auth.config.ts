export default () => ({
  auth: {
    jwt: {
      accessSecret: process.env.JWT_ACCESS_SECRET,
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
      refreshSecret: process.env.JWT_REFRESH_SECRET,
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '30d',
    },

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
    },
  },
});
