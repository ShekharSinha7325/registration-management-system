const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
  createRegistration,
  getRegistrations,
  getRegistration,
  updateRegistration,
  deleteRegistration,
} = require('../controllers/registrationController');
const validate = require('../middleware/validate');
const { protect, requireAdmin } = require('../middleware/auth');

const registrationRules = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('fatherName').notEmpty().withMessage("Father's name is required"),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isLength({ min: 7 }).withMessage('Valid phone number is required'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('qualification').notEmpty().withMessage('Qualification is required'),
  body('course').notEmpty().withMessage('Course is required'),
  body('membershipType').isIn(['student', 'faculty', 'general']).withMessage('Invalid membership type'),
  body('idProofNumber').notEmpty().withMessage('ID proof number is required'),
  body('address').notEmpty().withMessage('Address is required'),
];

// Public: anyone can submit a registration
router.post('/', registrationRules, validate, createRegistration);

// Admin only: viewing, updating, deleting registrations
router.get('/', protect, requireAdmin, getRegistrations);
router.get('/:id', protect, requireAdmin, getRegistration);
router.put('/:id', protect, requireAdmin, updateRegistration);
router.delete('/:id', protect, requireAdmin, deleteRegistration);

module.exports = router;
