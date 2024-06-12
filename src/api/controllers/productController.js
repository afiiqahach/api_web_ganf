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
  query,
  where,
} = require('firebase/firestore');
const { uploadImage } = require('../../services/uploadToStorage');

const productRef = collection(database, 'products');
const categoryRef = collection(database, 'categories');

const formatProductData = (productData, productId) => {
  const formattedData = {
    id: productId,
    photo: productData.photo,
    name: productData.name,
    category: productData.category,
    series: productData.series || null,
    description: productData.description,
    url: productData.url || null,
    createdAt: productData.createdAt.toDate().toISOString(),
    updatedAt: productData.updatedAt.toDate().toISOString(),
  };
  return formattedData;
};

const getProducts = async () => {
  try {
    const snapshot = await getDocs(productRef);
    return snapshot.docs.map((doc) => formatProductData(doc.data(), doc.id));
  } catch (error) {
    throw new Error('Failed to retrieve products');
  }
};
const getProductsByCategory = async (category) => {
  try {
    // Create a query to check if the category exists
    const categoryQuery = query(categoryRef, where('type', '==', category));
    const categorySnapshot = await getDocs(categoryQuery);
    const categoryData = categorySnapshot.docs.map((doc) => doc.data());

    if (categoryData.length === 0) {
      throw new Error('Category not found.');
    }

    // Define the product query based on the category
    let productQuery;
    if (category === 'FnB') {
      productQuery = query(
        productRef,
        where('category', 'in', ['Food', 'Drink'])
      );
    } else {
      productQuery = query(productRef, where('category', '==', category));
    }

    // Fetch the products
    const productSnapshot = await getDocs(productQuery);
    const products = productSnapshot.docs.map((doc) =>
      formatProductData(doc.data(), doc.id)
    );

    // If the category is 'clothes', group products by series
    if (category.toLowerCase() === 'clothes') {
      const groupedBySeries = products.reduce((acc, product) => {
        const seriesName = product.series || 'Other';
        if (!acc[seriesName]) {
          acc[seriesName] = { seriesName, products: [] };
        }
        acc[seriesName].products.push(product);
        return acc;
      }, {});
      return Object.values(groupedBySeries);
    }

    return products;
  } catch (error) {
    throw new Error('Failed to retrieve products. ' + error.message);
  }
};

exports.showProducts = async (req, res) => {
  try {
    const { category } = req.query;
    const products = category
      ? await getProductsByCategory(category)
      : await getProducts();

    products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return sendResponse(
      res,
      200,
      true,
      'Product data retrieved successfully',
      products
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const getProductById = async (productId) => {
  try {
    const productDocRef = doc(database, 'products', productId);
    const productSnapshot = await getDoc(productDocRef);

    if (!productSnapshot.exists()) return null;

    return formatProductData(productSnapshot.data(), productId);
  } catch (error) {
    throw new Error('Failed to retrieve product');
  }
};

exports.showProductById = async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    return sendResponse(
      res,
      400,
      false,
      'ProductId parameter is missing or invalid'
    );
  }

  try {
    const product = await getProductById(productId);
    if (!product) {
      return sendResponse(res, 404, false, 'Product not found');
    }
    return sendResponse(
      res,
      200,
      true,
      'Product data retrieved successfully',
      product
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const storeProduct = async (productData) => {
  try {
    const newProductRef = await addDoc(productRef, productData);
    const newProductSnapshot = await getDoc(newProductRef);
    return formatProductData(newProductSnapshot.data(), newProductSnapshot.id);
  } catch (error) {
    throw new Error('Failed to create product');
  }
};

exports.createProduct = async (req, res) => {
  const { name, category, description } = req.body;
  const file = req.file;

  if (!file || !name || !category || !description) {
    return sendResponse(
      res,
      400,
      false,
      'Required fields are missing or invalid'
    );
  }

  try {
    const url = await uploadImage(file, 'products');
    const newProduct = await storeProduct({
      ...req.body,
      photo: url,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return sendResponse(
      res,
      201,
      true,
      'Product data created successfully',
      newProduct
    );
  } catch (error) {
    return handleError(res, error);
  }
};

const updateProductById = async (productId, updateData) => {
  try {
    const productDocRef = doc(database, 'products', productId);
    await updateDoc(productDocRef, updateData);
    return true;
  } catch (error) {
    throw new Error('Failed to update product');
  }
};

exports.updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { photo, name, category, description } = req.body;
  const file = req.file;

  if (!productId || !name || !category || !description) {
    return sendResponse(
      res,
      400,
      false,
      'Required fields are missing or invalid'
    );
  }

  try {
    const photoUrl = file ? await uploadImage(file, 'products') : photo;
    const result = await updateProductById(productId, {
      ...req.body,
      photo: photoUrl,
      updatedAt: new Date(),
    });

    if (result) {
      return sendResponse(res, 200, true, 'Product updated successfully');
    } else {
      return sendResponse(res, 404, false, 'Product not found');
    }
  } catch (error) {
    return handleError(res, error);
  }
};

const deleteProductById = async (productId) => {
  try {
    const productDocRef = doc(database, 'products', productId);
    await deleteDoc(productDocRef);
    return true;
  } catch (error) {
    throw new Error('Failed to delete product');
  }
};

exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return sendResponse(
      res,
      400,
      false,
      'Invalid or missing productId parameter'
    );
  }

  try {
    const result = await deleteProductById(productId);
    if (result) {
      return sendResponse(res, 200, true, 'Product deleted successfully');
    }
    return sendResponse(res, 404, false, 'Product not found');
  } catch (error) {
    return handleError(res, error);
  }
};