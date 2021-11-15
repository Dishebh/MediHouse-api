const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  avatarUrl: {
    type: String,
  },
  address: {
    type: String,
  },
  email: {
    type: String,
  },
  phone: {
    type: String,
  },
  cronValue: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Medication = mongoose.model('Medication', MedicationSchema);

module.exports = Medication;
