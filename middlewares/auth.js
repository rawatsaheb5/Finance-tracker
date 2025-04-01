const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { AccessTokenExpiry } = require("../constants/constant");


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;

const authenticateUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized: No access token" });
    }

    // Verify the access token
    jwt.verify(accessToken, ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (!err) {
        // If token is valid, attach user info to request and proceed
        req.user = decoded;
        return next();
      }

      if (err.name === "TokenExpiredError") {
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
              { expiresIn: ACCESS_TOKEN_EXPIRY }
            );

            // Set new access token in cookies
            res.cookie("accessToken", newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "strict",
              maxAge: ACCESS_TOKEN_EXPIRY, // 15 minutes
            });

            req.user = refreshDecoded;
            next();
          }
        );
      } else {
        return res
          .status(403)
          .json({ message: "Forbidden: Invalid access token" });
      }
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

module.exports = authenticateUser;
