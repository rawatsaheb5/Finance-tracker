
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { generateToken } = require("../helper/jwt");
const { ACCESS_TOKEN_SECRET, AccessTokenExpiry, REFRESH_TOKEN_SECRET, RefreshTokenExpiry } = require("../constants/constant");


exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
   
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Hash the password
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
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored hashed password
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

    // Store refresh token in DB and save user
    user.refreshToken = refreshToken;
    await user.save(); // Fix: Save before setting cookies

    // Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None", // Fix: Allow cross-origin requests
      maxAge: AccessTokenExpiry,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
      maxAge: RefreshTokenExpiry,
    });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

exports.logout = (req, res) => {
  try {
    // Clear the cookies storing tokens
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "None",
    });
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
