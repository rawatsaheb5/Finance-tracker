const express = require("express");
const { addTransaction, editTransaction, deleteTransaction, getAllTransactionsOfAccountPaginated,  } = require("../controllers/transaction");
const authenticateUser = require("../middlewares/auth");

const router = express.Router();

router.post("/create", authenticateUser, addTransaction);
router.put("/edit",authenticateUser, editTransaction);
router.delete("/delete",authenticateUser, deleteTransaction);
router.get("/get-all", authenticateUser,getAllTransactionsOfAccountPaginated)
module.exports = router;
