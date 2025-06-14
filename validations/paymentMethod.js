const { z } = require("zod");
const addPaymentMethodValidationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});

const updatePaymentMethodValidationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
});
module.exports = {
  addPaymentMethodValidationSchema,
  updatePaymentMethodValidationSchema,
};
