class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Differentiate handled vs progaramming errors

    // Error.captureStackTrace(targetObject, constructorFunction)
    // Captures a clean stack trace on the error instance
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
