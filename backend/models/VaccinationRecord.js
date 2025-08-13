const mongoose = require('mongoose');

const VaccinationRecordSchema = new mongoose.Schema({
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
  type: { type: String, enum: ['Treatment', 'Vaccination'], required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VaccinationRecord', VaccinationRecordSchema);
