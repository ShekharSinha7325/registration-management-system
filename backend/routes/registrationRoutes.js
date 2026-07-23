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

const registrationRules = [
  body('fullName').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').isLength({ min: 7 }).withMessage('Valid phone number is required'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('course').notEmpty().withMessage('Course is required'),
];

router.route('/').post(registrationRules, validate, createRegistration).get(getRegistrations);
router
  .route('/:id')
  .get(getRegistration)
  .put(updateRegistration)
  .delete(deleteRegistration);

module.exports = router;
