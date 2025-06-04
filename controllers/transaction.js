// Controller to add a new transaction
// amount => number , positive
// currency => from user's account
// account => accountId
// categoryId => id =>
// subcategoryId => id
// payemnt method => string

const { convertToUTC } = require("../helper/transform");
const Account = require("../models/account");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const Transaction = require("../models/transaction");

const addTransaction = async (req, res) => {
  try {
    let {
      amount,
      accountId,
      type,
      categoryId,
      subCategoryId,
      paymentMethod,
      notes,
      tags,
      payer,
      payee,
      date,
    } = req.body;

    // Validate required fields
    if (
      !amount ||
      !accountId ||
      !categoryId ||
      !subCategoryId ||
      !type ||
      !paymentMethod ||
      !payer ||
      !payee
    ) {
      return res
        .status(400)
        .json({ message: "All required fields must be provided." });
    }

    // Validate transaction type
    if (!["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Ensure amount is a positive number
    if (amount < 0) {
      return res
        .status(400)
        .json({ message: "Amount should be a positive number" });
    }

    // Fetch required data in parallel
    try {
      const [userBankAccount, category, subCategory] = await Promise.all([
        Account.findById(accountId),
        Category.findById(categoryId),
        SubCategory.findById(subCategoryId),
      ]);

      if (!userBankAccount) {
        return res.status(400).json({ message: "Invalid Account ID" });
      }
      if (!category) {
        return res.status(400).json({ message: "Invalid Category ID" });
      }
      if (!subCategory) {
        return res.status(400).json({ message: "Invalid SubCategory ID" });
      }
      if (!category.subCategories.includes(subCategory._id)) {
        return res
          .status(400)
          .json({
            message: "SubCategory does not belong to the specified Category",
          });
      }

      // Convert date to UTC if provided, otherwise default to current UTC time
      const transactionDate = date
        ? convertToUTC(date)
        : new Date().toISOString();

      // Create and save the transaction
      const newTransaction = new Transaction({
        amount,
        currency: userBankAccount.currency,
        account: userBankAccount._id,
        type,
        category: category._id,
        subCategory: subCategory._id,
        paymentMethod,
        notes,
        tags,
        payer,
        payee,
        date: transactionDate,
      });

      await newTransaction.save();

      return res.status(201).json({
        message: "Transaction added successfully",
        transaction: newTransaction,
      });
    } catch (error) {
      return res.status(400).json({
        message: "Error validating Account, Category, or SubCategory",
        error: error.message,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Error adding transaction",
      error: error.message,
    });
  }
};

// Edit Transaction
const editTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const {
      amount,
      accountId,
      type,
      categoryId,
      subCategoryId,
      paymentMethod,
      notes,
      tags,
      payer,
      payee,
      date,
    } = req.body;

    // Find existing transaction
    const existingTransaction = await Transaction.findById(transactionId);
    if (!existingTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Validate account, category, and subcategory if changed
    let userBankAccount, category, subCategory;
    if (accountId || categoryId || subCategoryId) {
      try {
        [userBankAccount, category, subCategory] = await Promise.all([
          accountId ? Account.findById(accountId) : Promise.resolve(null),
          categoryId ? Category.findById(categoryId) : Promise.resolve(null),
          subCategoryId ? SubCategory.findById(subCategoryId) : Promise.resolve(null),
        ]);

        if (category && subCategory && !category.subCategories.includes(subCategory._id)) {
          return res.status(400).json({ message: "SubCategory does not belong to the specified Category" });
        }
      } catch (error) {
        return res.status(400).json({
          message: "Error validating Account, Category, or SubCategory",
          error: error.message,
        });
      }
    }

    // Prepare update object
    const updatedTransaction = {
      ...(amount !== undefined && { amount }),
      ...(userBankAccount && { account: userBankAccount._id, currency: userBankAccount.currency }),
      ...(type && { type }),
      ...(category && { category: category._id }),
      ...(subCategory && { subCategory: subCategory._id }),
      ...(paymentMethod && { paymentMethod }),
      ...(notes && { notes }),
      ...(tags && { tags }),
      ...(payer && { payer }),
      ...(payee && { payee }),
      ...(date && { date: convertToUTC(date) }),
    };

    // Update transaction
    const updatedRecord = await Transaction.findByIdAndUpdate(transactionId, updatedTransaction, { new: true });

    return res.status(200).json({
      message: "Transaction updated successfully",
      transaction: updatedRecord,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error updating transaction",
      error: error.message,
    });
  }
};


// Delete Transaction
const deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    // Find and delete transaction
    const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);

    if (!deletedTransaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    return res.status(200).json({ message: "Transaction deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Error deleting transaction",
      error: error.message,
    });
  }
};



