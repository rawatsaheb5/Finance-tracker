const express = require("express");
const { addSubCategory, updateSubCategory, deleteSubCategory } = require("../controllers/subCategoy");


const router = express.Router();

router.post("/create", addSubCategory);
router.put("/edit", updateSubCategory );
router.delete("/delete", deleteSubCategory);

module.exports = router;
