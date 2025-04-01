const express = require("express");
const { addAccountType, updateAccountType, deleteAccountType, getAllAccountTypes } = require("../controllers/accountType");

const router = express.Router();

router.post("/create", addAccountType);
router.put("/edit/:id", updateAccountType);
router.delete("/delete/:id",deleteAccountType);
router.get("/all", getAllAccountTypes);

module.exports = router;
