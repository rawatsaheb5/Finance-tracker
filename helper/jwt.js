const jwt = require("jsonwebtoken");


const generateToken = (user, secretKey, tokenExpiry) => {
  return jwt.sign({ userId: user._id }, secretKey, {
    expiresIn: tokenExpiry,
  });
};


module.exports = { generateToken};
