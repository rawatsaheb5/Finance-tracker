const express = require("express");
const { signIn, logout, signUp } = require("../controllers/auth");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.get("/logout", logout);
module.exports = router;
