const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth");

dotenv.config(); // .env faylni o‘qiydi

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myapp";

// Middleware
app.use(express.json());

// MongoDB ulanish
mongoose.set("strictQuery", true); // warning chiqmasligi uchun

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB ulandi"))
.catch((err) => {
  console.error("❌ MongoDB ulanmadi", err);
  process.exit(1); // agar ulana olmasa server to‘xtaydi
});

// Routes
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server ishlayapti 🚀");
});

// Server ishga tushirish
app.listen(PORT, () => {
  console.log(`🚀 Server ishlayapti: http://localhost:${PORT}`);
});
