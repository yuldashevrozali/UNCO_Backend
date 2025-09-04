const express = require("express");
const router = express.Router();
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");
const Schedule = require("../models/Schedule");

// 1. Barcha davomat yozuvlarini olish
router.get("/", async (req, res) => {
  try {
    const attendances = await Attendance.find()
      .populate('student')
      .populate({
        path: 'schedule',
        populate: [
          { path: 'group' },
          { path: 'teacher' }
        ]
      });
    res.json(attendances);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 2. Bitta davomat yozuvini olish
router.get("/:id", async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id)
      .populate('student')
      .populate({
        path: 'schedule',
        populate: [
          { path: 'group' },
          { path: 'teacher' }
        ]
      });
    if (!attendance) {
      return res.status(404).json({ message: "Davomat yozuvi topilmadi!" });
    }
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 3. Yangi davomat yozuvi qo'shish
router.post("/", async (req, res) => {
  try {
    const { student, schedule, status, date } = req.body;

    if (!student || !schedule || !status) {
      return res.status(400).json({ message: "Student, schedule va status majburiy!" });
    }

    // Student mavjudligini tekshirish
    const existingStudent = await Student.findById(student);
    if (!existingStudent) {
      return res.status(400).json({ message: "Student topilmadi!" });
    }

    // Schedule mavjudligini tekshirish
    const existingSchedule = await Schedule.findById(schedule);
    if (!existingSchedule) {
      return res.status(400).json({ message: "Jadval topilmadi!" });
    }

    const newAttendance = new Attendance({
      student,
      schedule,
      status,
      date: date || new Date()
    });

    await newAttendance.save();
    const populatedAttendance = await Attendance.findById(newAttendance._id)
      .populate('student')
      .populate({
        path: 'schedule',
        populate: [
          { path: 'group' },
          { path: 'teacher' }
        ]
      });
    res.status(201).json({ message: "Davomat yozuvi muvaffaqiyatli qo'shildi!", attendance: populatedAttendance });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 4. Davomat yozuvini yangilash
router.put("/:id", async (req, res) => {
  try {
    const { student, schedule, status, date } = req.body;

    // Student mavjudligini tekshirish (agar berilgan bo'lsa)
    if (student) {
      const existingStudent = await Student.findById(student);
      if (!existingStudent) {
        return res.status(400).json({ message: "Student topilmadi!" });
      }
    }

    // Schedule mavjudligini tekshirish (agar berilgan bo'lsa)
    if (schedule) {
      const existingSchedule = await Schedule.findById(schedule);
      if (!existingSchedule) {
        return res.status(400).json({ message: "Jadval topilmadi!" });
      }
    }

    const updatedAttendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { student, schedule, status, date },
      { new: true, runValidators: true }
    ).populate('student').populate({
      path: 'schedule',
      populate: [
        { path: 'group' },
        { path: 'teacher' }
      ]
    });

    if (!updatedAttendance) {
      return res.status(404).json({ message: "Davomat yozuvi topilmadi!" });
    }

    res.json({ message: "Davomat yozuvi muvaffaqiyatli yangilandi!", attendance: updatedAttendance });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 5. Davomat yozuvini o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const deletedAttendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!deletedAttendance) {
      return res.status(404).json({ message: "Davomat yozuvi topilmadi!" });
    }
    res.json({ message: "Davomat yozuvi muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// Bulk attendance endpoints

// Get students for attendance marking on a specific date
router.get("/students/:groupId/:date", async (req, res) => {
  try {
    const { groupId, date } = req.params;

    // Check if there's a schedule for this group on this date
    const schedule = await Schedule.findOne({
      group: groupId,
      date: { $in: [date] }
    }).populate('group');

    if (!schedule) {
      return res.status(404).json({ message: "Bu kunda bu guruhda dars yo'q!" });
    }

    // Get all students in the group
    const students = await Student.find({ group: groupId });

    // Get existing attendance records for this date and schedule
    const existingAttendance = await Attendance.find({
      schedule: schedule._id,
      date: {
        $gte: new Date(date + 'T00:00:00.000Z'),
        $lt: new Date(date + 'T23:59:59.999Z')
      }
    }).populate('student');

    // Create attendance status map
    const attendanceMap = {};
    existingAttendance.forEach(att => {
      attendanceMap[att.student._id.toString()] = att.status;
    });

    // Prepare response with students and their attendance status
    const studentsWithAttendance = students.map(student => ({
      _id: student._id,
      name: student.name,
      status: attendanceMap[student._id.toString()] || null // null means not marked yet
    }));

    res.json({
      schedule: {
        _id: schedule._id,
        room: schedule.room,
        time: schedule.time
      },
      students: studentsWithAttendance
    });

  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// Bulk mark attendance for multiple students
router.post("/bulk", async (req, res) => {
  try {
    const { groupId, date, attendances } = req.body;

    if (!groupId || !date || !attendances || !Array.isArray(attendances)) {
      return res.status(400).json({ message: "groupId, date va attendances (array) majburiy!" });
    }

    // Check if there's a schedule for this group on this date
    const schedule = await Schedule.findOne({
      group: groupId,
      date: { $in: [date] }
    });

    if (!schedule) {
      return res.status(404).json({ message: "Bu kunda bu guruhda dars yo'q!" });
    }

    const createdAttendances = [];
    const updatedAttendances = [];

    for (const attendanceData of attendances) {
      const { studentId, status } = attendanceData;

      if (!studentId || !status) {
        continue; // Skip invalid entries
      }

      // Check if student exists and belongs to the group
      const student = await Student.findOne({ _id: studentId, group: groupId });
      if (!student) {
        continue; // Skip if student not found or not in group
      }

      // Check if attendance already exists for this student, schedule, and date
      const existingAttendance = await Attendance.findOne({
        student: studentId,
        schedule: schedule._id,
        date: {
          $gte: new Date(date + 'T00:00:00.000Z'),
          $lt: new Date(date + 'T23:59:59.999Z')
        }
      });

      if (existingAttendance) {
        // Update existing
        existingAttendance.status = status;
        await existingAttendance.save();
        updatedAttendances.push(existingAttendance);
      } else {
        // Create new
        const newAttendance = new Attendance({
          student: studentId,
          schedule: schedule._id,
          status,
          date: new Date(date)
        });
        await newAttendance.save();
        createdAttendances.push(newAttendance);
      }
    }

    res.status(201).json({
      message: `${createdAttendances.length} ta yangi, ${updatedAttendances.length} ta yangilandi`,
      created: createdAttendances.length,
      updated: updatedAttendances.length
    });

  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

module.exports = router;