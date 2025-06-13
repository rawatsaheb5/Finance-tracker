const mongoose = require("mongoose");
const Account = require("../models/account");
const AccountType = require("../models/accountType");
const Currency = require("../models/currency");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const {
  addAccountValidationSchema,
  updateAccountValidationSchema,
} = require("../validations/account");

// type is objectid
const addAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const validation = addAccountValidationSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        message: "Validation failed",
        error: validation.error.format(),
      });
    }
    let { name, type, balance, currencyId } = validation.data;
    name = name.trim();
    type = type.trim();
    currencyId = currencyId.trim();

    // Step 2: Validate referenced entities
    const [accountType, existingCurrency] = await Promise.all([
      AccountType.findById(type),
      Currency.findById(currencyId),
    ]);

    if (!accountType) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    if (!existingCurrency) {
      return res.status(400).json({ message: "Invalid currency" });
    }

    // Step 3: Create account
    const newAccount = new Account({
      name,
      type,
      balance,
      currencyId,
    });

    await newAccount.save();

    // Step 4: Link account to user
    await User.findByIdAndUpdate(
      userId,
      { $push: { accounts: newAccount._id } },
      { new: true }
    );

    return res.status(201).json({
      message: "Account created successfully",
      account: newAccount,
    });
  } catch (error) {
    console.error("Error adding account:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const result = updateAccountValidationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        error: result.error.format(),
      });
    }

    const { name, type, balance } = result.data;
    const accountType = await AccountType.findById(type);
    if (!accountType) {
      return res.status(400).json({ message: "Invalid account type" });
    }

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
    console.error("Update account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user.userId;

    const deletedAccount = await Account.findByIdAndDelete(accountId);

    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
    await Promise.all([
      User.findByIdAndUpdate(
        userId,
        { $pull: { accounts: accountId } },
        { new: true }
      ),
      Transaction.deleteMany({ account: accountId }),
    ]);

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAccountById = async (req, res) => {
  try {
    const { accountId } = req.params;
    const account = await Account.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(accountId),
        },
      },
      {
        $lookup: {
          from: "accounttypes",
          localField: "type",
          foreignField: "_id",
          as: "accountType",
        },
      },
      {
        $unwind: {
          path: "$accountType",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "currencyId",
          foreignField: "_id",
          as: "currency",
        },
      },
      {
        $unwind: {
          path: "$currency",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          accountType: "$accountType.name",
          currency: "$currency.name",
          name: 1,
          balance: 1,
        },
      },
    ]);

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }
    return res.status(200).json({ account: account[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserAccounts = async (req, res) => {
  try {
    const userId = req.user.userId;
    const accounts = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $unwind: {
          path: "$accounts",
        },
      },
      {
        $lookup: {
          from: "accounts",
          localField: "accounts",
          foreignField: "_id",
          as: "accountDetail",
        },
      },
      {
        $unwind: {
          path: "$accountDetail",
        },
      },
      {
        $lookup: {
          from: "accounttypes",
          localField: "accountDetail.type",
          foreignField: "_id",
          as: "accountType",
        },
      },
      {
        $unwind: {
          path: "$accountType",
        },
      },
      {
        $lookup: {
          from: "currencies",
          localField: "accountDetail.currencyId",
          foreignField: "_id",
          as: "currency",
        },
      },
      {
        $unwind: {
          path: "$currency",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          accountName: "$accountDetail.name",
          balance: "$accountDetail.balance",
          type: "$accountType.name",
          currency: "$currency.name",
        },
      },
    ]);

    res.status(200).json({
      message: "Accounts fetched successfully",
      accounts: accounts || [],
    });
  } catch (error) {
    console.error("Aggregation error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addAccount,
  updateAccount,
  deleteAccount,
  getAccountById,
  getUserAccounts,
};
