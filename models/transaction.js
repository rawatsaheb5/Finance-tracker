const mongoose = require("mongoose");
const { string } = require("zod/v4");
const TransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["INCOME", "EXPENSE"],
      required: true,
      index: true,
    }, 
    category: {
      type: String,
    }, 
    subCategory: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    notes: { type: String, maxlength: 500 },
    tags: [{ type: String }],
    payer: { type: String, required: true },
    payee: { type: String, required: true },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
