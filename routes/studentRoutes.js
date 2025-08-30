const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");

// 1. Yangi student qo‘shish
router.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, groupName, phone, password } = req.body;

    if (!firstName || !lastName || !groupName || !phone || !password) {
      return res.status(400).json({ message: "Barcha maydonlarni to‘ldiring!" });
    }

    const existingStudent = await Student.findOne({ phone });
    if (existingStudent) {
      return res.status(400).json({ message: "Bu telefon raqam avval ro‘yxatdan o‘tgan!" });
    }

    const newStudent = new Student({ firstName, lastName, groupName, phone, password });
    await newStudent.save();

    res.status(201).json({ message: "Student muvaffaqiyatli qo‘shildi!", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 2. Student login
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const student = await Student.findOne({ phone });
    if (!student) {
      return res.status(404).json({ message: "Student topilmadi!" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Parol noto‘g‘ri!" });
    }

    const studentData = student.toObject();
    delete studentData.password;

    res.json({ message: "Tizimga muvaffaqiyatli kirdingiz!", student: studentData });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 3. Barcha studentlarni olish
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().select("-password");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

module.exports = router;
