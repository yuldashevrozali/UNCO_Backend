const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// 📌 SIGNUP route
router.post("/signup", async (req, res) => {
  try {
    const { username, phone, password, role } = req.body;

    // 1. Majburiy maydonlarni tekshirish
    if (!username || !phone || !password || !role) {
      return res
        .status(400)
        .json({ message: "Barcha maydonlarni to'ldirish majburiy!" });
    }

    // 2. Role ni tekshirish
    const allowedRoles = ["admin", "teacher", "director"];
    if (!allowedRoles.includes(role)) {
      return res
        .status(400)
        .json({
          message:
            "Role noto'g'ri! Faqat admin, teacher yoki director bo'lishi mumkin",
        });
    }

    // 3. Telefon raqamni tekshirish
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Bu telefon raqam allaqachon ro'yxatdan o'tgan" });
    }

    // 4. Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Yangi user yaratish
    const newUser = new User({
      username,
      phone,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      message: "Foydalanuvchi ro'yxatdan o'tdi",
      user: {
        id: newUser._id,
        username: newUser.username,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Serverda xatolik bor", error: error.message });
  }
});

// 📌 SIGNIN route
router.post("/signin", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 1. Maydonlarni tekshirish
    if (!phone || !password) {
      return res
        .status(400)
        .json({ message: "Telefon raqam va parol kiritish majburiy!" });
    }

    // 2. User mavjudligini tekshirish
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Bunday foydalanuvchi topilmadi" });
    }

    // 3. Parolni solishtirish
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Parol noto'g'ri!" });
    }

    res.json({
      message: "Tizimga muvaffaqiyatli kirdingiz",
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Serverda xatolik bor", error: error.message });
  }
});

module.exports = router;
