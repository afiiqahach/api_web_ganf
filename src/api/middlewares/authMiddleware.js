const admin = require('firebase-admin');
const serviceAccount = require('../../config/serviceAccountKey.json');
const { sendResponse } = require('../helpers/responseHelper');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function authenticateFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (!accessToken) {
    return sendResponse(res, 401, false, 'Unauthorized: No token provided');
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(accessToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    return sendResponse(res, 401, false, 'Unauthorized: No token provided');
  }
}

module.exports = authenticateFirebaseToken;
