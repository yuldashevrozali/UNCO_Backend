const express = require("express");
const router = express.Router();
const Teacher = require("../models/Teacher");

// 1. Barcha o'qituvchilarni olish
router.get("/", async (req, res) => {
  try {
    const teachers = await Teacher.find();
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 2. Bitta o'qituvchini olish
router.get("/:id", async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ message: "O'qituvchi topilmadi!" });
    }
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 3. Yangi o'qituvchi qo'shish
router.post("/", async (req, res) => {
  try {
    const { name, subject, phone, email } = req.body;

    if (!name || !subject) {
      return res.status(400).json({ message: "Name va subject majburiy!" });
    }

    const newTeacher = new Teacher({
      name,
      subject,
      phone,
      email
    });

    await newTeacher.save();
    res.status(201).json({ message: "O'qituvchi muvaffaqiyatli qo'shildi!", teacher: newTeacher });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 4. O'qituvchini yangilash
router.put("/:id", async (req, res) => {
  try {
    const { name, subject, phone, email } = req.body;

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name, subject, phone, email },
      { new: true, runValidators: true }
    );

    if (!updatedTeacher) {
      return res.status(404).json({ message: "O'qituvchi topilmadi!" });
    }

    res.json({ message: "O'qituvchi muvaffaqiyatli yangilandi!", teacher: updatedTeacher });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 5. O'qituvchini o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) {
      return res.status(404).json({ message: "O'qituvchi topilmadi!" });
    }
    res.json({ message: "O'qituvchi muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

module.exports = router;