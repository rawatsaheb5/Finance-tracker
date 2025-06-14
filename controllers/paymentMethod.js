const PaymentMethod = require("../models/paymentMethod");
const {
  addPaymentMethodValidationSchema,
  updatePaymentMethodValidationSchema,
} = require("../validations/paymentMethod");

const addPaymentMethod = async (req, res) => {
  try {
    const result = addPaymentMethodValidationSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        error: validation.error.format(),
      });
    }

    let { name } = result.data;
    name = name.toUpperCase();
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
    const result = updatePaymentMethodValidationSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        error: validation.error.format(),
      });
    }

    let { name } = result.data;
    name = name.toUpperCase();
    let paymentMethod = await PaymentMethod.findOne({ name });
    if (paymentMethod && paymentMethod._id.toString() !== id) {
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
    const allPaymentMethods = await PaymentMethod.aggregate([
      {
        $project: {
          _id: 1,
          name: 1,
        },
      },
    ]);
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
