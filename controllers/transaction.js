const mongoose = require("mongoose")
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
      category,
      subCategory,
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
      !category ||
      !subCategory ||
      !type ||
      !paymentMethod ||
      !payer ||
      !payee ||
      !date
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
      const [userBankAccount] = await Promise.all([
        Account.findById(accountId)
      ]);

      if (!userBankAccount) {
        return res.status(400).json({ message: "Invalid Account ID" });
      }
      

      // Convert date to UTC if provided, otherwise default to current UTC time
      const transactionDate = date
        ? convertToUTC(date)
        : new Date().toISOString();

      // Create and save the transaction
      const newTransaction = new Transaction({
        amount,
        account: userBankAccount._id,
        type,
        category: category,
        subCategory: subCategory,
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
      category,
      subCategory,
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

    // Validate transaction type
    if (type && !["INCOME", "EXPENSE"].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type" });
    }

    // Validate amount
    if (amount !== undefined && amount < 0) {
      return res
        .status(400)
        .json({ message: "Amount should be a positive number" });
    }

    // Validate account if provided
    let userBankAccount = null;
    if (accountId) {
      try {
        userBankAccount = await Account.findById(accountId);
        if (!userBankAccount) {
          return res.status(400).json({ message: "Invalid Account ID" });
        }
      } catch (error) {
        return res.status(400).json({
          message: "Error validating account",
          error: error.message,
        });
      }
    }

    // Prepare update object
    const updatedTransaction = {
      ...(amount !== undefined && { amount }),
      ...(userBankAccount && { account: userBankAccount._id }),
      ...(type && { type }),
      ...(category && { category }),
      ...(subCategory && { subCategory }),
      ...(paymentMethod && { paymentMethod }),
      ...(notes && { notes }),
      ...(tags && { tags }),
      ...(payer && { payer }),
      ...(payee && { payee }),
      ...(date && { date: convertToUTC(date) }),
    };

    const updatedRecord = await Transaction.findByIdAndUpdate(
      transactionId,
      updatedTransaction,
      { new: true }
    );

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
            // this will ensure that income is positive and expenses are negative
            $cond: [
              { $eq: ["$type", "INCOME"] },
              "$amount",
              { $multiply: ["$amount", -1] },
            ],
          },
          dateGroup: {
            //Converts the date field to a string using a specified format
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

const getFilteredTransactionsPaginated = async (req, res) => {
  try {
    const {
      accountId,
      type,
      category,
      subCategory,
      paymentMethod,
      tags,
      payer,
      payee,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const matchStage = {};

    if (accountId) {
      matchStage.account = new mongoose.Types.ObjectId(accountId);
    }

    if (type) {
      matchStage.type = type;
    }

    if (category) {
      matchStage.category = new mongoose.Types.ObjectId(category);
    }

    if (subCategory) {
      matchStage.subCategory = new mongoose.Types.ObjectId(subCategory);
    }

    if (paymentMethod) {
      matchStage.paymentMethod = new mongoose.Types.ObjectId(paymentMethod);
    }

    if (payer) {
      matchStage.payer = { $regex: payer, $options: "i" };
    }

    if (payee) {
      matchStage.payee = { $regex: payee, $options: "i" };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      matchStage.tags = { $all: tagArray };
    }

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    if (search) {
      matchStage.notes = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const aggregationPipeline = [
      { $match: matchStage },

      // Join lookups
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },

      {
        $lookup: {
          from: "paymentmethods",
          localField: "paymentMethod",
          foreignField: "_id",
          as: "paymentMethod",
        },
      },
      { $unwind: { path: "$paymentMethod", preserveNullAndEmptyArrays: true } },

      // Sort by latest first
      { $sort: { date: -1 } },

      // Facet to split data + count
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: parseInt(limit) }],
          totalCount: [{ $count: "count" }],
        },
      },
    ];

    const result = await Transaction.aggregate(aggregationPipeline);

    const transactions = result[0]?.data || [];
    const total = result[0]?.totalCount[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      message: "Paginated transactions fetched successfully",
      currentPage: parseInt(page),
      totalPages,
      total,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching paginated transactions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  addTransaction,
  editTransaction,
  deleteTransaction,
  getAllTransactionsOfAccountPaginated,
  getAccountSummary,
  getBalanceTrend,
  getFilteredTransactionsPaginated
};

