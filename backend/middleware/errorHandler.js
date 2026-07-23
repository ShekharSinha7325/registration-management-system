module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate registration for this email/course' });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error',
  });
};
