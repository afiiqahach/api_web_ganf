const { database } = require('../../config/firebase');
const { sendResponse, handleError } = require('../helpers/responseHelper');
const {
  collection,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} = require('firebase/firestore');
const { uploadImage } = require('../../services/uploadToStorage');

// Reference to the promotions collection
const promotionRef = collection(database, 'promotions');

// Helper function to format promotion data
const formatPromotionData = (promotionData, promotionId) => ({
  id: promotionId,
  photo: promotionData.photo,
  description: promotionData.description || null,
  createdAt: promotionData.createdAt.toDate().toISOString(),
  updatedAt: promotionData.updatedAt.toDate().toISOString(),
});

// Get all promotions data
const getPromotions = async () => {
  try {
    const snapshot = await getDocs(promotionRef);
    return snapshot.docs.map((doc) => formatPromotionData(doc.data(), doc.id));
  } catch (error) {
    throw new Error('Failed to get promotions data');
  }
};

// Show all promotions
exports.showPromotions = async (req, res) => {
  try {
    const promotions = await getPromotions();
    return sendResponse(
      res,
      200,
      true,
      'Promotion data retrieved successfully',
      promotions
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Get promotion data by ID
const getPromotionById = async (promotionId) => {
  try {
    const promotionDocRef = doc(database, 'promotions', promotionId);
    const promotionSnapshot = await getDoc(promotionDocRef);
    if (!promotionSnapshot.exists()) return null;
    return formatPromotionData(promotionSnapshot.data(), promotionId);
  } catch (error) {
    throw new Error('Failed to get promotion data');
  }
};

exports.showPromotionById = async (req, res) => {
  const { promotionId } = req.params;
  if (!promotionId) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid or missing promotionId parameter'
    );
  }

  try {
    const promotion = await getPromotionById(promotionId);
    if (!promotion) {
      return sendResponse(res, 404, false, 'Promotion not found');
    }
    return sendResponse(
      res,
      200,
      true,
      'Promotion data retrieved successfully',
      promotion
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Store a new promotion
const storePromotion = async (promotionData) => {
  try {
    const newPromotionRef = await addDoc(promotionRef, promotionData);
    const newPromotionSnapshot = await getDoc(newPromotionRef);
    return formatPromotionData(
      newPromotionSnapshot.data(),
      newPromotionSnapshot.id
    );
  } catch (error) {
    throw new Error('Failed to create promotion');
  }
};

exports.createPromotion = async (req, res) => {
  const { description } = req.body;
  const file = req.file;

  if (!file) {
    return sendResponse(res, 400, false, 'Invalid or missing photo field');
  }

  try {
    const url = await uploadImage(file, 'promotions');
    const newPromotion = await storePromotion({
      description,
      photo: url,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return sendResponse(
      res,
      201,
      true,
      'Promotion data created successfully',
      newPromotion
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Update promotion data by ID
const updatePromotionById = async (promotionId, updateData) => {
  try {
    const promotionDocRef = doc(database, 'promotions', promotionId);
    await updateDoc(promotionDocRef, updateData);
    return true;
  } catch (error) {
    throw new Error('Failed to update promotion');
  }
};

exports.updatePromotion = async (req, res) => {
  const { promotionId } = req.params;
  const { photo, description } = req.body;
  const file = req.file;

  if (!promotionId) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid or missing promotionId parameter'
    );
  }

  try {
    const photoUrl = file ? await uploadImage(file, 'promotions') : photo;
    const result = await updatePromotionById(promotionId, {
      description,
      photo: photoUrl,
      updatedAt: new Date(),
    });

    if (result) {
      return sendResponse(res, 200, true, 'Promotion updated successfully');
    } else {
      return sendResponse(res, 404, false, 'Promotion not found');
    }
  } catch (error) {
    return handleError(res, error);
  }
};

// Delete a promotion by ID
const deletePromotionById = async (promotionId) => {
  try {
    const promotionDocRef = doc(database, 'promotions', promotionId);
    await deleteDoc(promotionDocRef);
    return true;
  } catch (error) {
    throw new Error('Failed to delete promotion');
  }
};

exports.deletePromotion = async (req, res) => {
  const { promotionId } = req.params;

  if (!promotionId) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid or missing promotionId parameter'
    );
  }

  try {
    const result = await deletePromotionById(promotionId);
    if (result) {
      return sendResponse(res, 200, true, 'Promotion deleted successfully');
    } else {
      return sendResponse(res, 404, false, 'Promotion not found');
    }
  } catch (error) {
    return handleError(res, error);
  }
};
