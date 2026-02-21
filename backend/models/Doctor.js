// backend/models/Doctor.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class Doctor {
  // Create a new doctor
  static async create(doctorData) {
    const { name, email, phone, password, license_number, specialty, location } = doctorData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const query = `
      INSERT INTO doctors (name, email, phone, password_hash, license_number, specialty, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, name, email, phone, license_number, specialty, location, is_verified, is_approved, is_blocked, availability_mode, availability_slots, created_at
    `;
    const values = [name, email, phone, password_hash, license_number, specialty, location || null];

    try {
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        if (error.constraint === 'doctors_email_key') {
          throw new Error('Email already registered');
        } else if (error.constraint === 'doctors_phone_key') {
          throw new Error('Phone number already registered');
        } else if (error.constraint === 'doctors_license_number_key') {
          throw new Error('License number already registered');
        }
      }
      throw error;
    }
  }

  // Find doctor by email
  static async findByEmail(email) {
    const query = 'SELECT * FROM doctors WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Find doctor by phone
  static async findByPhone(phone) {
    const query = 'SELECT * FROM doctors WHERE phone = $1';
    const result = await pool.query(query, [phone]);
    return result.rows[0];
  }

  // Find doctor by license number
  static async findByLicenseNumber(licenseNumber) {
    const query = 'SELECT * FROM doctors WHERE license_number = $1';
    const result = await pool.query(query, [licenseNumber]);
    return result.rows[0];
  }

  // Find doctor by ID
  static async findById(id) {
    const query = `
      SELECT id, name, email, phone, license_number, specialty, location,
             is_verified, is_approved, is_blocked, availability_mode, availability_slots, created_at
      FROM doctors
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Find doctor by ID for public listing (verified + approved + not blocked)
  static async findPublicById(id) {
    const query = `
      SELECT id, name, specialty, location, is_verified, is_approved, availability_mode, availability_slots
      FROM doctors
      WHERE id = $1
        AND is_verified = true
        AND is_approved = true
        AND is_blocked = false
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // List all doctors (public fields)
  static async findAll() {
    const query = `
      SELECT id, name, specialty, location, is_verified, is_approved, availability_mode, availability_slots
      FROM doctors
      WHERE is_verified = true
        AND is_approved = true
        AND is_blocked = false
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async updateAvailability({ id, availability_mode, availability_slots }) {
    const query = `
      UPDATE doctors
      SET availability_mode = $1,
          availability_slots = $2::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, availability_mode, availability_slots, is_verified, is_approved
    `;
    const result = await pool.query(query, [availability_mode, JSON.stringify(availability_slots || []), id]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = Doctor;
