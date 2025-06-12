const { z } = require("zod");
const addCurrencyValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Name cannot be empty or only spaces",
    }),
});

const updateCurrencyValidationSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .refine((val) => val.trim().length > 0, {
      message: "Name cannot be empty or only spaces",
    }),
});

module.exports = {
    addCurrencyValidationSchema,
    updateCurrencyValidationSchema
}