module.exports = {
  // Define application configuration
  appRoot: {
    env: process.env.NODE_ENV || "development",
    isProd: process.env.NODE_ENV === "production",
    host: process.env.HOST || "localhost",
    port: process.env.PORT || 5000,
    appName: process.env.APP_NAME || "eShop",
    getAdminFolderName: process.env.ADMIN_FOLDER_NAME || "admin",
    getApiFolderName: process.env.API_FOLDER_NAME || "api",
    getUserFolderName: process.env.USER_FOLDER_NAME || "user",
  },
};
