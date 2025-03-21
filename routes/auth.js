const express = require("express");
const { signIn, logout } = require("../controllers/auth");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/logout", logout);
module.exports = router;
