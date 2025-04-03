const mongoose = require("mongoose");
const Account = require("../models/account");
const AccountType = require("../models/accountType");
const Currency = require("../models/currency");
const User = require("../models/user");
const Transaction = require("../models/transaction");

// type is objectid
const addAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    let { name, type, balance, currencyId } = req.body;
    name = name.trim();
    type = type.trim();
    currencyId = currencyId.trim();
    if (!name || !type || !balance || !currencyId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (balance < 0) {
      return res
        .status(400)
        .json({ message: "Balance should be greater than 0" });
    }

    // Validate account type
    const accountType = await AccountType.findById(type);
    if (!accountType) {
      return res.status(400).json({ message: "Invalid account type" });
    }
    const existingCurrency = await Currency.findById(currencyId);
    if (!existingCurrency) {
      return res.status(400).json({ message: "Invalid currency " });
    }

    // Create new account
    const newAccount = new Account({
      name,
      type,
      balance,
      currencyId,
    });

    await newAccount.save();
    const user = await User.findById(userId);
    user.accounts.push(newAccount._id);
    await user.save();

    return res
      .status(201)
      .json({ message: "Account created successfully", account: newAccount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    let { name, type, balance } = req.body;
    name = name.trim();
    type = type.trim();

    if (!name || !type || !balance) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (balance < 0) {
      return res
        .status(400)
        .json({ message: "Balance should be greater than 0" });
    }

    // Validate account type

    const accountType = await AccountType.findById(type);
    if (!accountType) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    // Find and update account
    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      { name, type, balance },
      { new: true, runValidators: true }
    );

    if (!updatedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.status(200).json({
      message: "Account updated successfully",
      account: updatedAccount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.userId;

    // Find and delete account
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { accounts: accountId } },
      { new: true }
    );

    const deletedAccount = await Account.findByIdAndDelete(accountId);

    if (!deletedAccount || !updatedUser) {
      return res.status(404).json({ message: "Account not found" });
    }
    await Transaction.deleteMany({ account: accountId });
    // filter out accountId from user account
    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAccountById = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await Account.findById(accountId).populate("type");
    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    return res.status(200).json({ account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserAccounts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const userAccounts = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } }, // Match user by userId
      {
        $lookup: {
          from: "accounts", // Collection name of accounts
          localField: "accounts", // Array of account IDs in user model
          foreignField: "_id", // Matching _id in accounts collection
          as: "accountDetails", // Output array with account details
        },
      },
    ]);

    if (!userAccounts.length) {
      return res
        .status(404)
        .json({ message: "User not found or no accounts associated" });
    }

    return res.status(200).json({ accounts: userAccounts[0].accountDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addAccount,
  updateAccount,
  deleteAccount,
  getAccountById,
  getUserAccounts,
};
