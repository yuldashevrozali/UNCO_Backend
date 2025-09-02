const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Student = require("../models/Student");

// 1. Yangi payment qo'shish
router.post("/", async (req, res) => {
  try {
    const { studentId, price, date } = req.body;

    if (!studentId || !price || !date) {
      return res.status(400).json({ message: "Student ID, price va date majburiy!" });
    }

    // Student mavjudligini tekshirish
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student topilmadi!" });
    }

    const newPayment = new Payment({
      student: studentId,
      price,
      date
    });

    await newPayment.save();

    // Studentga payment qo'shish
    student.payments.push(newPayment._id);
    await student.save();

    res.status(201).json({ message: "Payment muvaffaqiyatli qo'shildi!", payment: newPayment });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 2. Barcha paymentlarni olish
router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find().populate('student');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 3. Bitta paymentni olish
router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('student');
    if (!payment) {
      return res.status(404).json({ message: "Payment topilmadi!" });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 4. Paymentni yangilash
router.put("/:id", async (req, res) => {
  try {
    const { studentId, price, date } = req.body;

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      { student: studentId, price, date },
      { new: true, runValidators: true }
    ).populate('student');

    if (!updatedPayment) {
      return res.status(404).json({ message: "Payment topilmadi!" });
    }

    res.json({ message: "Payment muvaffaqiyatli yangilandi!", payment: updatedPayment });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 5. Paymentni o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment topilmadi!" });
    }

    // Studentdan paymentni olib tashlash
    await Student.findByIdAndUpdate(payment.student, { $pull: { payments: payment._id } });

    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: "Payment muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

module.exports = router;