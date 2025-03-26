const AccountType = require("../models/accountType");

const addAccountType = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if the account type already exists
    const existingType = await AccountType.findOne({ name });
    if (existingType) {
      return res.status(400).json({ message: "Account type already exists" });
    }

    const newType = new AccountType({ name });
    await newType.save();
    res
      .status(201)
      .json({
        message: "Account type created successfully",
        accountType: newType,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateAccountType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Check if the account type name is already taken
    const existingType = await AccountType.findOne({ name });
    if (existingType) {
      return res.status(400).json({ message: "Account type already exists" });
    }

    const updatedType = await AccountType.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updatedType) {
      return res.status(404).json({ message: "Account type not found" });
    }
    res
      .status(200)
      .json({
        message: "Account type updated successfully",
        accountType: updatedType,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteAccountType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the account type exists
    const existingType = await AccountType.findById(id);
    if (!existingType) {
      return res.status(404).json({ message: "Account type not found" });
    }

    await AccountType.findByIdAndDelete(id);
    res.status(200).json({ message: "Account type deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllAccountTypes = async (req, res) => {
  try {
    const accountTypes = await AccountType.find();
    res.status(200).json({ accountTypes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addAccountType,
  updateAccountType,
  deleteAccountType,
  getAllAccountTypes,
};
