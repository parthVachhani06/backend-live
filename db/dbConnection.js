const mongoose = require("mongoose");
const config = require("../config/config");

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodb.url); // Removed deprecated options
    console.log("Database connection successful!");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit the process with a failure
  }
};

module.exports = { connectDB };