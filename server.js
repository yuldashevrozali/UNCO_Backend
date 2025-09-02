const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// .env fayldan o‘qish
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/myapp";

// Middleware
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "https://unco-backend.onrender.com"], // frontend URL lar
  methods: ["GET", "POST", "PUT", "DELETE"], // ruxsat etilgan metodlar
  credentials: true
}));


// MongoDB ulanish
mongoose.set("strictQuery", true);

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ MongoDB ulandi"))
  .catch((err) => {
    console.error("❌ MongoDB ulanmadi", err);
    process.exit(1);
  });

// Routes
const authRoutes = require("./routes/auth");      // login/signup
const studentRoutes = require("./routes/studentRoutes"); // students CRUD
const groupRoutes = require("./routes/groupRoutes"); // groups CRUD
const paymentRoutes = require("./routes/paymentRoutes"); // payments CRUD

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/payments", paymentRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Server ishlayapti 🚀");
});

// Server ishga tushirish
app.listen(PORT, () => {
  console.log(`🚀 Server ishlayapti: http://localhost:${PORT}`);
});
