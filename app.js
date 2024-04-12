// app.js
const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const dbConnectionString = process.env.DB_URL; // Replace with your actual connection string
const app = express();
const port = 3000; // Or your desired port
const invoicesRoutes = require("./routes/invoiceRoutes");
const jobCardsRoutes = require("./routes/jobCardsRoutes");
const bodyParser = require("body-parser");
var cors = require("cors");
const path = require("path");
const masterRoutes = require("./routes/masterRoutes");
// ... other imports ...

// A simple route
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.use("/transaction", invoicesRoutes);
app.use("/jobCards", jobCardsRoutes);
app.use("/master", masterRoutes);

mongoose
  .connect(dbConnectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

require("./models/invoice");
console.log(dbConnectionString);
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
