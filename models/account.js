const mongoose = require("mongoose");
const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountType",
      required: true,
    },
    balance: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
