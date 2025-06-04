const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { AccessTokenExpiry, AccessTokenCookieExpiry, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } = require("../constants/constant");



const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.headers?.authorization?.split(" ")[1];
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized: Invalid cookies" });
    }

    // Verify the access token
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (!err) {
        // If token is valid, attach user info to request and proceed
        req.user = decoded;
        return next();
      }

      if (!refreshToken) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Refresh token required" });
      }

      // Verify refresh token
      jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET,
        async (refreshErr, refreshDecoded) => {
          if (refreshErr) {
            return res
              .status(403)
              .json({ message: "Forbidden: Invalid refresh token" });
          }

          // Find user in DB
          
          const user = await User.findById(refreshDecoded._id);
          if (!user || user.refreshToken !== refreshToken) {
            return res
              .status(403)
              .json({ message: "Forbidden: Refresh token mismatch" });
          }

          // Generate new access token
          const newAccessToken = jwt.sign(
            { _id: user._id },
            ACCESS_TOKEN_SECRET,
            { expiresIn: AccessTokenExpiry }
          ); 


          req.user = refreshDecoded;
          next();
        }
      );
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = authenticateUser;
