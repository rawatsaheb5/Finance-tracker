const express = require("express");

const authRoutes = require("./auth");
const transactionRoutes = require("./transaction")
const accountRoutes = require("./account")
const categoryRoutes = require("./category")
const subCategoryRoutes = require("./subCategory")
const currencyRoutes = require("./currency")
const router = express.Router();


router.use("/auth", authRoutes);
router.use("/transaction", transactionRoutes)
router.use("/account", accountRoutes);
router.use("/category", categoryRoutes);
router.use("/sub-category", subCategoryRoutes);
router.use("/currency", currencyRoutes)

module.exports = router;
