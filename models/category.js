const mongoose = require("mongoose");
//only admin is allowed to add category
const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    icon: { type: String, required: true },
    subCategories: [
      { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },
    ], // References to SubCategory
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
