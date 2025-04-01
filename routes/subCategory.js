const express = require("express");
const { addSubCategory, updateSubCategory, deleteSubCategory } = require("../controllers/subCategoy");


const router = express.Router();

router.post("/create", addSubCategory);
router.put("/edit/:id", updateSubCategory );
router.delete("/delete/:id", deleteSubCategory);

module.exports = router;
