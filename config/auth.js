export const AUTH_CONFIG = {
  ACCESS_TOKEN: {
    EXPIRY: "15m",
    TTL_SECONDS: 15 * 60,
    COOKIE_NAME: "access_token"
  },

  REFRESH_TOKEN: {
    EXPIRY: "7d",
    TTL_SECONDS: 7 * 24 * 60 * 60,
    COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000,
    COOKIE_NAME: "refresh_token"
  }
  ,
  BCRYPT: {
    SALT_ROUNDS: 12
  }
};
