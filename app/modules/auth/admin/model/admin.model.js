// 3rd-party moduel
const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");

// Custom validation for email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
  return emailRegex.test(email);
};

// Create Admin Schema
const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "first name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      require: [true, "last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validateEmail, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    role: {
      type: String,
      default: "admin",
      enum: ["admin", "manager", "hr", "team-leader", "employee", "office-boy"], // Define the roles here
    },
    profileImage: {
      type: String,
      default: "uploads/profile/default-image.png",
    },
    isVerified: {
      type: Boolean,
      default: false, // Default value, change if needed
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Method to hash the password using bcrypt before saving the user
// This method will generate a salt and hash the provided plain-text password
userSchema.methods.generateHashPassword = async function (password) {
  try {
    // Generate a salt with a cost factor of 10
    const salt = await bcrypt.genSalt(10);

    // Hash the provided password using the generated salt
    const hashPassword = await bcrypt.hash(password, salt);

    // Return the hashed password to be saved
    return hashPassword;
  } catch (error) {
    // If an error occurs during the hashing process, throw a custom error message
    throw new Error("Error generating hash");
  }
};

// Method to compare the provided password with the stored hashed password during login. This method will return a boolean indicating whether the passwords match
userSchema.methods.validPassword = async function (password, hashedPassword) {
  try {
    // Compare the provided password with the stored hashed password
    const comparePassword = await bcrypt.compare(password, hashedPassword);

    // Return true if the password matches, otherwise return false
    return comparePassword;
  } catch (error) {
    // If an error occurs during the comparison process, throw a custom error message
    throw new Error("Error comparing passwords");
  }
};

const UserModel = mongoose.model("user", userSchema);
module.exports = UserModel;
