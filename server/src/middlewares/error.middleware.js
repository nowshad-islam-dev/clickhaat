const errorHandler = (err, req, res, next) => {
  console.error('❌Error:', err);

  if (!err.isOperational) {
    // Unexpected programming or library error
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong on our server.',
    });
  }

  // Operational, trusted error
  return res.status(err.statusCode).json({
    status: err.status, // fair or error
    message: err.message,
  });
};

module.exports = errorHandler;
