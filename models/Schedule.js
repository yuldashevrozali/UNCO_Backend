const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  room: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: [String],
    required: true,
    validate: {
      validator: function(dates) {
        const validDates = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
        return dates.every(date => validDates.includes(date));
      },
      message: 'Date faqat hafta kunlaridan iborat bo\'lishi kerak!'
    }
  },
  time: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Schedule", scheduleSchema);