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


const User = mongoose.model("User", UserSchema);
module.exports = User;
