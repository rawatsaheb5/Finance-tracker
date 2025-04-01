const express = require("express");
const { addCategory, updateCategory, deleteCategory, getAllCategories } = require("../controllers/category");


const router = express.Router();

router.post("/create", addCategory);
router.put("/edit", updateCategory);
router.delete("/delete", deleteCategory);
router.get("/all", getAllCategories);

module.exports = router;
