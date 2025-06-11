const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateToken } = require("../helper/jwt");
const {
  ACCESS_TOKEN_SECRET,
  AccessTokenExpiry,
  REFRESH_TOKEN_SECRET,
  RefreshTokenExpiry,
  AccessTokenCookieExpiry,
  RefreshTokenCookieExpiry,
} = require("../constants/constant");
const { registerSchema, loginSchema } = require("../validations/auth");
const { formatError } = require("zod/v4");

exports.signUp = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", error: result.error.format() });
    }
    const { email, name, password } = result.data;
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash the password using bcryptjs
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: "User registered successfully!",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.format(),
      });
    }

    const { email, password } = result.data;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
    // Generate JWT tokens
    const accessToken = generateToken(
      { _id: user._id },
      ACCESS_TOKEN_SECRET,
      AccessTokenExpiry
    );
    const refreshToken = generateToken(
      { _id: user._id },
      REFRESH_TOKEN_SECRET,
      RefreshTokenExpiry
    );

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: RefreshTokenCookieExpiry,
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Optional: Clear refresh token from DB
      const user = await User.findOne({ refreshToken });
      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error: error.message });
  }
};
