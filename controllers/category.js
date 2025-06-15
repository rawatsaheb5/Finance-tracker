const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const { addCategoryValidationSchema, updateCategoryValidationSchema } = require("../validations/category");


// category can be added only by the backend admin
const addCategory = async (req, res) => {
  try {
    const result = addCategoryValidationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        error: result.error.format(),
      });
    }
    let { name, icon } = result.data;
    name = name[0].toUpperCase() + name.substring(1).toLowerCase();
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({ name, icon, subCategories: [] });
    await newCategory.save();
    res.status(201).json({
      message: "Category created successfully",
      category: newCategory,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


// only allowed to edit name and icon
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = updateCategoryValidationSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        error: result.error.format(),
      });
    }

    let { name, icon } = result.data;
    name = name[0].toUpperCase() + name.substring(1).toLowerCase();

    const existingCategory = await Category.findOne({ name });

    if (existingCategory && existingCategory._id.toString() !== id) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, icon },
      { new: true }
    );

    if (!category) {
      return res.status(400).json({ message: "Failed to update category" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category, 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// deleting any category will result into delete all its subcategories
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // If subcategories exist, delete them
    if (deletedCategory.subCategories?.length > 0) {
      await SubCategory.deleteMany({
        _id: { $in: deletedCategory.subCategories },
      });
    }

    res.status(200).json({
      message: "Category and its subcategories deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("subCategories");
    res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  addCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
};
