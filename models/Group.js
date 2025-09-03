const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: {
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
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, { timestamps: true });

module.exports = mongoose.model("Group", groupSchema);