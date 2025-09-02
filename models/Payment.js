const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);