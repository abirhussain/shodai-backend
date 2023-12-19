const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db.js");

const port = process.env.PORT || 8000;
const app = express();
// connect database
connectDB();

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
