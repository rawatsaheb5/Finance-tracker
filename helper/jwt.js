const jwt = require("jsonwebtoken");
const { AccessTokenExpiry, RefressTokenExpiry, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../constants/constant");

const generateAccessToken = (user) => {
  return jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, {
    expiresIn: AccessTokenExpiry,
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, {
    expiresIn: RefressTokenExpiry,
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
