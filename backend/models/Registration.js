const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    fatherName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    qualification: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    membershipType: {
      type: String,
      enum: ['student', 'faculty', 'general'],
      default: 'student',
    },
    idProofNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

registrationSchema.index({ email: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
