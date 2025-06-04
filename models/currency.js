const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    name: {
      // INR , USD
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    symbol: {
      type: String,
      required: true,
    },
  },

  { timestamps: true }
);

const Currency = mongoose.model("Currency", currencySchema);
module.exports = Currency;
