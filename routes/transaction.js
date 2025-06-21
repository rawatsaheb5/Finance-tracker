const express = require("express");
const { addTransaction, editTransaction, deleteTransaction, getAllTransactionsOfAccountPaginated, getBalanceTrend, getAccountSummary, getFilteredTransactionsPaginated,  } = require("../controllers/transaction");
const authenticateUser = require("../middlewares/auth");

const router = express.Router();

router.post("/create", authenticateUser, addTransaction);
router.put("/edit/:transactionId",authenticateUser, editTransaction);
router.delete("/delete/:transactionId",authenticateUser, deleteTransaction);
router.get("/all/:accountId", authenticateUser, getAllTransactionsOfAccountPaginated)
router.get("/balance-trend/:accountId", authenticateUser, getBalanceTrend)
router.get("/account-summary/:accountId", authenticateUser, getAccountSummary)
router.get("/filter-transactions", authenticateUser, getFilteredTransactionsPaginated)
module.exports = router;
