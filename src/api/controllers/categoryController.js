const { database } = require('../../config/firebase');
const { sendResponse, handleError } = require('../helpers/responseHelper');
const { collection, getDocs, query, where } = require('firebase/firestore');

const categoryCollection = collection(database, 'categories');
const productCollection = collection(database, 'products');

// Function to get all categories
const getCategories = async () => {
  try {
    const snapshot = await getDocs(categoryCollection);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw new Error('Failed to get category data');
  }
};

// Function to get products by category
const getProductsByCategory = async (category) => {
  try {
    if (!category) throw new Error('Category parameter is missing or invalid');

    const categoryQuery =
      category === 'FnB'
        ? query(productCollection, where('category', 'in', ['Food', 'Drink']))
        : query(productCollection, where('category', '==', category));

    const snapshot = await getDocs(categoryQuery);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: `${data.series ? data.series + ' - ' : ''}${data.name}`, // Add series to product name if available
      };
    });
  } catch (error) {
    throw new Error('Failed to retrieve products');
  }
};

// Function to group categories by type and fetch products for each type
const getCategoriesByType = async () => {
  try {
    const categories = await getCategories();

    const groupedCategories = categories.reduce(
      (acc, { id, name, type = 'Other', photo }) => {
        const formattedType = type === 'FnB' ? 'Food and Beverage' : type;
        if (!acc[formattedType]) {
          acc[formattedType] = {
            type: formattedType,
            slug: type.toLowerCase(),
            photo,
            categories: [],
            products: [],
          };
        }
        acc[formattedType].categories.push({ id, name });
        return acc;
      },
      {}
    );

    for (const type in groupedCategories) {
      const categorySlug = type === 'Food and Beverage' ? 'FnB' : type;
      const products = await getProductsByCategory(categorySlug);
      groupedCategories[type].products = products;
    }

    return Object.values(groupedCategories);
  } catch (error) {
    throw new Error('Failed to get categories data');
  }
};

// Handler to show all categories
exports.showCategories = async (req, res) => {
  try {
    const categories = await getCategories();
    return sendResponse(
      res,
      200,
      true,
      'Category data retrieved successfully',
      categories
    );
  } catch (error) {
    return handleError(res, error);
  }
};

// Handler to show categories grouped by type
exports.showCategoriesByType = async (req, res) => {
  try {
    const categoriesByType = await getCategoriesByType();
    return sendResponse(
      res,
      200,
      true,
      'Category data retrieved successfully and grouped by type',
      categoriesByType
    );
  } catch (error) {
    return handleError(res, error);
  }
};
