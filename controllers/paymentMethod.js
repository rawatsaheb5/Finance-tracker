const PaymentMethod = require("../models/paymentMethod");

const addPaymentMethod = async (req, res) => {
  try {
    let { name } = req.body;
    name = name.trim();

    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate account type
    const paymentMethod = await PaymentMethod.findOne({ name });
    if (paymentMethod) {
      return res.status(400).json({ message: "Payment method already exists" });
    }

    // Create new account
    const newPaymentMethod = new PaymentMethod({
      name,
    });

    await newPaymentMethod.save();

    return res.status(201).json({
      message: "New Payment method added successfully",
      paymentMethod: newPaymentMethod,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    let { name } = req.body;
    name = name.trim();

    if (!name) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate account type
    let paymentMethod = await PaymentMethod.findOne({ name });
    if (paymentMethod && paymentMethod._id !== id) {
      return res.status(400).json({ message: "Invalid Payment method" });
    }

    paymentMethod = await PaymentMethod.findByIdAndUpdate(
      id,
      { name: name },
      { new: true }
    );

    return res.status(200).json({
      message: "Payment method updated successfully",
      paymentMethod,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPaymentMethod = await PaymentMethod.findByIdAndDelete(id);

    if (!deletedPaymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    return res
      .status(200)
      .json({ message: "Payment method deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllPaymentMethods = async (req, res) => {
  try {
    const allPaymentMethods = await PaymentMethod.find();
    return res.status(200).json({
      meessage: "All payment methods fetched successfully",
      paymentMethod: allPaymentMethods,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getAllPaymentMethods,
};
