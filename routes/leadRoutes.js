const express = require("express");
const router = express.Router();
const Lead = require("../models/Lead");

// 1. Barcha leadlarni olish
router.get("/", async (req, res) => {
  try {
    const leads = await Lead.find().populate('assignedTo');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 2. Bitta leadni olish
router.get("/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo');
    if (!lead) {
      return res.status(404).json({ message: "Lead topilmadi!" });
    }
    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 3. Yangi lead qo'shish
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, status, source, notes, assignedTo } = req.body;

    if (!name || !email || !phone || !source) {
      return res.status(400).json({ message: "Name, email, phone va source majburiy!" });
    }

    const existingLead = await Lead.findOne({ email });
    if (existingLead) {
      return res.status(400).json({ message: "Bu email avval ro'yxatdan o'tgan!" });
    }

    const newLead = new Lead({
      name,
      email,
      phone,
      status: status || 'new',
      source,
      notes,
      assignedTo
    });

    await newLead.save();
    const populatedLead = await Lead.findById(newLead._id).populate('assignedTo');
    res.status(201).json({ message: "Lead muvaffaqiyatli qo'shildi!", lead: populatedLead });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 4. Leadni yangilash
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone, status, source, notes, assignedTo } = req.body;

    const updatedLead = await Lead.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, status, source, notes, assignedTo },
      { new: true, runValidators: true }
    ).populate('assignedTo');

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead topilmadi!" });
    }

    res.json({ message: "Lead muvaffaqiyatli yangilandi!", lead: updatedLead });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

// 5. Leadni o'chirish
router.delete("/:id", async (req, res) => {
  try {
    const deletedLead = await Lead.findByIdAndDelete(req.params.id);
    if (!deletedLead) {
      return res.status(404).json({ message: "Lead topilmadi!" });
    }
    res.json({ message: "Lead muvaffaqiyatli o'chirildi!" });
  } catch (error) {
    res.status(500).json({ message: "Xatolik yuz berdi", error: error.message });
  }
});

module.exports = router;