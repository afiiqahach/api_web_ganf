function sendResponse(res, statusCode, success, message, data = null) {
  return res.status(statusCode).json({
    status: statusCode,
    success: success,
    message: message,
    data: data,
    timestamp: new Date().toISOString(),
  });
}

function handleError(res, error) {
  console.error('Error: ', error);
  return sendResponse(res, 500, false, error.message);
}

module.exports = {
  sendResponse,
  handleError,
};
