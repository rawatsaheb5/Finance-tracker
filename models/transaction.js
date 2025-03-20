const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true }, // Store as a string for flexibility
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    }, // Reference to Account
    type: { type: String, enum: ["INCOME", "EXPENSE"], required: true }, // Credit/Debit
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    }, // Reference to Category
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" }, // Reference to SubCategory
    paymentMethod: { type: String, required: true }, // No strict enum for flexibility
    isRecurring: { type: Boolean, default: false }, // Recurring transaction?
    recurrencePeriod: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: null,
    }, // Optional
    notes: { type: String, maxlength: 500 }, // Additional details
    tags: [{ type: String }], // To filter transactions
    payer: { type: String, required: true }, // Person who paid
    payee: { type: String, required: true }, // Person who received
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);
module.exports = Transaction;
