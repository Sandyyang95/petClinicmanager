const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.protect, appointmentController.getAppointments);
router.post('/', authMiddleware.protect, appointmentController.addAppointment);
router.put('/:id', authMiddleware.protect, appointmentController.updateAppointment);
router.delete('/:id', authMiddleware.protect, appointmentController.deleteAppointment);

module.exports = router;
