const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  group: {
    type: String,
    required: true
  },
  teacher: {
    type: String,
    required: true
  },
  isFrozen: {
    type: Boolean,
    default: false
  },
  freezeNote: {
    type: String
  },
  freezeUntil: {
    type: String
  },
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  }]
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);
