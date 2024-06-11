const { storage } = require('../config/firebase');
const { ref, uploadBytes, getDownloadURL } = require('firebase/storage');

const uploadImage = (file, folderName) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file) {
        reject(new Error('No image file'));
      }

      const metadata = {
        contentType: file.mimetype,
      };

      const storageRef = ref(
        storage,
        `${folderName}/${Date.now()}-${file.originalname}`
      );

      const snapshot = await uploadBytes(storageRef, file.buffer, metadata);
      const url = await getDownloadURL(snapshot.ref);

      resolve(url);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  uploadImage,
};
