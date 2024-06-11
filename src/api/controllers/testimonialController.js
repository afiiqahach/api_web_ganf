const { database } = require('../../config/firebase');
const { sendResponse, handleError } = require('../helpers/responseHelper');
const {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
} = require('firebase/firestore');

const testimonialRef = collection(database, 'testimonials');

const formatTestimonialData = (productData, testimonialData, testimonialId) => {
  return {
    id: testimonialId,
    product: {
      id: testimonialData.productId,
      name: productData.name,
      photo: productData.photo,
    },
    rating: testimonialData.rating,
    customerName: testimonialData.customerName,
    review: testimonialData.review,
    createdAt: testimonialData.createdAt.toDate().toISOString(),
  };
};

const getProductData = async (productId) => {
  const productDocRef = doc(database, 'products', productId);
  const productSnapshot = await getDoc(productDocRef);
  return productSnapshot.exists() ? productSnapshot.data() : null;
};

const getTestimonials = async () => {
  try {
    const snapshot = await getDocs(testimonialRef);
    const testimonials = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const testimonialData = doc.data();
        const productData = await getProductData(testimonialData.productId);
        return formatTestimonialData(productData, testimonialData, doc.id);
      })
    );
    return testimonials;
  } catch (error) {
    throw new Error('Failed to get testimonials data');
  }
};

exports.showTestimonials = async (req, res) => {
  try {
    const testimonials = await getTestimonials();
    return sendResponse(
      res,
      200,
      true,
      'Testimonial data retrieved successfully',
      testimonials
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const getTestimonialById = async (testimonialId) => {
  try {
    const testimonialDocRef = doc(database, 'testimonials', testimonialId);
    const testimonialSnapshot = await getDoc(testimonialDocRef);

    if (!testimonialSnapshot.exists()) return null;

    const testimonialData = testimonialSnapshot.data();
    const productData = await getProductData(testimonialData.productId);

    return formatTestimonialData(productData, testimonialData, testimonialId);
  } catch (error) {
    throw new Error('Failed to get testimonial data');
  }
};

exports.showTestimonialById = async (req, res) => {
  const { testimonialId } = req.params;
  if (!testimonialId) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid or missing testimonialId parameter'
    );
  }

  try {
    const testimonial = await getTestimonialById(testimonialId);
    if (!testimonial) {
      return sendResponse(res, 404, false, 'Testimonial not found');
    }
    return sendResponse(
      res,
      200,
      true,
      'Testimonial data retrieved successfully',
      testimonial
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const storeTestimonial = async (testimonialData) => {
  try {
    const newTestimonialRef = await addDoc(testimonialRef, testimonialData);
    const newTestimonialSnapshot = await getDoc(newTestimonialRef);
    return { id: newTestimonialSnapshot.id, ...newTestimonialSnapshot.data() };
  } catch (error) {
    throw new Error('Failed to create testimonial');
  }
};

exports.createTestimonial = async (req, res) => {
  const testimonialData = req.body;
  testimonialData.rating = parseInt(testimonialData.rating, 10);

  if (
    !testimonialData.productId ||
    !testimonialData.rating ||
    !testimonialData.customerName ||
    !testimonialData.review
  ) {
    return sendResponse(res, 400, false, 'Invalid or missing fields');
  }

  if (testimonialData.rating < 1 || testimonialData.rating > 5) {
    return sendResponse(res, 400, false, 'Rating must be between 1 and 5');
  }

  try {
    const newTestimonial = await storeTestimonial({
      ...testimonialData,
      createdAt: new Date(),
    });
    const productData = await getProductData(testimonialData.productId);

    return sendResponse(
      res,
      201,
      true,
      'Testimonial data created successfully',
      formatTestimonialData(productData, newTestimonial, newTestimonial.id)
    );
  } catch (error) {
    return handleError(res, error);
  }
};
