const express = require("express");
const { addCategory, updateCategory, deleteCategory, getAllCategories } = require("../controllers/category");


const router = express.Router();

router.post("/create", addCategory);
router.put("/edit/:id", updateCategory);
router.delete("/delete/:id", deleteCategory);
router.get("/all", getAllCategories);

module.exports = router;
