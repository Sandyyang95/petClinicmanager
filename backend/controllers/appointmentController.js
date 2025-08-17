const Appointment = require('../models/Appointment');
const TreatmentRecord = require('../models/TreatmentRecord');
const VaccinationRecord = require('../models/VaccinationRecord');

const getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id }).populate('petId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAppointment = async (req, res) => {
  const { petId, date, reason, appointmentType, status } = req.body;

  if (!appointmentType || !['Treatment', 'Vaccination'].includes(appointmentType)) {
    return res.status(400).json({ message: 'appointmentType must be either "Treatment" or "Vaccination".' });
  }

  try {
    const appointment = await Appointment.create({
      userId: req.user.id,
      petId,
      date,
      reason,
      appointmentType,
      status
    });
    res.status(201).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  const { petId, date, reason, appointmentType, status } = req.body;

  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (appointmentType && !['Treatment', 'Vaccination'].includes(appointmentType)) {
      return res.status(400).json({ message: 'appointmentType must be either "Treatment" or "Vaccination".' });
    }

    appointment.petId = petId || appointment.petId;
    appointment.date = date || appointment.date;
    appointment.reason = reason || appointment.reason;
    appointment.appointmentType = appointmentType || appointment.appointmentType;
    appointment.status = status || appointment.status;

    const updatedAppointment = await appointment.save();

    if (status === 'Completed') {
      if (appointment.appointmentType === 'Treatment') {
        await TreatmentRecord.create({
          appointmentId: appointment._id,
          petId: appointment.petId,
          treatmentDetails: reason || 'No details provided'
        });
      } else if (appointment.appointmentType === 'Vaccination') {
        await VaccinationRecord.create({
          appointmentId: appointment._id,
          petId: appointment.petId,
          type: appointment.appointmentType,
          vaccineName: reason || 'No vaccine name provided'
        });
      }
    }

    res.json(updatedAppointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await appointment.remove();
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAppointments, addAppointment, updateAppointment, deleteAppointment };

