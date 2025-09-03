const express = require("express");
const router = express.Router();
const Group = require("../models/Group");
const Student = require("../models/Student");

// 1. Yangi group qo'shish
router.post("/", async (req, res) => {
  try {
    const { name, date, time, students } = req.body;

    if (!name || !date || !time) {
      return res.status(400).json({ message: "Name, date va time majburiy!" });
    }

    // Students mavjudligini tekshirish (agar berilgan bo'lsa)
    if (students && students.length > 0) {
      const existingStudents = await Student.find({ _id: { $in: students } });
      if (existingStudents.length !== students.length) {
        return res.status(400).json({ message: "Ba'zi studentlar topilmadi!" });
      }
    }

    let datesArray = [];

    if (Array.isArray(date)) {
      datesArray = date;
    } else if (typeof date === 'string') {
      // If comma-separated string, split it
      datesArray = date.split(',').map(d => d.trim()).filter(d => d);
    } else {
      return res.status(400).json({ message: "Date noto'g'ri formatda!" });
    }

    const newGroup = new Group({
      name,
      date: datesArray,
      time,
      students: students || []
    });

    await newGroup.save();
    res.status(201).json({ message: "Group muvaffaqiyatli qo'shildi!", group: newGroup });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 2. Barcha grouplarni olish
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find().populate('students');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 3. Bitta groupni olish
router.get("/:id", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('students');
    if (!group) {
      return res.status(404).json({ message: "Group topilmadi!" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 4. Groupni yangilash
router.put("/:id", async (req, res) => {
  try {
    const { name, date, time, students } = req.body;

    // Students mavjudligini tekshirish (agar berilgan bo'lsa)
    if (students && students.length > 0) {
      const existingStudents = await Student.find({ _id: { $in: students } });
      if (existingStudents.length !== students.length) {
        return res.status(400).json({ message: "Ba'zi studentlar topilmadi!" });
      }
    }

    let updateData = { name, time, students };

    if (date !== undefined) {
      let datesArray = [];

      if (Array.isArray(date)) {
        datesArray = date;
      } else if (typeof date === 'string') {
        // If comma-separated string, split it
        datesArray = date.split(',').map(d => d.trim()).filter(d => d);
      } else {
        return res.status(400).json({ message: "Date noto'g'ri formatda!" });
      }

      updateData.date = datesArray;
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('students');

    if (!updatedGroup) {
      return res.status(404).json({ message: "Group topilmadi!" });
    }

    res.json({ message: "Group muvaffaqiyatli yangilandi!", group: updatedGroup });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 5. Groupni o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const deletedGroup = await Group.findByIdAndDelete(req.params.id);
    if (!deletedGroup) {
      return res.status(404).json({ message: "Group topilmadi!" });
    }
    res.json({ message: "Group muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

module.exports = router;