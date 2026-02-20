// backend/routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAppointmentMessages,
  sendAppointmentMessage
} = require('../controllers/messageController');

// @route   GET /api/messages/appointments/:appointmentId
// @desc    Get messages for appointment
// @access  Private (patient, doctor)
router.get('/appointments/:appointmentId', protect, authorize('patient', 'doctor'), getAppointmentMessages);

// @route   POST /api/messages/appointments/:appointmentId
// @desc    Send message for appointment
// @access  Private (patient, doctor)
router.post('/appointments/:appointmentId', protect, authorize('patient', 'doctor'), sendAppointmentMessage);

module.exports = router;
