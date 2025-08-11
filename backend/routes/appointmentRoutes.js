const express = require('express');
const router = express.Router();
const appointmentController = require('../controller/appointmentController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, appointmentController.getAppointments);
router.post('/', authMiddleware, appointmentController.addAppointment);
router.put('/:id', authMiddleware, appointmentController.updateAppointment);
router.delete('/:id', authMiddleware, appointmentController.deleteAppointment);

module.exports = router;
