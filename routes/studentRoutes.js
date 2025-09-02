const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Student = require("../models/Student");

// 1. Yangi student qo'shish
router.post("/", async (req, res) => {
  try {
    const { id, name, phone, group, teacher } = req.body;

    if (!id || !name || !phone || !group || !teacher) {
      return res.status(400).json({ message: "Barcha maydonlarni to'ldiring!" });
    }

    const existingStudent = await Student.findOne({ $or: [{ phone }, { id }] });
    if (existingStudent) {
      return res.status(400).json({ message: "Bu telefon raqam yoki ID avval ro'yxatdan o'tgan!" });
    }

    const newStudent = new Student({
      id,
      name,
      phone,
      group,
      teacher
    });

    await newStudent.save();
    res.status(201).json({ message: "Student muvaffaqiyatli qo'shildi!", student: newStudent });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 2. Barcha studentlarni olish
router.get("/", async (req, res) => {
  try {
    const students = await Student.find().populate('payments');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 3. Bitta studentni olish
router.get("/:id", async (req, res) => {
  try {
    let student;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      student = await Student.findById(req.params.id).populate('payments');
    } else {
      student = await Student.findOne({ id: parseInt(req.params.id) }).populate('payments');
    }
    if (!student) {
      return res.status(404).json({ message: "Student topilmadi!" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 4. Studentni yangilash
router.put("/:id", async (req, res) => {
  try {
    const { name, phone, group, teacher, isFrozen, freezeNote, freezeUntil } = req.body;

    let updatedStudent;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      updatedStudent = await Student.findByIdAndUpdate(
        req.params.id,
        { name, phone, group, teacher, isFrozen, freezeNote, freezeUntil },
        { new: true, runValidators: true }
      );
    } else {
      updatedStudent = await Student.findOneAndUpdate(
        { id: parseInt(req.params.id) },
        { name, phone, group, teacher, isFrozen, freezeNote, freezeUntil },
        { new: true, runValidators: true }
      );
    }

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student topilmadi!" });
    }

    res.json({ message: "Student muvaffaqiyatli yangilandi!", student: updatedStudent });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 5. Studentni o'chirish
router.delete("/:id", async (req, res) => {
  try {
    let deletedStudent;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      deletedStudent = await Student.findByIdAndDelete(req.params.id);
    } else {
      deletedStudent = await Student.findOneAndDelete({ id: parseInt(req.params.id) });
    }
    if (!deletedStudent) {
      return res.status(404).json({ message: "Student topilmadi!" });
    }
    res.json({ message: "Student muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

module.exports = router;
