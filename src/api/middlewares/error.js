const { handleError } = require('../helpers/responseHelper');

exports.error = (err, req, res, next) => {
  return handleError(res, err);
};
