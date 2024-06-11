const { database } = require('../../config/firebase');
const { sendResponse, handleError } = require('../helpers/responseHelper');
const { collection, getDocs } = require('firebase/firestore');

const getSeries = async () => {
  try {
    const seriesRef = collection(database, 'series');
    const seriesSnapshot = await getDocs(seriesRef);

    return seriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    throw new Error('Failed to get series data');
  }
};

exports.showSeries = async (req, res) => {
  try {
    const series = await getSeries();

    return sendResponse(
      res,
      200,
      true,
      'Series data retrieved successfully',
      series
    );
  } catch (error) {
    return handleError(res, error);
  }
};
