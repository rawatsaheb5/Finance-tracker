const Category = require("../models/category");
const SubCategory = require("../models/subCategory");

const addCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const newCategory = new Category({ name, icon, subCategories:[] });
    await newCategory.save();
    res.status(201).json({ message: "Category created successfully", category: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, subCategories } = req.body;

    // Check if category name is unique
    const existingCategory = await Category.findOne({ name });
    if (existingCategory && existingCategory.id !== id) {
      return res.status(400).json({ message: "Category name already exists" });
    }


    const validSubCategories = await Promise.all(
      subCategories.map(async (subCategoryId) => {
        const subCategory = await SubCategory.findById(subCategoryId);
        return subCategory ? subCategoryId : null;
      })
    );

    const filteredSubCategories = validSubCategories.filter(Boolean);

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, icon, subCategories: filteredSubCategories },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res
      .status(200)
      .json({
        message: "Category updated successfully",
        category: updatedCategory,
      });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
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

module.exports = { addCategory, updateCategory, deleteCategory, getAllCategories };
