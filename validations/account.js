const { z } = require("zod");

const addAccountValidationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.string().trim().min(1, "Type is required"),
  currencyId: z.string().trim().min(1, "currencyId is required"),
  balance: z
    .number({ invalid_type_error: "Balance must be a number" })
    .nonnegative("Balance must be >= 0"),
});

const updateAccountValidationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.string().trim().min(1, "Type is required"),
  balance: z
    .number({ invalid_type_error: "Balance must be a number" })
    .nonnegative("Balance must be >= 0"),
});
module.exports = { addAccountValidationSchema, updateAccountValidationSchema };
