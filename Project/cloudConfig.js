const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuring cloudinary using environment variables (to keep sensitive data secure)
cloudinary.config({                                             
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Creating a new Cloudinary storage engine for multer
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'Wanderlust_DEV',
      allowedFormat: ["png", "jpg", "jpeg"],
    },
});


module.exports = {
    cloudinary, 
    storage,
};