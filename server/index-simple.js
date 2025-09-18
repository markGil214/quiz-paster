const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Simple MongoDB connection test
let db;
MongoClient.connect(process.env.MONGO_URI)
  .then(client => {
    console.log("✅ MongoDB connected successfully!");
    db = client.db();
  })
  .catch(err => {
    console.log("❌ MongoDB connection failed:", err.message);
    console.log("Server will continue without database...");
  });

// Simple route
app.get("/", (req, res) => {
  res.json({ 
    message: "Quiz API is running...",
    database: db ? "Connected" : "Not connected"
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit: http://localhost:${PORT}`);
});
