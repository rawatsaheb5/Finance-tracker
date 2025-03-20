const mongoose = require("mongoose");
const AccountTypeSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true },
});

const AccountType = mongoose.model("AccountType", AccountTypeSchema);
