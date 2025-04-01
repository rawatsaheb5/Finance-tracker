const mongoose = require("mongoose");
const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // account name
    type: {
      type: mongoose.Schema.Types.ObjectId, // Saving, current
      ref: "AccountType",
      required: true,
    },
    balance: { type: Number, required: true, min: 0 }, //balance in the account
    currencyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Currency",
      required:true,
    }
  },
  { timestamps: true }
);

const Account = mongoose.model("Account", AccountSchema);
module.exports = Account;
