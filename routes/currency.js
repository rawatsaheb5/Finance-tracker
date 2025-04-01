const express = require("express");
const { addCurrency, editCurrency, deleteCurrency, fetchAllCurrencies } = require("../controllers/currency");


const router = express.Router();

router.post("/create", addCurrency);
router.put('/edit/:currencyId', editCurrency);
router.delete('/delete/:currencyId', deleteCurrency);
router.get("/all", fetchAllCurrencies);


module.exports = router;
