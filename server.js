const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

app.listen(port, () => {
  console.log(`server is listening on port ${port}`);
});
