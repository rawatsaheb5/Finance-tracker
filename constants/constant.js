const AccessTokenExpiry = "1h"
const RefreshTokenExpiry = "7d";
const AccessTokenCookieExpiry = 200*60*1000;
const RefreshTokenCookieExpiry = 7 * 24 * 60 * 60 * 1000; ;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET


module.exports = {
  AccessTokenExpiry,
  RefreshTokenExpiry,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  AccessTokenCookieExpiry,
  RefreshTokenCookieExpiry,
};