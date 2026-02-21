// backend/controllers/appointmentController.js
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

const toHHMMSS = (value) => {
  if (!value || typeof value !== 'string') return null;
  const parts = value.split(':').map((item) => item.trim());
  if (parts.length < 2) return null;
  const hour = Number(parts[0]);
  const minute = Number(parts[1]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null;
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
};

const normalizeTimeForCompare = (time) => String(time).slice(0, 5);

const generateHourlySlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour += 1) {
    slots.push(`${String(hour).padStart(2, '0')}:00`);
  }
  return slots;
};

const getDoctorBaseSlots = (doctor) => {
  if (!doctor) return [];
  if (doctor.availability_mode === '24_7') {
    return generateHourlySlots();
  }

  const slots = Array.isArray(doctor.availability_slots) ? doctor.availability_slots : [];
  return slots
    .map((slot) => toHHMMSS(slot))
    .filter(Boolean)
    .map((slot) => normalizeTimeForCompare(slot));
};

const getAvailableSlotsForDoctorAndDate = async ({ doctor, doctor_id, appointment_date }) => {
  const baseSlots = getDoctorBaseSlots(doctor);
  const booked = await Appointment.getBookedSlots({ doctor_id, appointment_date });
  const bookedSet = new Set(booked.map((slot) => normalizeTimeForCompare(slot)));
  return baseSlots.filter((slot) => !bookedSet.has(slot));
};

// @desc    Create appointment
// @route   POST /api/appointments
// @access  Private (patient)
const createAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_date, appointment_time, reason } = req.body;
    const normalizedTime = toHHMMSS(appointment_time);
    const trimmedReason = typeof reason === 'string' ? reason.trim() : '';

    if (!doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: 'Please provide doctor, date, and time'
      });
    }

    if (!trimmedReason) {
      return res.status(400).json({
        success: false,
        error: 'Reason for appointment is required'
      });
    }

    if (!normalizedTime) {
      return res.status(400).json({ success: false, error: 'Invalid appointment time format' });
    }

    const bookableDoctor = await Appointment.isDoctorBookable(doctor_id);
    if (!bookableDoctor) {
      return res.status(400).json({
        success: false,
        error: 'Doctor is not available for booking until verification is complete'
      });
    }

    const doctor = await Doctor.findById(doctor_id);
    const availableSlots = await getAvailableSlotsForDoctorAndDate({ doctor, doctor_id, appointment_date });

    const requestedHHMM = normalizeTimeForCompare(normalizedTime);
    if (!availableSlots.includes(requestedHHMM)) {
      return res.status(409).json({
        success: false,
        error: 'Selected slot is not available',
        data: {
          available_slots: availableSlots
        }
      });
    }

    const appointment = await Appointment.create({
      patient_id: req.user.id,
      doctor_id,
      appointment_date,
      appointment_time: normalizedTime,
      reason: trimmedReason
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get available slots for a doctor on a date
// @route   GET /api/appointments/doctor/:doctorId/slots?date=YYYY-MM-DD
// @access  Public
const getDoctorAvailableSlots = async (req, res) => {
  try {
    const doctorId = Number(req.params.doctorId);
    const appointmentDate = req.query.date;

    if (!Number.isInteger(doctorId)) {
      return res.status(400).json({ success: false, error: 'Invalid doctor id' });
    }

    if (!appointmentDate) {
      return res.status(400).json({ success: false, error: 'date query parameter is required' });
    }

    const doctor = await Doctor.findPublicById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }

    const slots = await getAvailableSlotsForDoctorAndDate({
      doctor,
      doctor_id: doctorId,
      appointment_date: appointmentDate
    });

    res.json({
      success: true,
      data: {
        doctor_id: doctorId,
        date: appointmentDate,
        availability_mode: doctor.availability_mode,
        available_slots: slots
      }
    });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get appointments for current patient
// @route   GET /api/appointments/patient
// @access  Private (patient)
const getPatientAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findByPatientId(req.user.id);
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Patient appointments error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Get appointments for current doctor
// @route   GET /api/appointments/doctor
// @access  Private (doctor)
const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findByDoctorId(req.user.id);
    res.json({ success: true, data: appointments });
  } catch (error) {
    console.error('Doctor appointments error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (doctor)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;
    const allowedStatuses = ['pending', 'confirmed', 'rejected', 'cancelled'];

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    const updated = await Appointment.updateStatus({ id, doctor_id: req.user.id, status });
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  createAppointment,
  getDoctorAvailableSlots,
  getPatientAppointments,
  getDoctorAppointments,
  updateAppointmentStatus
};
