const express = require("express");
const { addAccount, updateAccount, deleteAccount, getAccountById, getUserAccounts } = require("../controllers/account");
const authenticateUser = require("../middlewares/auth");

const router = express.Router();

router.post("/create", authenticateUser, addAccount);
router.put("/edit",authenticateUser, updateAccount);
router.delete("/delete",authenticateUser, deleteAccount);
router.get("/:accountId", authenticateUser, getAccountById);
router.get("/all",authenticateUser, getUserAccounts)
module.exports = router;
