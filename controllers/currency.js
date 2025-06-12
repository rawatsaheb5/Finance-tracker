const Currency = require("../models/currency");
const { updateAccountTypeValidationSchema } = require("../validations/accountType");
const { addCurrencyValidationSchema } = require("../validations/currency");

const addCurrency = async (req, res) => {
  try {
    const result = addCurrencyValidationSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ message: "Validation failed", error: result.error.format() });
    }
    const name = result.data.name.trim();

    const currency = await Currency.findOne({ name });
    if (currency) {
      return res.status(400).json({ message: "Currency already exists" });
    }

    const newCurrency = new Currency({
      name,
    });

    await newCurrency.save();
    return res.status(201).json({
      message: "New Currency created successfully",
      currency: newCurrency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const editCurrency = async (req, res) => {
  try {
    const result = updateAccountTypeValidationSchema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ message: "Validation failed", error: result.error.format() });
    }
    const currencyId = req.params.currencyId;
    const name = result.data.name.trim();
    const existingCurrency = await Currency.findOne({ name });
    if (existingCurrency && existingCurrency._id.toString() !== currencyId) {
      return res
        .status(400)
        .json({ message: "Currency with this name already exists" });
    }

    const currency = await Currency.findById(currencyId);
    currency.name = name;
    await currency.save();

    return res.status(200).json({
      message: "Currency updated successfully",
      currency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteCurrency = async (req, res) => {
  try {
    const currencyId = req.params.currencyId;
    const currency = await Currency.findByIdAndDelete(currencyId);
    if (!currency) {
      return res.status(400).json({ message: "Currency not found" });
    }
    return res.status(200).json({
      message: "Currency removed successfully",
      currency: currency,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const fetchAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find().select("_id name");
    return res.status(200).json({
      message: "All currencies fetched successfully",
      currency: currencies,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addCurrency,
  editCurrency,
  deleteCurrency,
  fetchAllCurrencies,
};
