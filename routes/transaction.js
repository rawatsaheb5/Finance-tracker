const express = require("express");
const { addTransaction, editTransaction, deleteTransaction, getAllTransactionsOfAccountPaginated,  } = require("../controllers/transaction");
const authenticateUser = require("../middlewares/auth");

const router = express.Router();

router.post("/create", authenticateUser, addTransaction);
router.put("/edit/:transactionId",authenticateUser, editTransaction);
router.delete("/delete/:transactionId",authenticateUser, deleteTransaction);
router.get("/all/:accountId", authenticateUser,getAllTransactionsOfAccountPaginated)
module.exports = router;
