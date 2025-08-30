const express = require("express");
const router = express.Router();

// oddiy test uchun
router.get("/test", (req, res) => {
  res.json({ message: "Auth route is working!" });
});

// signup va login route qo‘shish (keyinchalik controller yozamiz)
router.post("/signup", (req, res) => {
  res.json({ message: "Signup route is working!" });
});

router.post("/login", (req, res) => {
  res.json({ message: "Login route is working!" });
});

module.exports = router;
