const Category = require("../models/category");
const SubCategory = require("../models/subCategory");

const addCategory = async (req, res) => {
  try {
    let { name, icon } = req.body;
    name = name.trim();
    icon = icon.trim();
    if (!name || !icon) {
      return res.status(400).json({ message: "All fields are required" });
    }
    // Check if category already exists
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

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, icon, subCategories } = req.body;
    name = name.trim();
    icon = icon.trim();

    if (!Array.isArray(subCategories)) {
      return res.status(400).json({ message: "Subcategory should be array" });
    }
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
    res.status(200).json({
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

const getCategoryWiseSummary = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { range } = req.query;

    const now = new Date();
    let startDate;

    switch (range) {
      case "weekly":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date("1970-01-01"); // if no range, include all data
    }

    const summary = await Transaction.aggregate([
      {
        $match: {
          account: new mongoose.Types.ObjectId(accountId),
          date: { $gte: startDate, $lte: now },
        },
      },
      {
        $group: {
          _id: { category: "$category", type: "$type" },
          totalAmount: { $sum: "$amount" },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id.category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $project: {
          type: "$_id.type",
          categoryId: "$_id.category",
          categoryName: "$categoryDetails.name",
          icon: "$categoryDetails.icon",
          totalAmount: 1,
          _id: 0,
        },
      },
      {
        $group: {
          _id: "$categoryName",
          icon: { $first: "$icon" },
          income: {
            $sum: {
              $cond: [{ $eq: ["$type", "INCOME"] }, "$totalAmount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $eq: ["$type", "EXPENSE"] }, "$totalAmount", 0],
            },
          },
        },
      },
      {
        $project: {
          category: "$_id",
          icon: 1,
          income: 1,
          expense: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      message: `Category-wise summary for ${range || "all time"}`,
      summary,
    });
  } catch (error) {
    console.error("Error in getCategoryWiseSummary:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


module.exports = {
  addCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
  getCategoryWiseSummary,
 
};
