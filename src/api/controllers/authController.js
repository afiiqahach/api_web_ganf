const { auth, database } = require('../../config/firebase');
const {
  signInWithEmailAndPassword,
  getAuth,
  updateEmail,
} = require('firebase/auth');
const { sendResponse, handleError } = require('../helpers/responseHelper');
const { doc, getDoc, setDoc } = require('firebase/firestore');
const { uploadImage } = require('../../services/uploadToStorage');

// Helper function to get user data from Firestore
const getUserData = async (userId) => {
  const userDocRef = doc(database, 'users', userId);
  const userSnapshot = await getDoc(userDocRef);
  return userSnapshot.exists() ? userSnapshot.data() : null;
};

// Log in user
exports.logInUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(res, 400, false, 'Email and password are required');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const { user } = userCredential;
    const accessToken = await user.getIdToken();

    return sendResponse(res, 200, true, 'User logged in successfully', {
      uid: user.uid,
      email: user.email,
      accessToken,
    });
  } catch (error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return sendResponse(res, 404, false, 'User not found');
      case 'auth/wrong-password':
        return sendResponse(res, 401, false, 'Incorrect password');
      case 'auth/invalid-email':
        return sendResponse(res, 400, false, 'Invalid email format');
      default:
        return sendResponse(res, 500, false, 'Login failed', error.message);
    }
  }
};

// Get user profile for logged in user
exports.getProfile = async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    return sendResponse(
      res,
      401,
      false,
      'Unauthorized',
      'No user is currently logged in'
    );
  }

  const userData = await getUserData(currentUser.uid);
  if (!userData) {
    return sendResponse(res, 404, false, 'User not found');
  }

  const formatUserData = {
    id: currentUser.uid,
    ...userData,
  };

  return sendResponse(
    res,
    200,
    true,
    'User profile retrieved successfully',
    formatUserData
  );
};

// Update user profile
exports.updateProfile = async (req, res) => {
  const { uid } = req.user;
  const { photo, username, phoneNumber, password, email, role } = req.body;
  const file = req.file;

  if (!username || !phoneNumber || !password || !email || !role) {
    return sendResponse(res, 400, false, 'Missing required fields');
  }

  if (password.length < 8) {
    return sendResponse(
      res,
      400,
      false,
      'Password must be at least 8 characters long'
    );
  }

  try {
    const photoUrl = file ? await uploadImage(file, 'users') : photo;
    const userData = await getUserData(uid);
    const { email: currentEmail, password: currentPassword } = userData;

    const auth = getAuth();
    const userCredential = await signInWithEmailAndPassword(
      auth,
      currentEmail,
      currentPassword
    );
    const currentUser = userCredential.user;

    await setDoc(doc(database, 'users', uid), {
      username,
      phoneNumber,
      photo: photoUrl,
      password,
      email,
      role,
    });

    await updateEmail(currentUser, email);

    return sendResponse(res, 200, true, 'User profile updated successfully');
  } catch (error) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return sendResponse(res, 400, false, 'Email already in use');
      case 'auth/invalid-email':
        return sendResponse(res, 400, false, 'Invalid email format');
      default:
        return handleError(res, 500, 'Update Profile Error', error.message);
    }
  }
};

// Log out user
exports.logOutUser = async (req, res) => {
  try {
    await auth.signOut();
    return sendResponse(res, 200, true, 'User logged out successfully');
  } catch (error) {
    return handleError(res, 500, 'Sign Out Error', error.message);
  }
};
