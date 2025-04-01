const express = require("express");
const { addAccount, updateAccount, deleteAccount, getAccountById, getUserAccounts } = require("../controllers/account");
const authenticateUser = require("../middlewares/auth");

const router = express.Router();
router.get("/all", authenticateUser, getUserAccounts);
router.post("/create", authenticateUser, addAccount);
router.put("/edit/:accountId",authenticateUser, updateAccount);
router.delete("/delete/:accountId",authenticateUser, deleteAccount);
router.get("/:accountId", authenticateUser, getAccountById);

module.exports = router;
