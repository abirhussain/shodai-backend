const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const connectDB = require("./config/db.js");
const userRoute = require("./routes/userRoutes.js");

const port = process.env.PORT || 8000;
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// connect database
connectDB();

// routes
app.use("/api/users", userRoute);

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
