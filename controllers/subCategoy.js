const SubCategory = require("../models/subCategory");

const addSubCategory = async (req, res) => {
  try {
    let { name, icon } = req.body;
    name = name.trim();
    icon = icon.trim();
    if (!name || !icon) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const existingSubCategory = await SubCategory.findOne({ name });
    if (existingSubCategory) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    const newSubCategory = new SubCategory({ name, icon });
    await newSubCategory.save();
    res
      .status(201)
      .json({
        message: "New subcategory created successfully",
        subCategory: newSubCategory,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// id => subCategoryId
const updateSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;

    const existingSubCategory = await SubCategory.findOne({ name });
    if (existingSubCategory && existingSubCategory.id !== id) {
      return res
        .status(400)
        .json({ message: "Subcategory name already exists" });
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(
      id,
      { name, icon },
      { new: true }
    );

    if (!updatedSubCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    res
      .status(200)
      .json({
        message: "Subcategory updated successfully",
        subCategory: updatedSubCategory,
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteSubCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedSubCategory = await SubCategory.findByIdAndDelete(id);
    if (!deletedSubCategory) {
      return res.status(404).json({ message: "Subcategory not found" });
    }
    res.status(200).json({ message: "Subcategory deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  addSubCategory,
  updateSubCategory,
  deleteSubCategory
}