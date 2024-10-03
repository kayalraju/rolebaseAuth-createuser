// import model
const UserModel = require("../model/admin.model");
const TokenModelForEmail = require("../model/emailToken.Model");
const crypto = require("crypto");

const adminRepository = {
  // Define checkUserByEmail repo method
  checkUserByEmailRepo: async (email) => {
    try {
      // 1. Grab the existing user by email
      const userRecords = await UserModel.findOne(email);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  // Define registration repo method
  registerRepo: async (userData) => {
    try {
      // 1. Create user into database for registration
      const userRecords = await UserModel.create(userData);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      return error;
    }
  },

  // Define create Token repo method for mail verification
  createTokenRepo: async (userId, type) => {
    try {
      // 1. Create a token for account verification
      const token = new TokenModelForEmail({
        _userId: userId,
        token: crypto.randomBytes(16).toString("hex"),
        type: type,
      });

      // 3. Save token into database after registration
      const createToken = await TokenModelForEmail.create(token);

      // 4. Response send to the controller
      return createToken;
    } catch (error) {
      // Rethrow the error to be handled by the controller
      throw new Error("Failed to generate new token");
    }
  },

  // Define checkUserByEmail repo method
  checkUserByNewEmailRepo: async (newEmail) => {
    try {
      // 1. Grab the existing user by newEmail
      const userRecords = await UserModel.findOne(newEmail);

      // 2. Response send to the controller
      return userRecords;
    } catch (error) {
      throw error;
    }
  },

  // Define findToken repo method
  async findToken({ userId, token }, type) {
    try {
      // 1. Find the token in the database using the provided token from the UR
      const verifiedToken = await TokenModelForEmail.findOne(
        userId,
        token,
        type
      );

      // 2. Response send to the controller
      return verifiedToken;
    } catch (error) {
      return error;
    }
  },

  // Define remove email verification token based on UserId after expire
  async deleteEmailVerificationToken(id) {
    try {
      // 1. Remove the token
      await TokenModelForEmail.deleteOne(id);
    } catch (error) {
      return error;
    }
  },
};

module.exports = adminRepository;
