const adminRepo = require("../modules/auth/admin/repositories/admin.repositories");

// Utility function to handle email verification during user registration
async function handleRegistrationVerification(user, token, res) {
  // Check if the user has already verified their email
  if (user.isVerified) {
    // If already verified, send a 400 Bad Request response with an appropriate message
    return res.status(400).json({
      status: 400,
      message: "This email is already verified",
    });
  }

  // If not verified, update the user's status to verified
  user.isVerified = true;

  // Save the updated user details to the database
  await user.save();

  // Delete the email verification token from the database as it's no longer needed
  await adminRepo.deleteEmailVerificationToken({ _id: token._id });
}

// Export the utility functions so they can be used in other parts of the application
module.exports = {
  handleRegistrationVerification,
};
