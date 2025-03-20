const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    profilePicture: { type: String }, // URL for profile image
    accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Account" }], // User's linked accounts
    refreshToken: { type: String }, // Store refresh token for session management
  },
  { timestamps: true }
);

// **Hash password before saving**
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// **Compare passwords**
UserSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// **Generate Access Token**
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });
};

// **Generate Refresh Token**
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

const User = mongoose.model("User", UserSchema);
module.exports = User;
