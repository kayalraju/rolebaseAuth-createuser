// Core module
const fs = require("fs").promises;
const path = require("path");

// 3rd-party module
const multer = require("multer");

// Set-up Storage Engine for Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath;

    // Set different destination paths based on file type
    switch (file.fieldname) {
      case "profileImage":
        uploadPath = path.join(__dirname, "../../public/uploads/profile");
        break;
      case "productImage":
        uploadPath = path.join(__dirname, "../../public/uploads/products");
        break;
      case "blogImage":
        uploadPath = path.join(__dirname, "../../public/uploads/blogs");
        break;
      default:
        uploadPath = path.join(__dirname, "../../public/uploads/others");
        break;
    }

    cb(null, uploadPath); // Set the destination directory dynamically
  },
  filename: (req, file, cb) => {
    // Generate a unique filename
    const uniqueName = `${file.fieldname}-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

// File filter to allow only specific image formats
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];

  // Check if the file type is one of the allowed image formats
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only png, jpg, and jpeg formats are allowed!"), false); // Reject the file
  }
};

// Initialize Multer with custom storage, file filter, and size limit
const uploadProfileImage = multer({
  storage, // Use the custom storage configuration
  fileFilter, // Apply the file filter for image formats
  limits: {
    fileSize: 2 * 1024 * 1024, // Limit file size to 2MB
  },
}).single("profileImage"); // Single file upload for profile picture

// For handling multiple file uploads, use this function
const uploadMultipleImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit each file to 10MB
  },
}).array(
  "productImage",
  3 // Allow up to 3 profile images
);

// Helper method to remove uploaded file(s) asynchronously
const removeUploadedFile = async (filePaths) => {
  try {
    // If filePaths is a string, treat it as a single file to be removed
    if (typeof filePaths === "string") {
      await fs.unlink(filePaths);
    }
    // If filePaths is an array, iterate over the array to remove each file
    else if (Array.isArray(filePaths)) {
      const removeFilePromises = filePaths.map((filePath) =>
        fs.unlink(filePath)
      );
      await Promise.all(removeFilePromises);
    }
    // If filePaths is neither a string nor an array, log an error
    else {
      throw new Error("Invalid file path(s) provided for removal");
    }
  } catch (err) {
    throw new Error(`Failed to remove the uploaded file(s): ${err.message}`);
  }
};

// Export the configured Multer middlewares
module.exports = {
  uploadProfileImage, // For single profile image upload
  uploadMultipleImages, // For multiple images (e.g., products, blogs)
  removeUploadedFile, // For removing uploaded files
};
