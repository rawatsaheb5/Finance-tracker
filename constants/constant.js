const AccessTokenExpiry = "1h"
const RefressTokenExpiry = "7d";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET


module.exports = {
    AccessTokenExpiry,
    RefressTokenExpiry,
    ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET
}