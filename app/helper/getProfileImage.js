const path = require("path");
const fs = require("fs").promises;

async function getProfileImagePath(fullPath) {
  if (!fullPath) {
    return "/default-image.png"; // Return a default image path if no path is provided
  }

  try {
    // Check if the file exists
    await fs.access(fullPath);

    // Extract the part of the path relative to the 'public' folder
    const publicIndex = fullPath.indexOf("uploads"); // Assuming your profile images are in 'public/uploads'
    if (publicIndex === -1) {
      return "/default-image.png"; // Fallback if the path doesn't contain 'uploads'
    }

    const relativePath = fullPath.substring(publicIndex).replace(/\\/g, "/"); // Convert to a web-friendly path

    return `/${relativePath}`; // Ensure it starts with a slash for a valid relative path
  } catch (error) {
    console.error(`Error processing image path: ${error.message}`);
    return "/default-image.png"; // Return a default image path if there's an error
  }
}

module.exports = getProfileImagePath;
