const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection success!");
  } catch (err) {
    console.log("Database connection failed!", err.message);
  }
};

module.exports = connectDB;
