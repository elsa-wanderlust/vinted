const express = require("express");
const mongoose = require("mongoose");
const app = express(); // declare the server
app.use(express.json()); // can read the parameters in body
require("dotenv").config();
const cors = require("cors");
app.use(cors());

mongoose.connect(process.env.MONGODB_URI);

// IMPORT THE ROUTES - necessary because the sever runs from this file
const userRoutes = require("./routes/user");
app.use(userRoutes);
const offerRoutes = require("./routes/offer");
app.use(offerRoutes);

app.all("*", (req, res) => {
  res.status(400).json("this route does not exist");
});

app.listen(process.env.PORT, () => {
  console.log("server started");
});
