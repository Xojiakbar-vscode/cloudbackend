const successResponse = (res, message, data = null, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, message, statusCode = 500, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

module.exports = { successResponse, errorResponse };