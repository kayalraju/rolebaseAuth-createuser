// 3rd-party module
const mongoose = require("mongoose");

// Database connection string
const MONGO_URI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_DATABASE_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

// Define database connection Funciton
module.exports = async () => {
  try {
    mongoose.connect(MONGO_URI);
    console.log(`Database connect successfully`);
  } catch (error) {
    console.log(`Database connection failed: ${error}`);
  }
};