const getAllTransactionsOfAccountPaginated = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { page = 1, limit = 10 } = req.query; // Default page = 1, limit = 10

    // Ensure page and limit are positive integers
    const pageNumber = Math.max(1, parseInt(page));
    const pageSize = Math.max(1, parseInt(limit));

    // Fetch transactions with pagination
    const transactions = await Transaction.find({ account: accountId })
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip((pageNumber - 1) * pageSize) // Skip previous pages
      .limit(pageSize); // Limit results per page

    // Get total count of transactions for the account
    const totalTransactions = await Transaction.countDocuments({
      account: accountId,
    });

    res.status(200).json({
      message: "Transactions fetched successfully",
      transactions,
      pagination: {
        totalRecords: totalTransactions,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalTransactions / pageSize),
        pageSize,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: error.message });
  }
};

const getAccountSummary = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { range } = req.query; // "weekly", "monthly", "yearly"

    if (!["weekly", "monthly", "yearly"].includes(range)) {
      return res.status(400).json({ message: "Invalid range type" });
    }

    const now = new Date();
    let startDate;

    // Calculate start date based on range
    switch (range) {
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const result = await Transaction.aggregate([
      {
        $match: {
          account: new mongoose.Types.ObjectId(accountId),
          date: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: "$type",
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    result.forEach((item) => {
      if (item._id === "INCOME") totalIncome = item.totalAmount;
      if (item._id === "EXPENSE") totalExpenses = item.totalAmount;
    });

    res.status(200).json({
      message: `Summary for ${range}`,
      totalIncome,
      totalExpenses,
    });
  } catch (error) {
    console.error("Error in getAccountSummary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getBalanceTrend = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { range } = req.query;

    if (!["daily", "weekly", "monthly", "yearly"].includes(range)) {
      return res.status(400).json({ message: "Invalid range" });
    }

    let dateFormat;
    switch (range) {
      case "daily":
        dateFormat = "%Y-%m-%d";
        break;
      case "weekly":
        dateFormat = "%Y-%U"; // %U = week number
        break;
      case "monthly":
        dateFormat = "%Y-%m";
        break;
      case "yearly":
        dateFormat = "%Y";
        break;
    }

    const trend = await Transaction.aggregate([
      {
        $match: {
          account: new mongoose.Types.ObjectId(accountId),
          date: { $lte: new Date() },
        },
      },
      {
        $project: {
          amount: {
            $cond: [
              { $eq: ["$type", "INCOME"] },
              "$amount",
              { $multiply: ["$amount", -1] },
            ],
          },
          dateGroup: {
            $dateToString: { format: dateFormat, date: "$date" },
          },
        },
      },
      {
        $group: {
          _id: "$dateGroup",
          netChange: { $sum: "$amount" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Convert to cumulative balance trend
    let cumulative = 0;
    const balanceTrend = trend.map((item) => {
      cumulative += item.netChange;
      return {
        period: item._id,
        balance: cumulative,
      };
    });

    res.status(200).json({
      message: `Balance trend for ${range}`,
      trend: balanceTrend,
    });
  } catch (error) {
    console.error("Error in getBalanceTrend:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  addTransaction,
  editTransaction,
  deleteTransaction,
  getAllTransactionsOfAccountPaginated,
  getAccountSummary,
  getBalanceTrend
};

