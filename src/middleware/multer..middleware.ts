import multer from 'multer';

// Store in memory for uploading directly to Cloudinary
const storage = multer.memoryStorage();
const uploadImage = multer({ storage });

export default uploadImage;
