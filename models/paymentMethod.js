const mongoose = require("mongoose");
const paymentMethodSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true }, // account name
  },
  { timestamps: true }
);

const PaymentMethod = mongoose.model("PaymentMethod", paymentMethodSchema);
module.exports = PaymentMethod;
