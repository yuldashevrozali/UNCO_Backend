const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");
const Group = require("../models/Group");
const Teacher = require("../models/Teacher");

// 1. Barcha dars jadvallarini olish
router.get("/", async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('group')
      .populate('teacher');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 2. Bitta jadvalni olish
router.get("/:id", async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('group')
      .populate('teacher');
    if (!schedule) {
      return res.status(404).json({ message: "Jadval topilmadi!" });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 3. Yangi jadval qo'shish
router.post("/", async (req, res) => {
  try {
    const { group, teacher, room, date, time } = req.body;

    if (!group || !teacher || !room || !date || !time) {
      return res.status(400).json({ message: "Group, teacher, room, date va time majburiy!" });
    }

    // Group mavjudligini tekshirish
    const existingGroup = await Group.findById(group);
    if (!existingGroup) {
      return res.status(400).json({ message: "Group topilmadi!" });
    }

    // Teacher mavjudligini tekshirish
    const existingTeacher = await Teacher.findById(teacher);
    if (!existingTeacher) {
      return res.status(400).json({ message: "O'qituvchi topilmadi!" });
    }

    let datesArray = [];

    if (Array.isArray(date)) {
      datesArray = date;
    } else if (typeof date === 'string') {
      datesArray = date.split(',').map(d => d.trim()).filter(d => d);
    } else {
      return res.status(400).json({ message: "Date noto'g'ri formatda!" });
    }

    const newSchedule = new Schedule({
      group,
      teacher,
      room,
      date: datesArray,
      time
    });

    await newSchedule.save();
    const populatedSchedule = await Schedule.findById(newSchedule._id)
      .populate('group')
      .populate('teacher');
    res.status(201).json({ message: "Jadval muvaffaqiyatli qo'shildi!", schedule: populatedSchedule });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 4. Jadvalni yangilash
router.put("/:id", async (req, res) => {
  try {
    const { group, teacher, room, date, time } = req.body;

    // Group mavjudligini tekshirish (agar berilgan bo'lsa)
    if (group) {
      const existingGroup = await Group.findById(group);
      if (!existingGroup) {
        return res.status(400).json({ message: "Group topilmadi!" });
      }
    }

    // Teacher mavjudligini tekshirish (agar berilgan bo'lsa)
    if (teacher) {
      const existingTeacher = await Teacher.findById(teacher);
      if (!existingTeacher) {
        return res.status(400).json({ message: "O'qituvchi topilmadi!" });
      }
    }

    let updateData = { group, teacher, room, time };

    if (date !== undefined) {
      let datesArray = [];

      if (Array.isArray(date)) {
        datesArray = date;
      } else if (typeof date === 'string') {
        datesArray = date.split(',').map(d => d.trim()).filter(d => d);
      } else {
        return res.status(400).json({ message: "Date noto'g'ri formatda!" });
      }

      updateData.date = datesArray;
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('group').populate('teacher');

    if (!updatedSchedule) {
      return res.status(404).json({ message: "Jadval topilmadi!" });
    }

    res.json({ message: "Jadval muvaffaqiyatli yangilandi!", schedule: updatedSchedule });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 5. Jadvalni o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);
    if (!deletedSchedule) {
      return res.status(404).json({ message: "Jadval topilmadi!" });
    }
    res.json({ message: "Jadval muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

module.exports = router;