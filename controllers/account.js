const Account = require("../models/account");
const AccountType = require("../models/accountType");


// type is objectid
const addAccount = async (req, res) => {
  try {
    const { name, type, balance } = req.body;

    // Validate account type
    const accountType = await AccountType.findById(type);
    if (!accountType) {
      return res.status(400).json({ message: "Invalid account type" });
    }

    // Create new account
    const newAccount = new Account({
      name,
      type,
      balance,
    });

    await newAccount.save();
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
    const { name, type, balance } = req.body;

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

    return res
      .status(200)
      .json({
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

    // Find and delete account
    const deletedAccount = await Account.findByIdAndDelete(accountId);

    if (!deletedAccount) {
      return res.status(404).json({ message: "Account not found" });
    }
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
      const { userId } = req.user.userId;
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
