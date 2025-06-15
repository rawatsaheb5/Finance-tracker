const { z } = require("zod");

const addCategoryValidationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  icon: z.string().trim().min(1, "Type is required"),
});

const updateCategoryValidationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  type: z.string().trim().min(1, "Type is required"),
});
module.exports = { 
    addCategoryValidationSchema,
    updateCategoryValidationSchema
};
