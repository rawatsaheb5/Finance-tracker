const Currency = require("../models/currency");

const addCurrency = async (req, res) => {
  try {
    let { name } = req.body;
    name = name.trim();
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
    res.status(500).json({ message: "Server error" });
  }
};

const editCurrency = async (req, res) => {
  try {
    let { name } = req.body;
    const currencyId = req.params.currencyId;
    name = name.trim();
    const existingCurrency = await Currency.findOne({ name });
    if (existingCurrency) {
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
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
  }
};

const fetchAllCurrencies = async (req, res) => {
  try {
    const currencies = await Currency.find();
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
  fetchAllCurrencies
};
