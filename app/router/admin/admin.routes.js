// 3rd-party module
const express = require("express");
const routeLabel = require("route-label");

// import controller
const adminController = require("../../modules/auth/admin/controller/admin.controller");

// import others
const { uploadProfileImage } = require("../../middleware/multer");
const {
  adminRegistrationValidator,
  verifyEmailAndTokenValidator,
  loginValidator,
  addUserValidator,
} = require("../../helper/validation");
const { adminAuth } = require("../../middleware/auth");

// Initialize Express Router for creating router object
const router = express.Router();

// Wrap the express router with route-label package
const namedRouter = routeLabel(router);

// 1.Define Admin Registration Page route
namedRouter.get(
  "admin.registration-page",
  "/registration",
  adminController.adminRegistrationPage
);

// 2.Define Admin Registration API route
namedRouter.post(
  "admin.registration",
  "/registration",
  uploadProfileImage,
  adminRegistrationValidator,
  adminController.adminRegistration
);

// 2b.Define route to verify email with validation
namedRouter.get(
  "user.email-verification",
  "/confirmation/:id/:email/:token/:type",
  verifyEmailAndTokenValidator,
  adminController.verifyEmail
);

// 3.Define Admin Login Page route
namedRouter.get("admin.login-page", "/login", adminController.adminLoginPage);

// 3a.Define route for login
namedRouter.post(
  "admin.login",
  "/login",
  loginValidator,
  adminController.adminLogin
);

// 4.Defie Dashboard route
namedRouter.get("admin.dashboard", "/", adminAuth, adminController.dashboard);

// 5.Define Add user page route
namedRouter.get(
  "admin.add-user-page",
  "/add-user",
  adminAuth,
  adminController.addUserPage
);

// 5b. Define add user route
namedRouter.post(
  "admin.insert-user",
  "/add-user",
  uploadProfileImage,
  addUserValidator,
  adminController.inserNewUser
);

// 6.Define logout route
namedRouter.get("admin.logout", "/logout", adminController.logout);

module.exports = router;
