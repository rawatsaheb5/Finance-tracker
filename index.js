
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { connectDB } = require("./config/db");
require("dotenv").config();



const app = express();
connectDB()


// Middleware
app.use(express.json()); 
app.use(cors()); 

app.use("/api", );

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
