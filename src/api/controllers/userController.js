const { database } = require('../../config/firebase');
const { sendResponse, handleError } = require('../helpers/responseHelper');
const { collection, doc, getDocs, getDoc } = require('firebase/firestore');

function formatUserData(userData, userId) {
  return {
    id: userId,
    photo: userData.photo,
    username: userData.username,
    email: userData.email,
    phoneNumber: userData.phoneNumber,
    role: userData.role,
  };
}

const getUsers = async () => {
  try {
    const userRef = collection(database, 'users');
    const userSnapshot = await getDocs(userRef);
    const userList = userSnapshot.docs.map((doc) =>
      formatUserData(doc.data(), doc.id)
    );

    return userList;
  } catch (error) {
    throw new Error('Failed to get users data');
  }
};

exports.showUsers = async (req, res) => {
  try {
    const users = await getUsers();

    return sendResponse(
      res,
      200,
      true,
      'User data retrieved successfully',
      users
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const getUserById = async (userId) => {
  try {
    const userDocRef = doc(database, 'users', userId);
    const userSnapshot = await getDoc(userDocRef);

    if (!userSnapshot.exists()) return null;

    return formatUserData(userSnapshot.data(), userId);
  } catch (error) {
    throw new Error('Failed to get user data');
  }
};

exports.showUserById = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return sendResponse(res, 400, false, 'Invalid or missing userId parameter');
  }

  try {
    const user = await getUserById(userId);
    if (!user) {
      return sendResponse(res, 404, false, 'User not found');
    } else {
      return sendResponse(
        res,
        200,
        true,
        'User data retrieved successfully',
        user
      );
    }
  } catch (error) {
    return handleError(res, error);
  }
};
