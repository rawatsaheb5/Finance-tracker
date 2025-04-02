const express = require("express");
const authenticateUser = require("../middlewares/auth");
const {
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getAllPaymentMethods,
} = require("../controllers/paymentMethod");

const router = express.Router();

router.post("/create", authenticateUser, addPaymentMethod);
router.put("/edit/:id", authenticateUser, updatePaymentMethod);
router.delete("/delete/:id", authenticateUser, deletePaymentMethod);
router.get("/all", authenticateUser, getAllPaymentMethods);
module.exports = router;
