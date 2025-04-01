
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { connectDB } = require("./config/db");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const router = require('./routes/index')

const app = express();
connectDB()


// Middleware
app.use(express.json()); 
app.use(cors()); 
app.use(cookieParser());
app.use("/api",router );

// Start Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
